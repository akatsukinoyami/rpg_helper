import { parseTheme } from '$lib/theme';
import { getLocale } from '$lib/paraglide/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	return {
		prefs: parseTheme(locals.theme),
		locale: getLocale()
	};
};
