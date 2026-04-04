<script lang="ts">
	import { mdiPencil, mdiDelete } from '@mdi/js';
	import { type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as characters from '$lib/remote/characters.remote';

	interface Props { 
		data: { 
			gameId: string; 
			isGm: boolean; 
			userId: string 
		}; 
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const allQuery = characters.indexAll();

	const statusColor = {
		approved: 'bg-green-500',
		pending: 'bg-yellow-400',
		rejected: 'bg-red-500'
	} as const;

	const currentId = $derived(page.params.charId);

	const canEdit = (char: { userId: string }) => data.isGm || char.userId === data.userId;
	const hasOwnChar = $derived(
		(allQuery.current ?? []).some((c) => c.userId === data.userId)
	);

	let confirmDeleteId = $state<string | null>(null);
	let dialogOpen = $state(false);

	function openDeleteDialog(id: string) {
		confirmDeleteId = id;
		dialogOpen = true;
	}

	$effect(() => {
		if (!dialogOpen) confirmDeleteId = null;
	});

	async function deleteCharacter() {
		if (!confirmDeleteId) return;
		const id = confirmDeleteId;
		await characters.deleteChar({ gameId: data.gameId, characterId: id });
		if (page.params.charId === id) {
			await goto(localizeHref(`/games/${data.gameId}/characters`));
		}
	}
</script>

<div class="flex gap-4 h-[calc(100dvh-3.75rem)]">
	<aside class="w-48 shrink-0 flex flex-col gap-0.5 overflow-y-auto">
		{#each allQuery.current ?? [] as char (char.id)}
			<div
				class={[
					"group flex items-center gap-2 rounded px-2 py-1.5 pr-1",
					char.id === currentId ? "bg-gray-100" : "hover:bg-gray-50"
				]}
			>
				<a
					href={localizeHref(`/games/${data.gameId}/characters/${char.id}`)}
					class="flex-1 flex items-center gap-2 min-w-0"
				>
					<div class="relative shrink-0">
						{#if char.image}
							<img src={char.image} alt="" class="h-6 w-6 rounded-full object-cover" />
						{:else}
							<div class="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-semibold text-indigo-600">
								{char.name[0].toUpperCase()}
							</div>
						{/if}
						<div class="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-white {statusColor[char.status]}"></div>
					</div>
					<span class={[
						"truncate text-xs",
						char.id === currentId ? "font-medium text-gray-900" : "text-gray-600 group-hover:text-gray-800"
					]}>
						{char.name}
					</span>
				</a>

				{#if canEdit(char)}
					<div class="opacity-0 group-hover:opacity-100 flex items-center shrink-0 gap-0">
						<Button
							kind="ghost"
							icon={mdiPencil}
							iconProps={{ size: 13 }}
							class="p-0.5"
							href={localizeHref(`/games/${data.gameId}/characters/${char.id}/edit`)}
						/>
						<Button
							kind="ghost"
							icon={mdiDelete}
							iconProps={{ size: 13 }}
							class="p-0.5"
							onclick={() => openDeleteDialog(char.id)}
						/>
					</div>
				{/if}
			</div>
		{/each}

		{#if data.isGm || !hasOwnChar}
			<a
				href={localizeHref(`/games/${data.gameId}/characters/new`)}
				class="mt-1 block rounded py-1 px-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600"
			>
				+ New
			</a>
		{/if}
	</aside>

	<div class="flex-1 min-w-0 overflow-y-auto">
		{@render children()}
	</div>
</div>

<Dialog
	bind:open={dialogOpen}
	message="Delete this character? This cannot be undone."
	confirmLabel="Delete"
	onconfirm={deleteCharacter}
/>
