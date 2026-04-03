import { setWsAdapter } from './adapter';

type BunServer = { publish(topic: string, data: string): void };

export function attachBunWs(server: BunServer): void {
	setWsAdapter({
		broadcast: (gameId, event) => server.publish(gameId, JSON.stringify(event))
	});
}
