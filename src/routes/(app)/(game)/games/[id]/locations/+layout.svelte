<script lang="ts">
	import { type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as locations from '$lib/remote/locations.remote';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { mdiPlus, mdiPencil, mdiDelete } from '@mdi/js';
	import Button from '$lib/components/Button.svelte';
	import Dialog from '$lib/components/Dialog.svelte';

	let { data, children }: { data: { gameId: string; isGm: boolean }; children: Snippet } = $props();

	const allQuery = locations.all();

	type LocNode = { id: string; name: string; depth: number };

	function buildTree(all: { id: string; parentId: string | null; name: string }[]): LocNode[] {
		const byParent = new Map<string | null, typeof all>();
		for (const loc of all) {
			const key = loc.parentId ?? null;
			if (!byParent.has(key)) byParent.set(key, []);
			byParent.get(key)!.push(loc);
		}
		const result: LocNode[] = [];
		const root = all.find((l) => l.parentId === null);
		if (!root) return result;
		function walk(parentId: string, depth: number) {
			for (const loc of byParent.get(parentId) ?? []) {
				result.push({ id: loc.id, name: loc.name, depth });
				walk(loc.id, depth + 1);
			}
		}
		walk(root.id, 0);
		return result;
	}

	const tree = $derived(buildTree(allQuery.current ?? []));
	const currentId = $derived(page.params.locationId);

	let confirmDeleteId = $state<string | null>(null);
	let dialogOpen = $state(false);

	function openDeleteDialog(id: string) {
		confirmDeleteId = id;
		dialogOpen = true;
	}

	$effect(() => {
		if (!dialogOpen) confirmDeleteId = null;
	});

	async function deleteLocation() {
		if (!confirmDeleteId) return;
		const id = confirmDeleteId;
		await locations.remove({ id });
		if (page.params.locationId === id) {
			await goto(localizeHref(`/games/${data.gameId}/locations`));
		}
	}
</script>

<div class="flex gap-4 h-[calc(100dvh-3.75rem)]">
	<aside class="w-44 shrink-0 flex flex-col gap-0.5 overflow-y-auto">
		{#each tree as node (node.id)}
			<div
				style="padding-left: {0.5 + node.depth * 1}rem"
				class={[
					"group flex items-center rounded pr-1",
					node.id === currentId ? "bg-gray-100" : "hover:bg-gray-50"
				]}
			>
				<a
					href={localizeHref(`/games/${data.gameId}/locations/${node.id}`)}
					class={[
						"flex-1 truncate py-1 text-xs",
						node.id === currentId ? "font-medium text-gray-900" : "text-gray-500 group-hover:text-gray-800"
					]}
				>
					{node.name}
				</a>

				{#if data.isGm}
					<div class="opacity-0 group-hover:opacity-100 flex items-center gap-0 shrink-0">
						<Button
							kind="ghost"
							icon={mdiPlus}
							iconProps={{ size: 13 }}
							class="p-0.5"
							href={localizeHref(`/games/${data.gameId}/locations/create?parentId=${node.id}`)}
						/>
						<Button
							kind="ghost"
							icon={mdiPencil}
							iconProps={{ size: 13 }}
							class="p-0.5"
							href={localizeHref(`/games/${data.gameId}/locations/${node.id}/edit`)}
						/>
						<Button
							kind="ghost"
							icon={mdiDelete}
							iconProps={{ size: 13 }}
							class="p-0.5"
							onclick={() => openDeleteDialog(node.id)}
						/>
					</div>
				{/if}
			</div>
		{/each}

		{#if data.isGm}
			<a
				href={localizeHref(`/games/${data.gameId}/locations/create${currentId ? `?parentId=${currentId}` : ''}`)}
				class="mt-1 block rounded py-1 px-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600"
			>
				+ New
			</a>
		{/if}
	</aside>

	<div class="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
		{@render children()}
	</div>
</div>

<Dialog
	bind:open={dialogOpen}
	message="Delete this location? This cannot be undone."
	confirmLabel="Delete"
	onconfirm={deleteLocation}
/>
