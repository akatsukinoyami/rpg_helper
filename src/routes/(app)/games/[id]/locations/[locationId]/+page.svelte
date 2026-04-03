<script lang="ts">
	import { page } from '$app/state';
	import { mdiArrowLeft, mdiPencil } from '@mdi/js';
	import { index } from '$lib/remote/locations.remote';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { type PageData } from './$types';
	import Tile from '$lib/components/Tile.svelte';
	import Button from '$lib/components/Button.svelte';
	import Form from '../form.svelte';

	let { data }: { data: PageData } = $props();

	const query = $derived(index(page.params.locationId));
	let editing = $state(false);
</script>

{#if query.loading}
	<p class="text-sm text-gray-400">Loading…</p>
{:else if !query.current}
	<p class="text-sm text-gray-400">Location not found.</p>
{:else}
	<div class="flex flex-col gap-4">
		{#if editing}
			<Form action="edit" entity={query.current} bind:open={editing} />
		{:else}
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<Button
						icon={mdiArrowLeft}
						kind="ghost"
						href={localizeHref('parentId' in query.current && query.current.parentId
							? `/games/${data.gameId}/locations/${query.current.parentId}`
							: `/games/${data.gameId}/locations`)}
					/>
					<h2 class="flex-1 text-lg font-semibold text-gray-900">{query.current.name}</h2>
					{#if data.isGm}
						<Button icon={mdiPencil} kind="ghost" onclick={() => editing = true} />
					{/if}
				</div>
				{#if query.current.description}
					<p class="text-sm text-gray-600">{query.current.description}</p>
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
	</div>
{/if}
