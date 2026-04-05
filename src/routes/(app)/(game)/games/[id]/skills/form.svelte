<script lang="ts">
	import * as remoteFunctions from '$lib/remote/skill-types.remote';
	import * as m from '$lib/paraglide/messages';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
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
  titles={{ create: m.skill_type_create(), edit: m.skill_type_edit_title() }}
>
  <AvatarUpload
    name="image"
    type="skill"
    value={entity?.image}
    label={m.skill_type_field_image()}
  />

  <InputText
    id="skill-name"
    name="name"
    label={m.skill_type_field_name()}
    value={entity?.name}
    required
  />

  <InputTextArea 
    id="skill-desc" 
    name="description" 
    label={m.skill_type_field_desc()} 
    value={entity?.description} 
  />
</TypeForm>