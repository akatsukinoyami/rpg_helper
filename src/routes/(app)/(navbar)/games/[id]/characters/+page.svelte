<script lang="ts">
	import { mdiAlertOctagonOutline, mdiCheck, mdiPencil, mdiTrashCan } from '@mdi/js';
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Tile from '$lib/components/Tile.svelte';
	import CharacterCard from '$lib/partials/CharacterCard.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { PageData } from './$types';
	import { approve, reject, deleteChar } from '$lib/remote/characters.remote';

	let { data }: { data: PageData } = $props();

	const canSeeAll = (charId: string) => data.isGm || data.myCharacter?.id === charId;

	const visibilityFor = (charId: string) => {
		if (canSeeAll(charId)) return null;
		return data.visibilityGrants.find((g) => g.characterId === charId) ?? null;
	};

	async function run(fn: () => Promise<unknown>) {
		await fn();
		await invalidateAll();
	}
</script>

{#if !data.myCharacter}
	<Tile title={m.char_no_character()} kind="info">
		<Button href={localizeHref(`/games/${data.game?.id}/characters/new`)} label={m.char_create_button()} />
	</Tile>
{:else if data.myCharacter.status === 'pending'}
	<Tile title={m.char_status_pending_info()} kind="warn" />
{:else if data.myCharacter.status === 'rejected'}
	<Tile title={m.char_status_rejected_info()} kind="danger" />
{/if}

{#if !data.game?.characters.length}
	<p class="text-sm text-gray-400">{m.game_dashboard_no_characters()}</p>
{:else}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
		{#each data.game.characters as char}
			{@const vis = visibilityFor(char.id)}
			{@const full = vis === null}
			{@const canEdit = data.isGm || char.userId === data.myCharacter?.userId}
			<CharacterCard
				name={char.name}
				playerName={char.user.name}
				race={char.race}
				image={char.image}
				status={char.status}
				bodyDescription={char.bodyDescription}
				stats={full || vis?.showStats ? char.stats : null}
				age={full || vis?.showAge ? char.age : null}
				gender={full || vis?.showAge ? char.gender : null}
			>
				{#snippet actions()}
					<div class="flex gap-1">
						{#if data.isGm && char.status === 'pending'}
							<Button
								icon={mdiCheck}
								kind="success"
								class="w-full px-3 py-1.5"
								onclick={() => run(() => approve({ gameId: data.game!.id, characterId: char.id }))}
							/>
							<Button
								icon={mdiAlertOctagonOutline}
								kind="danger"
								class="w-full px-3 py-1.5"
								onclick={() => run(() => reject({ gameId: data.game!.id, characterId: char.id }))}
							/>
						{/if}
						{#if canEdit}
							<Button
								icon={mdiPencil}
								kind="primary"
								class="w-full px-3 py-1.5"
								href={localizeHref(`/games/${data.game!.id}/characters/${char.id}/edit`)}
							/>
							<Button
								icon={mdiTrashCan}
								kind="danger"
								class="w-full px-3 py-1.5"
								onclick={() => run(() => deleteChar({ gameId: data.game!.id, characterId: char.id }))}
							/>
						{/if}
					</div>
				{/snippet}
			</CharacterCard>
		{/each}
	</div>
{/if}
