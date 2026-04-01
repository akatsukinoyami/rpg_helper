import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { COOKIE_NAME, buildTheme, parseTheme, type Mode, type Scheme } from '$lib/theme';
import { getLocale, locales } from '$lib/paraglide/runtime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	return {
		prefs: parseTheme(locals.theme),
		locale: getLocale()
	};
};

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

	avatar: async ({ locals, request, url }) => {
		const form = await request.formData();
		const image = ((form.get('image') as string) || '').trim() || null;

		await db
			.update(user)
			.set({ image, updatedAt: new Date() })
			.where(eq(user.id, locals.user!.id));

		redirect(303, url.pathname + '?saved=1');
	}
};
