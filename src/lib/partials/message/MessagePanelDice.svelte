<script lang="ts">
  import { mdiSend } from "@mdi/js";
  import Button from "$lib/components/Button.svelte";
  import InputText from "$lib/components/InputText.svelte";
  import * as dice from "$lib/remote/diceRolls.remote";

  let { activeAction = $bindable(), locationId } = $props();

	let diceExpr = $state('1d20');
	let diceSubmitting = $state(false);

	async function submitDice() {
		const expr = diceExpr.trim();
		if (!expr || diceSubmitting) return;
		diceSubmitting = true;

    dice
      .roll({ locationId, expression: expr })
      .then(() => (activeAction = null, diceExpr = '1d20'))
      .finally(() => diceSubmitting = false);
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
