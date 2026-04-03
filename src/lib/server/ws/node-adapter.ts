import { WebSocketServer, type WebSocket } from 'ws';
import type { IncomingMessage, Server } from 'node:http';
import { auth } from '$lib/server/auth';
import { setWsAdapter } from './adapter';
import type { WsEvent } from '$lib/ws/types';

interface GameSocket extends WebSocket {
	userId: string;
	gameId: string;
}

const rooms = new Map<string, Set<GameSocket>>();

export function attachNodeWs(httpServer: Server): void {
	const wss = new WebSocketServer({ noServer: true });

	httpServer.on('upgrade', async (req: IncomingMessage, socket, head) => {
		const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
		if (!url.pathname.startsWith('/ws/game/')) return; // leave Vite HMR alone

		const gameId = url.pathname.split('/')[3];
		if (!gameId) { socket.destroy(); return; }

		const headers = new Headers(req.headers as Record<string, string>);
		const session = await auth.api.getSession({ headers });
		if (!session?.user) {
			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
			socket.destroy();
			return;
		}

		wss.handleUpgrade(req, socket, head, (ws) => {
			const gs = Object.assign(ws, { userId: session.user.id, gameId }) as GameSocket;
			wss.emit('connection', gs);
		});
	});

	wss.on('connection', (ws: GameSocket) => {
		if (!rooms.has(ws.gameId)) rooms.set(ws.gameId, new Set());
		rooms.get(ws.gameId)!.add(ws);
		ws.on('close', () => {
			rooms.get(ws.gameId)?.delete(ws);
			if (!rooms.get(ws.gameId)?.size) rooms.delete(ws.gameId);
		});
	});

	setWsAdapter({
		broadcast(gameId: string, event: WsEvent) {
			const data = JSON.stringify(event);
			rooms.get(gameId)?.forEach((ws) => {
				if (ws.readyState === ws.OPEN) ws.send(data);
			});
		}
	});
}
