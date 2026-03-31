import { redirect } from '@sveltejs/kit'
import { COOKIE_NAME, buildTheme, parseTheme, type Mode, type Scheme } from '$lib/theme'
import { locales } from '$lib/paraglide/runtime'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
	return { prefs: parseTheme(locals.theme) }
}

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData()

		const scheme = form.get('scheme') as Scheme
		const mode = form.get('mode') as Mode
		const locale = form.get('locale') as string

		const theme = buildTheme({ scheme, mode })
		cookies.set(COOKIE_NAME, theme, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })

		if (locale && (locales as readonly string[]).includes(locale)) {
			cookies.set('PARAGLIDE_LOCALE', locale, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				sameSite: 'lax'
			})
		}

		redirect(303, url.pathname + '?saved=1')
	}
}
