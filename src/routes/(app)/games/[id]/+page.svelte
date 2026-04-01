<script lang="ts">
	import { mdiAlertOctagonOutline, mdiCheck, mdiPencil, mdiTrashCan } from '@mdi/js';
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import Tile from '$lib/components/Tile.svelte';
	import CharacterCard from '$lib/partials/CharacterCard.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { PageData } from './$types';
	import { approve, reject, deleteChar } from '$lib/remote/characters.remote';
	import { transfer } from '$lib/remote/games.remote';

	let { data }: { data: PageData } = $props();

	const otherPlayers = $derived(
		data.game.characters.filter(
			(c) => c.userId !== data.game.gmUserId && c.userId !== data.myCharacter?.userId
		)
	);

	const canSeeAll = (charId: string) =>
		data.isGm || data.myCharacter?.id === charId;

	const visibilityFor = (charId: string) => {
		if (canSeeAll(charId)) return null;
		return data.visibilityGrants.find((g) => g.characterId === charId) ?? null;
	};

	async function run(fn: () => Promise<unknown>) {
		await fn();
		await invalidateAll();
	}
</script>

<div class="flex items-start justify-between">
	<div class="flex items-start gap-4">
		{#if data.game.image}
			<img src={data.game.image} alt="" class="h-16 w-16 shrink-0 rounded-full object-cover" />
		{/if}
		<div>
			<h1 class="text-2xl font-semibold text-gray-900">{data.game.name}</h1>
			{#if data.game.description}
				<p class="mt-1 text-gray-500">{data.game.description}</p>
			{/if}
			<p class="mt-2 text-sm text-gray-400">
				GM: <span class="font-medium text-gray-600">{data.game.gm.name}</span>
			</p>
		</div>
	</div>
	{#if data.isGm}
		<div class="flex items-center gap-2">
			<Button href={localizeHref(`/games/${data.game.id}/edit`)} icon={mdiPencil} kind="secondary" />
		</div>
	{/if}
</div>

<!-- No character yet — prompt to create one -->
{#if !data.myCharacter}
	<Tile class="mt-6" title={m.char_no_character()} kind="info">
		<Button href={localizeHref(`/games/${data.game.id}/characters/new`)} label={m.char_create_button()} />
	</Tile>
{:else if data.myCharacter.status === 'pending'}
	<Tile class="mt-6" title={m.char_status_pending_info()} kind="warn" />
{:else if data.myCharacter.status === 'rejected'}
	<Tile class="mt-6" title={m.char_status_rejected_info()} kind="danger" />
{/if}

<!-- Characters -->
<section class="mt-8">
	<h2 class="mb-4 text-lg font-medium text-gray-900">{m.game_dashboard_characters()}</h2>

	{#if data.game.characters.length === 0}
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
									onclick={() => run(() => approve({ gameId: data.game.id, characterId: char.id }))}
								/>
								<Button
									icon={mdiAlertOctagonOutline}
									kind="danger"
									class="w-full px-3 py-1.5"
									onclick={() => run(() => reject({ gameId: data.game.id, characterId: char.id }))}
								/>
							{/if}
							{#if canEdit}
								<Button
									icon={mdiPencil}
									kind="primary"
									class="w-full px-3 py-1.5"
									href={localizeHref(`/games/${data.game.id}/characters/${char.id}/edit`)}
								/>
								<Button
									icon={mdiTrashCan}
									kind="danger"
									class="w-full px-3 py-1.5"
									onclick={() => run(() => deleteChar({ gameId: data.game.id, characterId: char.id }))}
								/>
							{/if}
						</div>
					{/snippet}
				</CharacterCard>
			{/each}
		</div>
	{/if}
</section>

<!-- Transfer GM (GM only, only if there are other players) -->
{#if data.isGm && otherPlayers.length > 0}
	<section class="mt-10 border-t border-gray-200 pt-8">
		<h2 class="mb-4 text-lg font-medium text-gray-900">{m.game_transfer_gm()}</h2>
		<form {...transfer} class="flex items-end gap-3">
			<InputSelect
				id="newGmUserId"
				name="newGmUserId"
				label={m.game_transfer_gm_to()}
				options={otherPlayers.map(player => [player.userId, player.user.name] as [string, string])}
			/>
			<Button type="submit" label={m.game_transfer_gm_submit()} kind='danger'/>
		</form>
	</section>
{/if}
