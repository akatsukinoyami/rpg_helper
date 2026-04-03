<script lang="ts">
  import * as remoteFunctions from '$lib/remote/locations.remote';
  import * as m from '$lib/paraglide/messages';
  import InputText from '$lib/components/InputText.svelte';
  import InputTextArea from '$lib/components/InputTextArea.svelte';
  import TypeForm from '$lib/partials/TypeForm.svelte';

  interface Props {
    action: 'create' | 'edit';
    open: boolean;
    entity?: Record<string, any>;
  }

  let { action, entity, open = $bindable() }: Props = $props();
</script>

<TypeForm
  {action}
  {remoteFunctions}
  {entity}
  bind:open
  titles={{ create: m.location_create(), edit: m.location_edit_title() }}
>
  <InputText
    id="location-name"
    name="name"
    label={m.location_field_name()}
    value={entity?.name}
    required
  />

  <InputTextArea
    id="location-desc"
    name="description"
    label={m.location_field_desc()}
    value={entity?.description}
  />
</TypeForm>
