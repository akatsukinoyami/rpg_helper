import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { getTextDirection } from '$lib/paraglide/runtime'
import { paraglideMiddleware } from '$lib/paraglide/server'
import { auth } from '$lib/server/auth'

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		})
	})

const handleAuth: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api/auth')) {
		return auth.handler(event.request)
	}

	const sessionData = await auth.api.getSession({ headers: event.request.headers })
	event.locals.user = sessionData?.user ?? null
	event.locals.session = sessionData?.session ?? null
	return resolve(event)
}

const VALID_THEMES = new Set([
	'github-light', 'github-dark', 'github-system',
	'catppuccin-light', 'catppuccin-dark', 'catppuccin-system',
	'gruvbox-light', 'gruvbox-dark', 'gruvbox-system'
])

const handleTheme: Handle = ({ event, resolve }) => {
	const raw = event.cookies.get('rph_theme') ?? ''
	const theme = VALID_THEMES.has(raw) ? raw : 'github-light'
	event.locals.theme = theme
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%rph.theme%', theme)
	})
}

export const handle = sequence(handleParaglide, handleAuth, handleTheme)
