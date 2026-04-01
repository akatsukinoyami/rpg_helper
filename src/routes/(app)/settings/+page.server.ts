import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { verifyPassword } from 'better-auth/crypto';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { account, user } from '$lib/server/db/schema';
import { COOKIE_NAME, buildTheme, parseTheme, type Mode, type Scheme } from '$lib/theme';
import { getLocale, locales } from '$lib/paraglide/runtime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	return {
		prefs: parseTheme(locals.theme),
		locale: getLocale()
	};
};

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

export const actions: Actions = {
	theme: async ({ request, cookies, url }) => {
		const form = await request.formData();

		const scheme = form.get('scheme') as Scheme;
		const mode = form.get('mode') as Mode;
		const locale = form.get('locale') as string;

		const theme = buildTheme({ scheme, mode });
		cookies.set(COOKIE_NAME, theme, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });

		if (locale && (locales as readonly string[]).includes(locale)) {
			cookies.set('PARAGLIDE_LOCALE', locale, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				sameSite: 'lax',
				httpOnly: false
			});
		}

		redirect(303, url.pathname + '?saved=1');
	},

	account: async ({ locals, request, url }) => {
		const form = await request.formData();
		const currentUser = locals.user!;

		const image = ((form.get('image') as string) || '').trim() || null;
		const name = (form.get('name') as string)?.trim() || null;
		const email = (form.get('email') as string)?.trim().toLowerCase() || null;
		const newPassword = (form.get('newPassword') as string) || null;
		const confirmPassword = (form.get('confirmPassword') as string) || null;
		const currentPassword = (form.get('currentPassword') as string) || '';

		const changeImage = image !== currentUser.image;
		const changeName = !!name && name !== currentUser.name;
		const changeEmail = !!email && email !== currentUser.email;
		const changePassword = !!newPassword;

		if (!changeImage && !changeName && !changeEmail && !changePassword)
			redirect(303, url.pathname + '?saved=1');

		// Validate new password before touching the DB
		if (changePassword) {
			if (newPassword !== confirmPassword)
				return fail(400, { accountError: 'mismatch' as const });
			if (newPassword!.length < 8)
				return fail(400, { accountError: 'too_short' as const });
		}

		if (changeImage) {
			await db.update(user).set({ image, updatedAt: new Date() }).where(eq(user.id, currentUser.id));
		}

		if (changeName || changeEmail || changePassword) {
			if (!(await checkPassword(currentUser.id, currentPassword)))
				return fail(400, { accountError: 'wrong_password' as const });

			if (changeName) {
				const [taken] = await db.select({ id: user.id }).from(user).where(eq(user.name, name!)).limit(1);
				if (taken) return fail(400, { accountError: 'name_taken' as const });
				await auth.api.updateUser({ body: { name: name! }, headers: request.headers });
			}

			if (changeEmail) {
				const [taken] = await db.select({ id: user.id }).from(user).where(eq(user.email, email!)).limit(1);
				if (taken) return fail(400, { accountError: 'email_taken' as const });
				await db.update(user).set({ email: email!, updatedAt: new Date() }).where(eq(user.id, currentUser.id));
			}

			if (changePassword) {
				await auth.api.changePassword({ body: { currentPassword, newPassword: newPassword! }, headers: request.headers });
			}
		}

		redirect(303, url.pathname + '?saved=1');
	}
};
