<script lang="ts">
	import { getContext } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { mdiPencil, mdiTrashCan } from '@mdi/js';
	import { deleteItemType } from '$lib/remote/item-types.remote';
	import type { PageData } from './$types';
	import Form from './form.svelte';

	let { data }: { data: PageData } = $props();

	let addFormState = getContext<{ open: boolean }>('addFormState');

	async function remove(itemTypeId: string) {
		await deleteItemType({ itemTypeId });
		await invalidateAll();
	}
</script>

{#if data.isGm}
	<Form action="c" bind:open={addFormState.open} />
{/if}

{#if data.items.length === 0}
	<p class="text-sm text-gray-400">{m.item_type_no_items()}</p>
{:else}
	<div class="flex flex-col gap-2">
		{#each data.items as item}
			<div class="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-gray-200">
				<div>
					<p class="text-sm font-medium text-gray-900">{item.name.en}</p>
					{#if item.description?.en}
						<p class="text-xs text-gray-400">{item.description.en}</p>
					{/if}
					<p class="mt-0.5 text-xs text-gray-400">
						{item.trackingMode === 'quantity' ? m.item_type_tracking_qty() : m.item_type_tracking_dur()}
						{#if item.trackingMode === 'durability' && item.maxDurability}
							· {item.maxDurability}
						{/if}
						· {m.item_type_field_weight()}: {item.weight}
					</p>
				</div>
				{#if data.isGm}
					<div class="flex gap-2">
						<Button icon={mdiPencil} kind="secondary" href={localizeHref(`/games/${data.gameId}/items/${item.id}/edit`)} />
						<Button icon={mdiTrashCan} kind="danger" onclick={() => remove(item.id)} />
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
