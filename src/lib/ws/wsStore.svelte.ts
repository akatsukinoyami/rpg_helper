import { invalidateAll } from '$app/navigation';
import type { WsEvent, WsEventType, WsEventPayload } from './types';

export class WsStore {
	connected = $state(false);
	reconnecting = $state(false);

	#ws: WebSocket | null = null;
	#handlers = new Map<WsEventType, Set<(payload: unknown) => void>>();
	#attempt = 0;
	#destroyed = false;

	constructor(readonly gameId: string) {
		this.#connect();
	}

	#connect() {
		if (typeof window === 'undefined') return;

		const origin = window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws');
		const ws = new WebSocket(`${origin}/ws/game/${this.gameId}`);

		ws.onopen = () => {
			this.connected = true;
			this.reconnecting = false;
			if (this.#attempt > 0) invalidateAll();
			this.#attempt = 0;
		};

		ws.onmessage = ({ data }) => {
			try {
				this.#dispatch(JSON.parse(data as string));
			} catch {}
		};

		ws.onclose = () => {
			this.connected = false;
			this.#ws = null;
			if (!this.#destroyed) this.#reconnect();
		};

		this.#ws = ws;
	}

	#reconnect() {
		this.reconnecting = true;
		const delay = Math.min(1000 * 2 ** this.#attempt++ + Math.random() * 500, 30_000);
		setTimeout(() => this.#connect(), delay);
	}

	#dispatch(event: WsEvent) {
		this.#handlers.get(event.type)?.forEach((h) => h((event as any).payload));
	}

	on<T extends WsEventType>(type: T, handler: (payload: WsEventPayload<T>) => void): () => void {
		if (!this.#handlers.has(type)) this.#handlers.set(type, new Set());
		this.#handlers.get(type)!.add(handler as (payload: unknown) => void);
		return () => this.#handlers.get(type)?.delete(handler as (payload: unknown) => void);
	}

	destroy() {
		this.#destroyed = true;
		this.#ws?.close();
	}
}

export const WS_CONTEXT_KEY = Symbol('ws');
