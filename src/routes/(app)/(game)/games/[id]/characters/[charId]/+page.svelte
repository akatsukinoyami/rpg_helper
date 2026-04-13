<script lang="ts">
	import { mdiCheck, mdiAlertOctagonOutline } from '@mdi/js';
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import * as chars from '$lib/remote/characters.remote';
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Tile from '$lib/components/Tile.svelte';

	let { data }: { data: { gameId: string; isGm: boolean; userId: string } } = $props();

	const query = $derived(chars.index(page.params.charId!));

	const statusLabel = {
		pending: m.game_dashboard_pending,
		approved: m.game_dashboard_approved,
		rejected: m.game_dashboard_rejected
	} as const;
	const statusKind = { pending: 'warn', approved: 'success', rejected: 'danger' } as const;

	const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
	const genderLabel = {
		male: m.char_gender_male,
		female: m.char_gender_female,
		both: m.char_gender_both,
		none: m.char_gender_none
	} as const;
</script>

{#if query.loading}
	<p class="text-sm text-gray-400">Loading…</p>
{:else if !query.current}
	<p class="text-sm text-gray-400">Character not found.</p>
{:else}
	{@const char = query.current}

	<div class="flex flex-col gap-4 pb-4">
		<!-- Header -->
		<div class="flex items-start gap-3">
			{#if char.image}
				<img src={char.image} alt="" class="h-16 w-16 rounded-full object-cover shrink-0" />
			{:else}
				<div class="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-semibold text-indigo-600 shrink-0">
					{char.name[0].toUpperCase()}
				</div>
			{/if}

			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2">
					<h2 class="text-base font-semibold text-gray-900 truncate">{char.name}</h2>
				</div>
				<p class="text-xs text-gray-500">{char.user.name}</p>
				{#if char.race || char.age != null || char.gender}
					<p class="text-xs text-gray-400 mt-0.5">
						{[
							char.race ? char.race.name : null,
							char.age != null ? String(char.age) : null,
							char.gender ? genderLabel[char.gender]() : null
						].filter(Boolean).join(' · ')}
					</p>
				{/if}
			</div>

			<Badge kind={statusKind[char.status]} label={statusLabel[char.status]()} />
		</div>

		<!-- GM approve/reject -->
		{#if data.isGm && char.status === 'pending'}
			<div class="flex gap-2">
				<Button
					icon={mdiCheck}
					kind="success"
					label={m.game_dashboard_approve()}
					class="px-3 py-1.5"
					onclick={() => chars.approve({ gameId: data.gameId, characterId: char.id })}
				/>
				<Button
					icon={mdiAlertOctagonOutline}
					kind="danger"
					label={m.game_dashboard_reject()}
					class="px-3 py-1.5"
					onclick={() => chars.reject({ gameId: data.gameId, characterId: char.id })}
				/>
			</div>
		{/if}

		<!-- Stats -->
		{#if char.stats}
			<Tile class="gap-2">
				{#snippet content()}
					{#each statKeys as key}
						<div class="flex flex-col items-center rounded-lg bg-gray-50 py-2 w-full">
							<span class="text-[10px] font-medium uppercase text-gray-400">{key}</span>
							<span class="text-sm font-bold text-gray-900">{char.stats[key]}</span>
						</div>
					{/each}
				{/snippet}
			</Tile>
		{/if}

		<!-- Body -->
		{#if char.bodyDescription}
			<div>
				<p class="text-xs font-medium text-gray-500 mb-1">{m.char_field_body()}</p>
				<p class="text-sm text-gray-700 whitespace-pre-wrap">{char.bodyDescription}</p>
			</div>
		{/if}

		<!-- Prehistory -->
		{#if char.prehistory}
			<div>
				<p class="text-xs font-medium text-gray-500 mb-1">{m.char_field_prehistory()}</p>
				<p class="text-sm text-gray-700 whitespace-pre-wrap">{char.prehistory}</p>
			</div>
		{/if}
	</div>
{/if}
