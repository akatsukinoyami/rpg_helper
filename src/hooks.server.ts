import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { auth } from '$lib/server/auth';
import { attachBunWs } from '$lib/server/ws/bun-adapter';
import * as m from '$lib/paraglide/messages';

const handleParaglide: Handle = ({ event, resolve }) => {
	// Pass a body-less request to Paraglide — it only needs URL + headers for locale
	// detection (cookie strategy). Sharing event.request directly would disturb its
	// body stream, breaking binary form deserialization on POST requests.
	// Strip Sec-Fetch-Dest so Paraglide doesn't redirect to /{locale}/... URLs.
	const headers = new Headers(event.request.headers);
	headers.delete('Sec-Fetch-Dest');

	const paraglideReq = new Request(event.request.url, { method: 'GET', headers });

	return paraglideMiddleware(paraglideReq, ({ locale }) => {
		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});
};

const handleAuth: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api/auth')) {
		return auth.handler(event.request);
	}

	const sessionData = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = sessionData?.user ?? null;
	event.locals.session = sessionData?.session ?? null;
	return resolve(event);
};

const themeTypes = ['light', 'dark', 'system'];
const themeStyles = ['github', 'catppuccin', 'gruvbox'];
const VALID_THEMES = new Set(
	themeTypes.flatMap((type) => themeStyles.map((style) => `${style}-${type}`))
);

const handleTheme: Handle = ({ event, resolve }) => {
	const raw = event.cookies.get('rph_theme') ?? '';
	const theme = VALID_THEMES.has(raw) ? raw : 'github-light';
	event.locals.theme = theme;

	const rawView = event.cookies.get('rph_msg_view') ?? '';
	event.locals.msgView = rawView === 'forum' ? 'forum' : 'compact';

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%rph.theme%', theme)
	});
};

const handleWs: Handle = ({ event, resolve }) => {
	const url = new URL(event.request.url);

	if (
		url.pathname.startsWith('/ws/game/') &&
		event.request.headers.get('upgrade') === 'websocket'
	) {
		if (!event.locals.session?.user) {
			return new Response(m.auth_error_unauthorized(), { status: 401 });
		}

		const gameId = url.pathname.split('/')[3];
		if (!gameId) return new Response(m.auth_error_bad_request(), { status: 400 });

		const server = (event.platform as any)?.server;
		if (!server) return new Response(m.auth_error_upgrade_failed(), { status: 503 });

		attachBunWs(server);

		const upgraded = server.upgrade((event.platform as any).request, {
			data: { userId: event.locals.session.user.id, gameId }
		});
		return upgraded
			? new Response(null, { status: 101 })
			: new Response(m.auth_error_upgrade_failed(), { status: 426 });
	}

	return resolve(event);
};

export const handle = sequence(handleParaglide, handleAuth, handleTheme, handleWs);

interface BunWsSocket {
	data: { userId: string; gameId: string };
	subscribe(topic: string): void;
	unsubscribe(topic: string): void;
}

export const websocket = {
	open(ws: BunWsSocket) {
		ws.subscribe(ws.data.gameId);
	},
	close(ws: BunWsSocket) {
		ws.unsubscribe(ws.data.gameId);
	},
	message(_ws: BunWsSocket, _msg: string | Buffer) {}
};
