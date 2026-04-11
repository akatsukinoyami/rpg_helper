<script lang="ts">
	import { mdiSend } from '@mdi/js';
	import Button from '$lib/components/Button.svelte';
	import InputNumber from '$lib/components/InputNumber.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import * as m from '$lib/paraglide/messages';
	import * as proposals from '$lib/remote/proposals.remote';
	import * as itemTypesRemote from '$lib/remote/item-types.remote';

	let { activeAction = $bindable(), locationId } = $props();

	const itemsQuery = itemTypesRemote.index();
	let itemTypeId = $state('');
	let itemDelta = $state(1);
	let itemReason = $state('');
	let itemSubmitting = $state(false);

	const selectedItem = $derived(itemsQuery.current?.find((i) => i.id === itemTypeId));

	async function submitItem() {
		if (!itemTypeId || itemSubmitting) return;
		itemSubmitting = true;
		const isDur = selectedItem?.trackingMode === 'durability';

		proposals
			.sendItem({
				locationId,
				itemTypeId,
				deltaQty: isDur ? undefined : itemDelta,
				deltaDur: isDur ? itemDelta : undefined,
				reason: itemReason || undefined
			})
			.then(() => ((activeAction = null), (itemReason = '')))
			.finally(() => (itemSubmitting = false));
	}
</script>

{#if activeAction === 'item'}
  <InputSelect
    class="flex-1"
    bind:value={itemTypeId}
    options={[
      ['', '— item —'], 
      ...(itemsQuery.current ?? []).map((i) => [i.id, i.name] as [string, string])
    ]}
  />
  <InputNumber
    class="flex-1"
    bind:value={itemDelta}
    placeholder={
      selectedItem?.trackingMode === 'durability' 
        ? m.proposal_item_dur() 
        : m.proposal_item_qty()
    }
  />
  <InputText
    class="flex-1"
    bind:value={itemReason}
    placeholder={m.proposal_reason()}
  />

  <Button
    type="button"
    kind="primary"
    icon={mdiSend}
    onclick={submitItem}
    disabled={!itemTypeId || itemSubmitting}
  />
{/if}
