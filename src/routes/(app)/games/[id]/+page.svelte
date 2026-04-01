<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { localize } from '$lib/localize';
	import type { PageData } from './$types';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import Tile from '$lib/components/Tile.svelte';
	import CharacterCard from '$lib/partials/CharacterCard.svelte';

	let { data }: { data: PageData } = $props();

	const otherPlayers = $derived(
		data.game.characters.filter(
			(c) => c.userId !== data.game.gmUserId && c.userId !== data.myCharacter?.userId
		)
	);

	const canSeeAll = (charId: string) =>
		data.isGm || data.myCharacter?.id === charId;

	const visibilityFor = (charId: string) => {
		if (canSeeAll(charId)) return null; // null = full access
		return data.visibilityGrants.find((g) => g.characterId === charId) ?? null;
	};
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
			<Button href={localizeHref(`/games/${data.game.id}/edit`)} label={m.game_edit_button()} kind="secondary" />
			<Badge label={m.games_gm_badge()} />
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
				<div class="flex flex-col gap-2">
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
					/>
					{#if data.isGm && char.status === 'pending'}
						<form method="post" action="?/approve" use:enhance>
							<input type="hidden" name="characterId" value={char.id} />
							<Button type="submit" label={m.game_dashboard_approve()} kind='success' class="w-full"/>
						</form>
						<form method="post" action="?/reject" use:enhance>
							<input type="hidden" name="characterId" value={char.id} />
							<Button type="submit" label={m.game_dashboard_reject()} kind='danger' class="w-full"/>
						</form>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- Transfer GM (GM only, only if there are other players) -->
{#if data.isGm && otherPlayers.length > 0}
	<section class="mt-10 border-t border-gray-200 pt-8">
		<h2 class="mb-4 text-lg font-medium text-gray-900">{m.game_transfer_gm()}</h2>
		<form method="post" action="?/transfer" use:enhance class="flex items-end gap-3">
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
