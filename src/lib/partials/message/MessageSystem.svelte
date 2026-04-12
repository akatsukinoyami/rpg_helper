<script lang="ts">
	import { mdiCheck, mdiClose, mdiDelete } from '@mdi/js';
	import ButtonSmall from '$lib/components/ButtonSmall.svelte';
	import * as m from '$lib/paraglide/messages';
	import * as messages from '$lib/remote/messages.remote';
	import * as proposals from '$lib/remote/proposals.remote';
	import { type MessageData, type ProposalEventType, type SystemEvent } from '$lib/types';
	import { buildStatLabels, statLabel, type GameLabels } from '$lib/utils/stats';

	let { msg, isGm, game }: { msg: MessageData; isGm: boolean; game?: GameLabels } = $props();

	let statLabels = $derived(buildStatLabels(game));
	const statuses = {
		pending: m.game_dashboard_pending,
		approved: m.game_dashboard_approved,
		rejected: m.game_dashboard_rejected
	};

	const guessProposalColor = (state: boolean) => (state ? 'text-green-800' : 'text-red-700');
	const time = $derived(
		new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	);

	let deletePending = $state(false);

	async function handleDelete(event: SystemEvent) {
		if (deletePending) return;
		deletePending = true;
		try {
			if (event.type === 'move' || event.type === 'diceRoll') {
				await messages.remove(msg.id);
			} else {
				await proposals.remove({ type: event.type as ProposalEventType, id: event.id });
			}
		} finally {
			deletePending = false;
		}
	}
</script>

{#snippet delta(descr: string, item?: number)}
  {#if item != null}
    {descr} {item > 0 ? '+' : ''}{item}
  {/if}
{/snippet}

{#if msg.event}
  <message-wrapper class={[
    "flex items-center gap-2 px-2 py-1 font-light text-gray-500",
    msg.event?.status === 'rejected' ? 'opacity-50' : ''
  ]}>
    <hr class="flex-1 border-gray-500" />
    <span class="text-[10px] text-gray-400 flex items-center">
      {msg.character?.name}
    </span>

    <span class="text-xs shrink-0 align-middle">
      {#if msg.move && msg.move.from && msg.move.to}
        {msg.move.from} → {msg.move.to}
      {:else if msg.event?.type === 'diceRoll'}
        🎲 {msg.event.expression}: [{msg.event.rolls.join(', ')}]
        {msg.event.modifier !== 0 ? ` ${msg.event.modifier > 0 ? '+' : ''}${msg.event.modifier}` : ''} = 
        <strong>{msg.event.result}</strong>
      {:else if msg.event?.type === 'characterChange'}
        <span class={guessProposalColor(msg.event.delta > 0)}>
          {statLabel(msg.event.stat, statLabels)} {msg.event.delta > 0 ? '+' : ''}{msg.event.delta}
          {#if msg.event.reason}<span class="opacity-60">— {msg.event.reason}</span>{/if}
        </span>
      {:else if msg.event?.type === 'itemChange'}
        <span class={guessProposalColor(msg.event.deltaQty > 0 || msg.event.deltaDur > 0)}>
          {msg.event.itemTypeName ?? msg.event.itemTypeId}
          {@render delta(m.item_qty(), msg.event.deltaQty)}
          {@render delta(m.item_dur(), msg.event.deltaDur)}
          {#if msg.event.reason}<span class="opacity-60">— {msg.event.reason}</span>{/if}
        </span>
      {:else if msg.event?.type === 'skillChange'}
        <span class={guessProposalColor(msg.event.action === 'add')}>
          {msg.event.action === 'add' ? '+' : '−'} {msg.event.skillTypeName ?? msg.event.skillTypeId}
          {#if msg.event.reason}<span class="opacity-60">— {msg.event.reason}</span>{/if}
        </span>
      {:else}
        [system]
      {/if}
    </span>

    <span class="text-[10px] text-gray-400 flex items-center">
      {#if isGm}
        {#if msg.event?.status === 'pending'}
          <ButtonSmall 
            class="hover:text-yellow-600"
            onclick={() => proposals.approve({ type: msg.event?.type, id: msg.event?.id })}
            icon={mdiCheck}
          />
          <ButtonSmall 
            class="hover:text-red-600"
            onclick={() => proposals.reject({ type: msg.event?.type, id: msg.event.id })}
            icon={mdiClose}
          />
        {/if}
        <ButtonSmall 
          class="hover:text-red-600"
          title={m.message_delete()}
          onclick={() => handleDelete(msg.event)}
          disabled={deletePending}
          icon={mdiDelete}
        />
      {/if}
      {statuses?.[msg.event?.status as keyof typeof statuses]?.() ?? ''}
      {time}
    </span>
    <hr class="flex-1 border-gray-500" />
  </message-wrapper>
{/if}