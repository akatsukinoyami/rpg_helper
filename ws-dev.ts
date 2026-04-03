import type { Server } from 'node:http';
import type { Plugin } from 'vite';

export function wsPlugin(): Plugin {
	return {
		name: 'ws-dev',
		configureServer(server) {
			if (!server.httpServer) return;
			
			server.httpServer.once('listening', async () => {
				const { attachNodeWs } = await server.ssrLoadModule(
					'/src/lib/server/ws/node-adapter.ts'
				);
				attachNodeWs(server.httpServer as Server);
			});
		}
	};
}
