<script lang="ts">
  import { mdiSend } from "@mdi/js";
  import Button from "$lib/components/Button.svelte";
  import InputNumber from "$lib/components/InputNumber.svelte";
  import InputSelect from "$lib/components/InputSelect.svelte";
  import InputText from "$lib/components/InputText.svelte";
	import * as m from '$lib/paraglide/messages';
	import * as proposals from '$lib/remote/proposals.remote';
  import { buildStatLabels, type StatLabels } from '$lib/utils/stats';

  let { activeAction = $bindable(), locationId, game } = $props();

  let statLabels = $derived(buildStatLabels(game));
	let statField = $state<keyof StatLabels>('hp');
	let statDelta = $state(1);
	let statReason = $state('');
	let statSubmitting = $state(false);

	async function submitStat() {
		if (statSubmitting) return;
		statSubmitting = true;
    
    proposals
      .sendStat({ locationId, field: statField, delta: statDelta, reason: statReason || undefined })
      .then(() =>  (activeAction = null, statReason = ''))
      .finally(() => (statSubmitting = false));
	}
</script>

{#if activeAction === 'stat'}
  <InputSelect
    class="flex-1"
    bind:value={statField}
    options={statLabels}
  />
  <InputNumber
    class="flex-1"
    bind:value={statDelta}
    placeholder={m.proposal_stat_delta()}
  />
  <InputText
    class="flex-1"
    bind:value={statReason}
    placeholder={m.proposal_reason()}
  />
  <Button
    type="button"
    kind="primary"
    icon={mdiSend}
    onclick={submitStat}
    disabled={!statField || statSubmitting}
  />
{/if}
