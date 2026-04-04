<script lang="ts">
	import { page } from '$app/state';
	import { getContext, onDestroy } from 'svelte';
	import { mdiArrowLeft, mdiPencil, mdiSend } from '@mdi/js';
	import * as locations from '$lib/remote/locations.remote';
	import * as messages from '$lib/remote/messages.remote';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import { type PageData } from './$types';
	import { WS_CONTEXT_KEY, type WsStore } from '$lib/ws/wsStore.svelte';
	import Tile from '$lib/components/Tile.svelte';
	import Button from '$lib/components/Button.svelte';
	import InputTextArea from '$lib/components/InputTextArea.svelte';
	import Form from '../form.svelte';

	let { data }: { data: PageData } = $props();

	const query = $derived(locations.index(page.params.locationId!));
	const messagesQuery = messages.index(page.params.locationId!);

	const ws = getContext<WsStore>(WS_CONTEXT_KEY);
	const unsub = ws.on('message:created', (payload) => {
		if (payload.locationId === page.params.locationId) {
			messagesQuery.refresh();
		}
	});
	onDestroy(unsub);

	const addFormState = getContext<{ open: boolean }>('addFormState');

	let editing = $state(false);
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
	<div class="flex flex-col gap-2">
		{#if !query.current.parentId}
			<!-- root location: no header -->
		{:else if editing}
			<Form action="edit" entity={query.current} bind:open={editing} />
		{:else}
			<div>
				<div class="flex items-center gap-1">
					<Button
						icon={mdiArrowLeft}
						kind="ghost"
						href={localizeHref(query.current.parentId
							? `/games/${data.gameId}/locations/${query.current.parentId}`
							: `/games/${data.gameId}`)}
					/>
					<h2 class="flex-1 text-sm font-semibold text-gray-900">{query.current.name}</h2>
					{#if data.isGm}
						<Button icon={mdiPencil} kind="ghost" onclick={() => editing = true} />
					{/if}
				</div>
				{#if query.current.description}
					<p class="text-xs text-gray-500 pl-1">{query.current.description}</p>
				{/if}
			</div>
		{/if}

		{#if query.current.children.length > 0}
			<div class="grid grid-cols-2 items-start gap-2">
				{#each query.current.children as child (child.id)}
					<Tile
						title={child.name}
						subtitle={child.description}
						href={localizeHref(`/games/${data.gameId}/locations/${child.id}`)}
					/>
				{/each}
			</div>
		{/if}

		{#if data.isGm && addFormState.open}
			<Form action="create" defaultParentId={page.params.locationId} bind:open={addFormState.open} />
		{/if}

		<div class="flex flex-col gap-2">
			{#if !messagesQuery.loading}
				{#if messagesQuery.current?.length === 0}
					<p class="text-sm text-gray-400">{m.message_no_messages()}</p>
				{:else}
					<div class="flex flex-col gap-2">
						{#each messagesQuery.current as msg (msg.id)}
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-medium text-gray-500">{msg.characterName ?? m.message_gm()}</span>
								<p class="text-sm text-gray-900">{msg.content}</p>
							</div>
						{/each}
					</div>
				{/if}
			{/if}

			<form onsubmit={sendMessage} class="flex items-end gap-2">
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
	</div>
{/if}
