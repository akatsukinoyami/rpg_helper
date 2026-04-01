<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { localize } from '$lib/localize';
	import type { PageData } from './$types';
	import Badge, { type BadgeKind } from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import Tile from '$lib/components/Tile.svelte';

	let { data }: { data: PageData } = $props();

	const statusLabel = (status: string) => {
		if (status === 'approved') return m.game_dashboard_approved();
		if (status === 'rejected') return m.game_dashboard_rejected();
		return m.game_dashboard_pending();
	};

	const statusClass = (status: string): BadgeKind => {
		if (status === 'approved') return 'success';
		if (status === 'rejected') return 'danger';
		return 'warn';
	};

	const otherPlayers = $derived(
		data.game.characters.filter(
			(c) => c.userId !== data.game.gmUserId && c.userId !== data.myCharacter?.userId
		)
	);
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
		<div class="flex flex-col gap-3">
			{#each data.game.characters as char}
				<Tile 
					title={char.name} 
					subtitle="{char.user.name}{char.race ? ` · ${localize(char.race.name, getLocale())}` : ''}"
				>
					<Badge label={statusLabel(char.status)} kind={statusClass(char.status)}/>
					{#if data.isGm && char.status === 'pending'}
						<form method="post" action="?/approve" use:enhance>
							<input type="hidden" name="characterId" value={char.id} />
							<Button type="submit" label={m.game_dashboard_approve()} kind='success'/>
						</form>

						<form method="post" action="?/reject" use:enhance>
							<input type="hidden" name="characterId" value={char.id} />
							<Button type="submit" label={m.game_dashboard_reject()} kind='danger'/>
						</form>
					{/if}
				</Tile>
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
