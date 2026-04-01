<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import Tile from '$lib/components/Tile.svelte';
	import GameForm from '$lib/partials/GameForm.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { PageData } from './$types';
	import { createGame } from '$lib/remote/games.remote';

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
		remoteForm={createGame}
		submitLabel={m.game_create_submit()}
		label={m.game_create_title()}
		onclickReset={() => showCreateForm = false}
	/>
{/if}

<div class="mt-6 flex flex-col gap-3">
	{#each data.gmGames as game}
		<Tile title={game.name} subtitle={game.description} image={game.image} href={localizeHref(`/games/${game.id}`)}>
			<Badge label={m.games_gm_badge()} />
		</Tile>
	{/each}

	{#each data.playerGames as game}
		<a
			href={localizeHref(`/games/${game.id}`)}
			class="flex items-center justify-between rounded-2xl bg-white px-6 py-4 ring-1 ring-gray-200 hover:ring-indigo-300"
		>
			<div class="flex items-center gap-3">
				{#if game.image}
					<img src={game.image} alt="" class="h-10 w-10 shrink-0 rounded-full object-cover" />
				{/if}
				<div>
					<p class="font-medium text-gray-900">{game.name}</p>
					{#if game.description}
						<p class="mt-1 text-sm text-gray-500">{game.description}</p>
					{/if}
				</div>
			</div>
			<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
				{m.games_player_badge()}
			</span>
		</a>
	{/each}

	{#if data.gmGames.length === 0 && data.playerGames.length === 0}
		<p class="mt-8 text-center text-sm text-gray-400">{m.games_no_games()}</p>
	{/if}
</div>
