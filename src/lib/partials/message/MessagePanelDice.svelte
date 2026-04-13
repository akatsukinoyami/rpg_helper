<script lang="ts">
	import { mdiSend } from '@mdi/js';
	import Button from '$lib/components/Button.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import * as dice from '$lib/remote/diceRolls.remote';
	import { createProposalSubmit } from './proposalSubmit';

	let { activeAction = $bindable(), locationId } = $props();

	let diceExpr = $state('1d20');
	let diceSubmitting = $state(false);

	const submit = createProposalSubmit({
		getSubmitting: () => diceSubmitting,
		setSubmitting: (v) => (diceSubmitting = v),
		setActiveAction: (v) => (activeAction = v)
	});

	function submitDice() {
		const expr = diceExpr.trim();
		if (!expr) return;
		submit(dice.roll({ locationId, expression: expr }), 'Dice roll', () => (diceExpr = '1d20'));
	}
</script>

{#if activeAction === 'dice'}
  <InputText
    class="flex-1"
    bind:value={diceExpr}
    placeholder="2d6+3"
    onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), submitDice())}
  />
  <Button
    type="button"
    kind="primary"
    icon={mdiSend}
    onclick={submitDice}
    disabled={!diceExpr || diceSubmitting}
  />
{/if}
