<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import Tile from '$lib/components/Tile.svelte';
	import GameForm from '$lib/partials/GameForm.svelte';
	import * as m from '$lib/paraglide/messages';
	import * as game from '$lib/remote/games.remote';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showCreateForm = $state(false);
</script>

<div class="flex items-center justify-between">
	<h1 class="text-2xl font-semibold text-gray-900">{m.games_title()}</h1>
	<Button
		onclick={() => (showCreateForm = !showCreateForm)}
		label={m.games_create_button()}
	/>
</div>

{#if showCreateForm}
	<GameForm
		remoteForm={game.create}
		submitLabel={m.game_create_submit()}
		label={m.game_create_title()}
		onclickReset={() => showCreateForm = false}
	/>
{/if}

<div class="mt-6 grid grid-cols-3 gap-3">
	{#each data.gmGames as game}
		<Tile title={game.name} subtitle={game.description} image={game.image} href={localizeHref(`/games/${game.id}`)}>
			<Badge label={m.games_gm_badge()} />
		</Tile>
	{/each}

	{#each data.playerGames as game}
		<Tile title={game.name} subtitle={game.description} image={game.image} href={localizeHref(`/games/${game.id}`)}>
			<Badge label={m.games_player_badge()} kind="secondary" />
		</Tile>
	{/each}

	{#if data.gmGames.length === 0 && data.playerGames.length === 0}
		<p class="mt-8 text-center text-sm text-gray-400">{m.games_no_games()}</p>
	{/if}
</div>

{#if data.otherGames.length > 0}
	<h2 class="mt-8 mb-3 text-lg font-semibold text-gray-700">{m.games_other_title()}</h2>
	<div class="grid grid-cols-3 gap-3">
		{#each data.otherGames as game}
			<Tile title={game.name} subtitle={game.description} image={game.image} href={localizeHref(`/games/${game.id}`)}>
				<Badge label={m.games_join_badge()} kind="secondary" />
			</Tile>
		{/each}
	</div>
{/if}
