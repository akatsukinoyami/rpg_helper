<script lang="ts">
  import { createSkillType, editSkillType } from "$lib/remote/skill-types.remote";
	import * as m from '$lib/paraglide/messages';
  import { type SimpleFormProps } from "$lib/types";
    import InputText from "$lib/components/InputText.svelte";
    import InputTextArea from "$lib/components/InputTextArea.svelte";
    import Button from "$lib/components/Button.svelte";

  const remoteFunctions = {
    c: createSkillType,
    e: editSkillType
  }

  const titles = {
    c: m.skill_type_create,
    e: m.skill_type_edit_title
  }

  let {
    action,
    open = $bindable(),
    title = titles[action],
    remoteFunction = remoteFunctions[action],
  }: SimpleFormProps<typeof createSkillType | typeof editSkillType> = $props();
</script>

{#if open}
<form {...remoteFunction} class="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-200">
  <h2 class="text-sm font-semibold text-gray-700">{title()}</h2>

  <InputText id="skill-name" name="name" label={m.skill_type_field_name()} required />

  <InputTextArea id="skill-desc" name="description" label={m.skill_type_field_desc()} />

  <div class="flex justify-end gap-2">
    <Button 
      kind="secondary"
      type="reset" 
      label={m.item_type_revert()} 
      onclick={() => open = false} 
    />
    <Button 
      type="submit" 
      label={m.skill_type_save()} 
      onclick={() => open = false} 
    />
  </div>
</form>
{/if}