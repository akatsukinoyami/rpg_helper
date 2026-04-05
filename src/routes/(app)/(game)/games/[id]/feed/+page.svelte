<script lang="ts">
	import { getContext, onDestroy } from 'svelte';
	import * as messages from '$lib/remote/messages.remote';
	import * as m from '$lib/paraglide/messages';
	import { WS_CONTEXT_KEY, type WsStore } from '$lib/ws/wsStore.svelte';
	import Message from '$lib/components/Message.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData & { isGm: boolean; myCharacterId: string | null } } = $props();

	const feedQuery = messages.feed();

	const ws = getContext<WsStore>(WS_CONTEXT_KEY);
	const unsub = ws.on('message:created', () => feedQuery.refresh());
	const unsubEdited = ws.on('message:edited', () => feedQuery.refresh());
	const unsubDeleted = ws.on('message:deleted', () => feedQuery.refresh());
	onDestroy(() => {
		unsub();
		unsubEdited();
		unsubDeleted();
	});
</script>

{#if feedQuery.loading}
	<p class="text-sm text-gray-400">Loading…</p>
{:else if !feedQuery.current?.length}
	<p class="text-sm text-gray-400">{m.message_no_messages()}</p>
{:else}
	<div class="flex flex-col gap-1.5">
		{#each feedQuery.current as msg (msg.id)}
			<Message {msg} view={data.msgView} isGm={data.isGm} myCharacterId={data.myCharacterId} />
		{/each}
	</div>
{/if}
