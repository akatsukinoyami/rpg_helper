<script lang="ts">
	import { enhance } from '$app/forms'
	import * as m from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	let showCreateForm = $state(false)
</script>

<div class="flex items-center justify-between">
	<h1 class="text-2xl font-semibold text-gray-900">{m.games_title()}</h1>
	<button
		onclick={() => (showCreateForm = !showCreateForm)}
		class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
	>
		{m.games_create_button()}
	</button>
</div>

{#if showCreateForm}
	<div class="mt-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
		<h2 class="mb-4 text-lg font-medium text-gray-900">{m.game_create_title()}</h2>
		<form method="post" action="?/create" use:enhance class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<label class="text-sm font-medium text-gray-700" for="name">{m.game_field_name()}</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-sm font-medium text-gray-700" for="description">
					{m.game_field_description()}
				</label>
				<textarea
					id="description"
					name="description"
					rows="3"
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
				></textarea>
			</div>
			<div class="flex justify-end">
				<button
					type="submit"
					class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
				>
					{m.game_create_submit()}
				</button>
			</div>
		</form>
	</div>
{/if}

<div class="mt-6 flex flex-col gap-3">
	{#each data.gmGames as game}
		<a
			href={localizeHref(`/games/${game.id}`)}
			class="flex items-center justify-between rounded-2xl bg-white px-6 py-4 ring-1 ring-gray-200 hover:ring-indigo-300"
		>
			<div>
				<p class="font-medium text-gray-900">{game.name}</p>
				{#if game.description}
					<p class="mt-1 text-sm text-gray-500">{game.description}</p>
				{/if}
			</div>
			<span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
				{m.games_gm_badge()}
			</span>
		</a>
	{/each}

	{#each data.playerGames as game}
		<a
			href={localizeHref(`/games/${game.id}`)}
			class="flex items-center justify-between rounded-2xl bg-white px-6 py-4 ring-1 ring-gray-200 hover:ring-indigo-300"
		>
			<div>
				<p class="font-medium text-gray-900">{game.name}</p>
				{#if game.description}
					<p class="mt-1 text-sm text-gray-500">{game.description}</p>
				{/if}
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
