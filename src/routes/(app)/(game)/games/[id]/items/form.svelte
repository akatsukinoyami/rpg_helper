<script lang="ts">
  import AvatarUpload from "$lib/components/AvatarUpload.svelte";
  import InputSelect from "$lib/components/InputSelect.svelte";
  import InputText from "$lib/components/InputText.svelte";
  import InputTextArea from "$lib/components/InputTextArea.svelte";
  import * as m from '$lib/paraglide/messages';
  import TypeForm from "$lib/partials/TypeForm.svelte";
  import * as remoteFunctions from "$lib/remote/item-types.remote";

  const trackingOptions = {
    quantity: m.item_type_tracking_qty(),
    durability: m.item_type_tracking_dur()
  } as const;

  interface Props {
    action: 'create' | 'edit';
    open: boolean;
    entity?: Record<string, any>;
  }

  let { action, entity, open = $bindable() }: Props = $props();

  let trackingMode = $state<'quantity' | 'durability'>('quantity');
  $effect(() => { trackingMode = entity?.trackingMode ?? 'quantity'; });
</script>


<TypeForm
  {action}
  {remoteFunctions}
  {entity}
  bind:open
  titles={{ create: m.item_type_create(), edit: m.item_type_edit_title() }}
>
  <AvatarUpload
    name="image"
    type="item"
    value={entity?.image}
    label={m.item_type_field_image()}
  />

  <div class="grid grid-cols-2 gap-3">
    <InputText
      id="item-name"
      name="name"
      label={m.item_type_field_name()}
      value={entity?.name}
      required
    />
    <InputSelect
      id="item-tracking"
      name="trackingMode"
      label={m.item_type_field_tracking()}
      options={trackingOptions}
      bind:value={trackingMode}
    />
  </div>

  <InputTextArea 
    id="item-desc" 
    name="description" 
    label={m.item_type_field_desc()} 
    value={entity?.description} 
  />

  <div class="grid grid-cols-2 gap-3">
    <InputText 
      id="item-weight" 
      name="weight" 
      type="number" 
      label={m.item_type_field_weight()} 
      value={entity?.weight} 
    />

    {#if trackingMode === 'durability'}
      <InputText 
        id="item-max-dur" 
        name="maxDurability" 
        type="number" 
        label={m.item_type_field_max_dur()} 
        value={entity?.maxDurability?.toString()} 
      />
    {/if}
  </div>
</TypeForm>