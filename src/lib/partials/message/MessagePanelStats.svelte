<script lang="ts">
	import { mdiSend } from '@mdi/js';
	import Button from '$lib/components/Button.svelte';
	import InputNumber from '$lib/components/InputNumber.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import * as m from '$lib/paraglide/messages';
	import * as proposals from '$lib/remote/proposals.remote';
	import { buildStatOptions } from '$lib/utils/stats';
	import type { StatDef } from '$lib/server/db/schema';
	import { createProposalSubmit } from './proposalSubmit';

	let { activeAction = $bindable(), locationId, statDefs = [] as StatDef[] } = $props();

	let statOptions = $derived(buildStatOptions(statDefs));
	let statField = $state('');
	let statDelta = $state(1);
	let statReason = $state('');
	let statSubmitting = $state(false);

	const submit = createProposalSubmit({
		getSubmitting: () => statSubmitting,
		setSubmitting: (v) => (statSubmitting = v),
		setActiveAction: (v) => (activeAction = v)
	});

	function submitStat() {
		if (!statField) return;
		submit(
			proposals.sendStat({
				locationId,
				field: statField,
				delta: statDelta,
				reason: statReason || undefined
			}),
			'Stat proposal',
			() => (statReason = '')
		);
	}
</script>

{#if activeAction === 'stat'}
  <InputSelect
    class="flex-1"
    bind:value={statField}
    options={[['', '— stat —'], ...Object.entries(statOptions)]}
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
