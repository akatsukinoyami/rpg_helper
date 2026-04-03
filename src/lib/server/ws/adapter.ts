import type { WsEvent } from '$lib/ws/types';

export interface IWsAdapter {
	broadcast(gameId: string, event: WsEvent): void;
}

let _adapter: IWsAdapter | null = null;

export function setWsAdapter(adapter: IWsAdapter) {
	_adapter = adapter;
}

/** Call from any remote function after a DB write */
export function broadcast(gameId: string, event: WsEvent): void {
	_adapter?.broadcast(gameId, event);
}
