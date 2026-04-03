<script lang="ts">
	import { setContext, onDestroy } from 'svelte';
	import { WsStore, WS_CONTEXT_KEY } from '$lib/ws/wsStore.svelte';
	import type { Snippet } from 'svelte';
	import type { PageData } from './$types';

	let { data, children }: { data: PageData; children: Snippet } = $props();

	const ws = new WsStore(data.gameId);
	setContext(WS_CONTEXT_KEY, ws);
	onDestroy(() => ws.destroy());
</script>

{@render children()}
