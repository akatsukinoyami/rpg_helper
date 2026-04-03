<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import InputSelect from "$lib/components/InputSelect.svelte";
  import InputText from "$lib/components/InputText.svelte";
  import InputTextArea from "$lib/components/InputTextArea.svelte";
	import * as m from '$lib/paraglide/messages';
  import { createItemType, editItemType } from "$lib/remote/item-types.remote";
  import { type SimpleFormProps } from "$lib/types";

  const remoteFunctions = {
    c: createItemType,
    e: editItemType
  }

  const titles = {
    c: m.item_type_create,
    e: m.item_type_edit_title
  }

	const trackingOptions = {
		quantity: m.item_type_tracking_qty(),
		durability: m.item_type_tracking_dur()
  } as const;

  let {
    action,
    open = $bindable(),
    title = titles[action],
    remoteFunction = remoteFunctions[action],
  }: SimpleFormProps<typeof createItemType | typeof editItemType> = $props();
  
	let trackingMode = $state<'quantity' | 'durability'>('quantity');
</script>

{#if open}
  <form {...remoteFunction} class="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-200">
    <h2 class="text-sm font-semibold text-gray-700">{title()}</h2>

    <div class="grid grid-cols-2 gap-3">
      <InputText id="item-name" name="name" label={m.item_type_field_name()} required />
      <InputSelect
        id="item-tracking"
        name="trackingMode"
        label={m.item_type_field_tracking()}
        options={trackingOptions}
        bind:value={trackingMode}
      />
    </div>

    <InputTextArea id="item-desc" name="description" label={m.item_type_field_desc()} />

    <div class="grid grid-cols-2 gap-3">
      <InputText id="item-weight" name="weight" type="number" label={m.item_type_field_weight()} />
      {#if trackingMode === 'durability'}
        <InputText id="item-max-dur" name="maxDurability" type="number" label={m.item_type_field_max_dur()} />
      {/if}
    </div>

    <div class="flex justify-end gap-2">
      <Button 
        kind="secondary"
        type="reset" 
        label={m.item_type_revert()} 
        onclick={() => open = false} 
      />
      <Button 
        type="submit" 
        label={m.item_type_save()} 
        onclick={() => open = false} 
      />
    </div>
  </form>
{/if}