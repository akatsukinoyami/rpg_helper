<script lang="ts">
  import { mdiClose } from '@mdi/js';
  import Button from '$lib/components/Button.svelte';
  import MessagePanelDice from './MessagePanelDice.svelte';
  import MessagePanelItem from './MessagePanelItem.svelte';
  import MessagePanelSkill from './MessagePanelSkill.svelte';
  import MessagePanelStats from './MessagePanelStats.svelte';

  let { activeAction = $bindable(), locationId, game } = $props();

</script>

{#if activeAction}
  <div class="flex items-center gap-1.5 rounded bg-gray-50 border border-gray-200 px-2 py-1.5">
    {#each [MessagePanelDice, MessagePanelItem, MessagePanelSkill, MessagePanelStats] as Panel}
      <Panel bind:activeAction {locationId} {game} />
    {/each}

    <Button
      onclick={() => (activeAction = null)}
      type="button"
      kind="ghost"
      icon={mdiClose}
    />
  </div>
{/if}
