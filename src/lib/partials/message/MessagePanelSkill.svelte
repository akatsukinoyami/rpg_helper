<script lang="ts">
  import { mdiSend } from "@mdi/js";
  import Button from "$lib/components/Button.svelte";
  import InputSelect from "$lib/components/InputSelect.svelte";
  import InputText from "$lib/components/InputText.svelte";
	import * as m from '$lib/paraglide/messages';
	import * as proposals from '$lib/remote/proposals.remote';
	import * as skillTypesRemote from '$lib/remote/skill-types.remote';

  let { activeAction = $bindable(), locationId } = $props();

	const skillsQuery = skillTypesRemote.index();
	let skillTypeId = $state('');
	let skillAction = $state<'add' | 'remove'>('add');
	let skillReason = $state('');
	let skillSubmitting = $state(false);

	async function submitSkill() {
		if (!skillTypeId || skillSubmitting) return;
		skillSubmitting = true;
    proposals
      .sendSkill({ locationId, skillTypeId, action: skillAction, reason: skillReason || undefined })
      .then(() => (activeAction = null, skillReason = ''))
      .finally(() => (skillSubmitting = false));
	}
</script>

{#if activeAction === 'skill'}
  <InputSelect
    class="flex-1"
    bind:value={skillTypeId}
    options={[
      ['', '— skill —'], 
      ...(skillsQuery.current ?? []).map((s) => [s.id, s.name] as [string, string])
    ]}
  />
  <InputSelect
    class="flex-1"
    bind:value={skillAction}
    options={{ add: '+ add', remove: '− remove'}}
  />
  <InputText
    class="flex-1"
    bind:value={skillReason}
    placeholder={m.proposal_reason()}
  />
  <Button
    type="button"
    kind="primary"
    icon={mdiSend}
    onclick={submitSkill}
    disabled={!skillTypeId || skillSubmitting}
  />
{/if}
