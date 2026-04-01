import { form, getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { verifyPassword } from 'better-auth/crypto';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { account, user } from '$lib/server/db/schema';
import { COOKIE_NAME, buildTheme } from '$lib/theme';
import { locales } from '$lib/paraglide/runtime';
import type { Mode, Scheme } from '$lib/theme';

// ── Theme ─────────────────────────────────────────────────────────────────────

const ThemeSchema = v.object({
	scheme: v.string(),
	mode: v.string(),
	locale: v.optional(v.string())
});

export const saveTheme = form(ThemeSchema, async (data) => {
	const { cookies } = getRequestEvent();

	const theme = buildTheme({ scheme: data.scheme as Scheme, mode: data.mode as Mode });
	cookies.set(COOKIE_NAME, theme, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });

	if (data.locale && (locales as readonly string[]).includes(data.locale)) {
		cookies.set('PARAGLIDE_LOCALE', data.locale, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			sameSite: 'lax',
			httpOnly: false
		});
	}

	// Return success so the component can trigger a full page reload
	// (needed to re-apply the theme from the updated cookie)
	return { success: true };
});

// ── Account ───────────────────────────────────────────────────────────────────

const AccountSchema = v.object({
	image: v.optional(v.string()),
	name: v.optional(v.string()),
	email: v.optional(v.string()),
	newPassword: v.optional(v.string()),
	confirmPassword: v.optional(v.string()),
	currentPassword: v.optional(v.string())
});

async function checkPassword(userId: string, password: string): Promise<boolean> {
	const [cred] = await db
		.select({ password: account.password })
		.from(account)
		.where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
		.limit(1);

	if (!cred?.password) return false;
	try {
		return await verifyPassword({ hash: cred.password, password });
	} catch {
		return false;
	}
}

export const saveAccount = form(AccountSchema, async (data) => {
	const { locals, url, request } = getRequestEvent();
	const currentUser = locals.user!;

	const image = data.image?.trim() || null;
	const name = data.name?.trim() || null;
	const email = data.email?.trim().toLowerCase() || null;
	const newPassword = data.newPassword || null;
	const confirmPassword = data.confirmPassword || null;
	const currentPassword = data.currentPassword || '';

	const changeImage = image !== currentUser.image;
	const changeName = !!name && name !== currentUser.name;
	const changeEmail = !!email && email !== currentUser.email;
	const changePassword = !!newPassword;

	if (!changeImage && !changeName && !changeEmail && !changePassword)
		redirect(303, url.pathname + '?saved=1');

	if (changePassword) {
		if (newPassword !== confirmPassword) return { accountError: 'mismatch' as const };
		if (newPassword!.length < 8) return { accountError: 'too_short' as const };
	}

	if (changeImage) {
		await db.update(user).set({ image, updatedAt: new Date() }).where(eq(user.id, currentUser.id));
	}

	if (changeName || changeEmail || changePassword) {
		if (!(await checkPassword(currentUser.id, currentPassword)))
			return { accountError: 'wrong_password' as const };

		if (changeName) {
			const [taken] = await db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.name, name!))
				.limit(1);

			if (taken) return { accountError: 'name_taken' as const };
			await auth.api.updateUser({ body: { name: name! }, headers: request.headers });
		}

		if (changeEmail) {
			const [taken] = await db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.email, email!))
				.limit(1);

			if (taken) return { accountError: 'email_taken' as const };

			await db
				.update(user)
				.set({ email: email!, updatedAt: new Date() })
				.where(eq(user.id, currentUser.id));
		}

		if (changePassword) {
			await auth.api.changePassword({
				body: { currentPassword, newPassword: newPassword! },
				headers: request.headers
			});
		}
	}

	redirect(303, url.pathname + '?saved=1');
});
