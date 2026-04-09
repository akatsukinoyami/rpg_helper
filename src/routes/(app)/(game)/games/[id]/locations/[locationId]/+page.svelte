<script lang="ts">
	import { page } from '$app/state';
	import { getContext, onDestroy } from 'svelte';
	import * as locations from '$lib/remote/locations.remote';
	import * as messages from '$lib/remote/messages.remote';
	import * as m from '$lib/paraglide/messages';
	import { type PageData } from './$types';
	import { WS_CONTEXT_KEY, type WsStore } from '$lib/ws/wsStore.svelte';
	import Message, { type MessageData } from '$lib/partials/Message.svelte';
	import MessageForm, { type ReplyTarget } from '$lib/partials/MessageForm.svelte';

	let { data }: { data: PageData & { myCharacterId: string | null; isGm: boolean } } = $props();

	const query = $derived(locations.index(page.params.locationId!));
	const messagesQuery = $derived(messages.index(page.params.locationId!));

	const ws = getContext<WsStore>(WS_CONTEXT_KEY);
	const unsub = ws.on('message:created', (payload) => {
		if (payload.locationId === page.params.locationId) messagesQuery.refresh();
	});
	const unsubEdited = ws.on('message:edited', () => messagesQuery.refresh());
	const unsubDeleted = ws.on('message:deleted', () => messagesQuery.refresh());
	onDestroy(() => {
		unsub();
		unsubEdited();
		unsubDeleted();
	});

	let replyTo = $state<ReplyTarget | null>(null);

	function handleReply(msg: MessageData) {
		replyTo = { id: msg.id, characterName: msg.characterName, content: msg.content };
	}
</script>

{#if query.loading}
	<p class="text-sm text-gray-400">Loading…</p>
{:else if !query.current}
	<p class="text-sm text-gray-400">Location not found.</p>
{:else}
	<div class="flex flex-col h-full gap-2">
		<div class="shrink-0">
			<h2 class="flex-1 text-sm font-semibold text-gray-900">{query.current.name}</h2>
			{#if query.current.description}
				<p class="text-xs text-gray-500">{query.current.description}</p>
			{/if}
		</div>

		<div class="flex flex-col-reverse flex-1 overflow-y-auto gap-1.5 py-1">
			{#if !messagesQuery.loading}
				{#if messagesQuery.current?.length === 0}
					<p class="text-sm text-gray-400 self-center">{m.message_no_messages()}</p>
				{:else}
					{#each [...(messagesQuery.current ?? [])].reverse() as msg (msg.id)}
						<Message
							{msg}
							view={data.msgView}
							isGm={data.isGm}
							myCharacterId={data.myCharacterId}
							onReply={data.myCharacterId ? handleReply : undefined}
						/>
					{/each}
				{/if}
			{/if}
		</div>

		<div class="shrink-0">
			<MessageForm
				locationId={page.params.locationId!}
				myCharacterId={data.myCharacterId}
				{replyTo}
				onCancelReply={() => replyTo = null}
			/>
		</div>
	</div>
{/if}
