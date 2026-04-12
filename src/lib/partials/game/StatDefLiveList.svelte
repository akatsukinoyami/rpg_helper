<script lang="ts">
	import ButtonSmall from '$lib/components/ButtonSmall.svelte';
	import { mdiPencil, mdiCheck, mdiClose } from '@mdi/js';
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';
	import * as gameRemote from '$lib/remote/games.remote';
	import type { StatDef } from '$lib/server/db/schema';

	let { statDefs = [] as StatDef[] } = $props();

	let editingKey = $state<string | null>(null);
	let editLabel = $state('');
	let editColor = $state('');
	let editSortOrder = $state(0);
	let editPending = $state(false);

	function startEdit(def: StatDef) {
		editingKey = def.key;
		editLabel = def.label;
		editColor = def.color;
		editSortOrder = def.sortOrder;
	}

	async function saveEdit() {
		if (!editingKey || editPending) return;
		editPending = true;
		gameRemote
			.editStatDef({ key: editingKey, label: editLabel, color: editColor, sortOrder: editSortOrder })
			.then(() => editingKey = null)
			.finally(() => editPending = false);
	}
</script>

{#snippet vitality(isVital: boolean)}
	{#if isVital}
		<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">vital</span>
	{:else}
		<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">stat</span>
	{/if}
{/snippet}

{#if statDefs.length > 0}
	<div class="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden text-xs">
		{#each [...statDefs].sort((a, b) => a.sortOrder - b.sortOrder) as def (def.key)}
			{#if editingKey === def.key}
				<div class="flex items-center gap-2 px-3 py-2 bg-indigo-50">
					<span class="font-mono text-gray-400 w-20 shrink-0">{def.key}</span>
					<input
						class={[fieldColors, fieldSpacing, 'rounded border flex-1 outline-none']}
						bind:value={editLabel}
						placeholder="Label"
					/>
					<input
						type="color"
						class="h-7 w-9 rounded border border-gray-300 cursor-pointer p-0.5"
						bind:value={editColor}
					/>
					<input
						type="number"
						class={[fieldColors, fieldSpacing, 'rounded border w-14 outline-none']}
						bind:value={editSortOrder}
					/>
					<ButtonSmall icon={mdiCheck} class="hover:text-green-600" onclick={saveEdit} disabled={editPending} />
					<ButtonSmall icon={mdiClose} onclick={() => (editingKey = null)} />
				</div>
			{:else}
				<div class="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50">
					<span class="font-mono text-gray-400 w-20 shrink-0">{def.key}</span>
					<span class="flex-1">{def.label}</span>
					{@render vitality(def.isVital)}
					<span
						class="h-4 w-4 rounded-full border border-gray-200 shrink-0"
						style:background-color={def.color}
					></span>
					<span class="text-gray-400 w-4 text-center shrink-0">{def.sortOrder}</span>
					<ButtonSmall icon={mdiPencil} onclick={() => startEdit(def)} />
				</div>
			{/if}
		{/each}
	</div>
{:else}
	<p class="text-xs text-gray-400">No stat definitions.</p>
{/if}
