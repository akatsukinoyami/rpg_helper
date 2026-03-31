import { redirect } from '@sveltejs/kit';
import { COOKIE_NAME, buildTheme, parseTheme, type Mode, type Scheme } from '$lib/theme';
import { getLocale, locales } from '$lib/paraglide/runtime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	return {
		prefs: parseTheme(locals.theme),
		// Pass server-determined locale so the client initializes correctly.
		// getLocale() here reads from paraglide's AsyncLocalStorage (set by
		// handleParaglide in hooks), which is always correct regardless of
		// whether the cookie is readable by JS.
		locale: getLocale()
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
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
				// Must NOT be httpOnly — paraglide reads this client-side via
				// document.cookie in getLocale(). httpOnly would make it invisible
				// to JS and the locale would fall back to 'en' after hydration.
				httpOnly: false
			});
		}

		redirect(303, url.pathname + '?saved=1');
	}
};
