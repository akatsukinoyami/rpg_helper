<script lang="ts">
	import { enhance } from '$app/forms';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import InputTextArea from '$lib/components/InputTextArea.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

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
	<div class="mt-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
		<h2 class="mb-4 text-lg font-medium text-gray-900">{m.game_create_title()}</h2>
		<form method="post" action="?/create" use:enhance class="flex flex-col gap-4">
			<InputText id="name" name="name" label={m.game_field_name()} />
			<InputTextArea id="name" name="name" label={m.game_field_description()} />

			<div class="flex justify-end gap-2">
				<Button label={m.game_create_reset()} type="reset" onclick={() => (showCreateForm = false)} kind="secondary" />
				<Button label={m.game_create_submit()} type="submit" />
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

			<Badge label={m.games_gm_badge()} />
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
