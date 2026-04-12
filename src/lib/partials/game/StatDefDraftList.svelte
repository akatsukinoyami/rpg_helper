<script lang="ts" module>
	export type Draft = {
		key: string;
		label: string;
		isVital: boolean;
		color: string;
		sortOrder: number;
	};
</script>

<script lang="ts">
	import ButtonSmall from '$lib/components/ButtonSmall.svelte';
	import Button from '$lib/components/Button.svelte';
	import { mdiPencil, mdiDelete, mdiCheck, mdiClose, mdiPlus } from '@mdi/js';
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';

	let { draftDefs = $bindable<Draft[]>([]) } = $props();

	// ── Add form ──────────────────────────────────────────────────────────────
	let addOpen = $state(false);
	let addKey = $state('');
	let addLabel = $state('');
	let addIsVital = $state(false);
	let addColor = $state('#6366f1');

	function submitAdd() {
		const key = addKey.trim();
		if (!key || !addLabel.trim() || draftDefs.some((d) => d.key === key)) return;
		draftDefs = [
			...draftDefs,
			{ key, label: addLabel.trim(), isVital: addIsVital, color: addColor, sortOrder: draftDefs.length + 1 }
		];
		addOpen = false;
		addKey = '';
		addLabel = '';
		addIsVital = false;
		addColor = '#6366f1';
	}

	function remove(key: string) {
		draftDefs = draftDefs.filter((d) => d.key !== key);
	}

	// ── Inline edit ───────────────────────────────────────────────────────────
	let editingKey = $state<string | null>(null);
	let editLabel = $state('');
	let editColor = $state('');
	let editSortOrder = $state(0);

	function startEdit(d: Draft) {
		editingKey = d.key;
		editLabel = d.label;
		editColor = d.color;
		editSortOrder = d.sortOrder;
	}

	function saveEdit() {
		if (!editingKey) return;
		const key = editingKey;
		draftDefs = draftDefs.map((d) =>
			d.key === key ? { ...d, label: editLabel, color: editColor, sortOrder: editSortOrder } : d
		);
		editingKey = null;
	}
</script>

{#snippet vitality(isVital: boolean)}
	{#if isVital}
		<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">vital</span>
	{:else}
		<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">stat</span>
	{/if}
{/snippet}

{#if draftDefs.length > 0}
	<div class="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden text-xs">
		{#each [...draftDefs].sort((a, b) => a.sortOrder - b.sortOrder) as d (d.key)}
			{#if editingKey === d.key}
				<div class="flex items-center gap-2 px-3 py-2 bg-indigo-50">
					<span class="font-mono text-gray-400 w-20 shrink-0">{d.key}</span>
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
					<ButtonSmall icon={mdiCheck} class="hover:text-green-600" onclick={saveEdit} />
					<ButtonSmall icon={mdiClose} onclick={() => (editingKey = null)} />
				</div>
			{:else}
				<div class="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50">
					<span class="font-mono text-gray-400 w-20 shrink-0">{d.key}</span>
					<span class="flex-1">{d.label}</span>
					{@render vitality(d.isVital)}
					<span
						class="h-4 w-4 rounded-full border border-gray-200 shrink-0"
						style:background-color={d.color}
					></span>
					<span class="text-gray-400 w-4 text-center shrink-0">{d.sortOrder}</span>
					<ButtonSmall icon={mdiPencil} onclick={() => startEdit(d)} />
					<ButtonSmall icon={mdiDelete} class="hover:text-red-600" onclick={() => remove(d.key)} />
				</div>
			{/if}
		{/each}
	</div>
{:else}
	<p class="text-xs text-gray-400">No stats defined — the game will start without any stat tracking.</p>
{/if}

{#if addOpen}
	<div class="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
		<div class="flex items-end gap-2 flex-wrap text-xs">
			<div class="flex flex-col gap-0.5">
				<label for="sd-add-key" class="text-[10px] text-gray-500 uppercase tracking-wide">Key</label>
				<input
					id="sd-add-key"
					class={[fieldColors, fieldSpacing, 'rounded border w-28 outline-none font-mono']}
					bind:value={addKey}
					placeholder="hp, str…"
					pattern="[a-zA-Z][a-zA-Z0-9]*"
				/>
			</div>
			<div class="flex flex-col gap-0.5 flex-1">
				<label for="sd-add-label" class="text-[10px] text-gray-500 uppercase tracking-wide">Label</label>
				<input
					id="sd-add-label"
					class={[fieldColors, fieldSpacing, 'rounded border w-full outline-none']}
					bind:value={addLabel}
					placeholder="Hit Points, Strength…"
				/>
			</div>
			<div class="flex flex-col gap-0.5 items-center">
				<label for="sd-add-vital" class="text-[10px] text-gray-500 uppercase tracking-wide">Vital</label>
				<input id="sd-add-vital" type="checkbox" bind:checked={addIsVital} class="h-4 w-4 mt-1.5" />
			</div>
			<div class="flex flex-col gap-0.5 items-center">
				<label for="sd-add-color" class="text-[10px] text-gray-500 uppercase tracking-wide">Color</label>
				<input
					id="sd-add-color"
					type="color"
					class="h-7 w-9 rounded border border-gray-300 cursor-pointer p-0.5 mt-0.5"
					bind:value={addColor}
				/>
			</div>
		</div>
		<div class="flex gap-2 justify-end">
			<Button
				type="button"
				kind="secondary"
				label="Cancel"
				onclick={() => { addOpen = false; addKey = ''; addLabel = ''; }}
			/>
			<Button
				type="button"
				label="Add"
				onclick={submitAdd}
				disabled={!addKey.trim() || !addLabel.trim() || draftDefs.some((d) => d.key === addKey.trim())}
			/>
		</div>
	</div>
{:else}
	<button
		type="button"
		class="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 w-fit"
		onclick={() => (addOpen = true)}
	>
		<svg viewBox="0 0 24 24" class="h-3.5 w-3.5 fill-current"><path d={mdiPlus} /></svg>
		Add stat
	</button>
{/if}
