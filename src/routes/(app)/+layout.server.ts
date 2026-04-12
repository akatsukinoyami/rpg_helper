import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(303, `/sign_in?redirectTo=${encodeURIComponent(url.pathname)}`);
	return { user: locals.user, theme: locals.theme, msgView: locals.msgView };
};
