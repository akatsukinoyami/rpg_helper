<script lang="ts">
	import { page } from '$app/state';
	import { getContext, onDestroy } from 'svelte';
	import { mdiPencil, mdiSend } from '@mdi/js';
	import * as locations from '$lib/remote/locations.remote';
	import * as messages from '$lib/remote/messages.remote';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import { type PageData } from './$types';
	import { WS_CONTEXT_KEY, type WsStore } from '$lib/ws/wsStore.svelte';
	import Button from '$lib/components/Button.svelte';
	import InputTextArea from '$lib/components/InputTextArea.svelte';
	import Message from '$lib/components/Message.svelte';

	let { data }: { data: PageData } = $props();

	const query = $derived(locations.index(page.params.locationId!));
	const messagesQuery = $derived(messages.index(page.params.locationId!));

	const ws = getContext<WsStore>(WS_CONTEXT_KEY);
	const unsub = ws.on('message:created', (payload) => {
		if (payload.locationId === page.params.locationId) {
			messagesQuery.refresh();
		}
	});
	onDestroy(unsub);

	let messageContent = $state('');

	async function sendMessage(e: SubmitEvent) {
		e.preventDefault();
		const content = messageContent.trim();
		if (!content) return;
		await messages.send({ locationId: page.params.locationId!, content });
		messageContent = '';
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
					{#each [...messagesQuery.current].reverse() as msg (msg.id)}
						<Message {msg} view={data.msgView} />
					{/each}
				{/if}
			{/if}
		</div>

		<form onsubmit={sendMessage} class="shrink-0 flex items-end gap-2">
			<div class="flex-1">
				<InputTextArea
					placeholder={m.message_placeholder()}
					bind:value={messageContent}
					rows={2}
				/>
			</div>
			<Button type="submit" icon={mdiSend} kind="primary" />
		</form>
	</div>
{/if}
