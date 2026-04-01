<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { mdiPencil } from '@mdi/js';
	import Button from '$lib/components/Button.svelte';
	import type { Locale, Stats } from '$lib/server/db/schema';
	import { localize } from '$lib/localize';
	import { getLocale } from '$lib/paraglide/runtime';

	interface Props {
		// Front — always visible
		name: string;
		playerName: string;
		race?: { id: string; name: Partial<Record<Locale, string>>; } | null;
		image?: string | null;
		status: 'pending' | 'approved' | 'rejected';
		// Back — visibility-controlled (null = hidden from this character)
		bodyDescription?: string | null;
		stats?: Stats | null;
		age?: number | null;
		gender?: 'male' | 'female' | 'none' | 'both' | null;
		// Actions
		editHref?: string;
		actions?: Snippet;
	}

	let { 
		name, 
		playerName, 
		race, 
		image, 
		status, 
		bodyDescription, 
		stats, 
		age, 
		gender, 
		editHref, 
		actions 
	}: Props =
		$props();

	const statusColor = {
		approved: 'bg-green-500',
		rejected: 'bg-red-500',
		pending: 'bg-yellow-400'
	} as const;

	const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

	const genderLabel = {
			male: m.char_gender_male,
			female: m.char_gender_female,
			both: m.char_gender_both,
			none: m.char_gender_none
		};

	const meta = $derived(
		[age != null ? String(age) : null, gender && genderLabel[gender]()].filter(Boolean).join(' · ')
	);
</script>

<div class="group perspective-midrange" style="aspect-ratio: 3/4">
	<div
		class="relative h-full w-full transition-transform duration-500 transform-3d group-hover:transform-[rotateY(180deg)]"
	>
		<!-- Front -->
		<div class="absolute inset-0 overflow-hidden rounded-2xl backface-hidden">
			<div class="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-300 to-purple-500">
				<!-- <Icon path={mdiAccount} size={72} pathClass="fill-white/40" /> -->
				<img src={image ?? `/fallback/${race?.name?.en?.toLowerCase()}_${gender}.png`} alt="" class="h-full w-full object-cover opacity-30 " />
			</div>

			<!-- Status dot -->
			<div class="absolute right-3 top-3 h-3 w-3 rounded-full ring-2 ring-white {statusColor[status]}"></div>

			<!-- Bottom overlay -->
			<div
				class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pt-10"
			>
				<p class="truncate font-semibold text-white">{name}</p>
				<p class="truncate text-sm text-white/70">{playerName}</p>
				{#if race}
					<p class="truncate text-xs text-white/50">{localize(race.name, getLocale())}</p>
				{/if}
			</div>
		</div>

		<!-- Back -->
		<div
			class="absolute inset-0 flex flex-col gap-3 overflow-hidden rounded-2xl bg-white p-4 backface-hidden transform-[rotateY(180deg)]"
		>
			<p class="truncate font-semibold text-gray-900">{name}</p>

			{#if stats}
				<div class="grid grid-cols-3 gap-1">
					{#each statKeys as key}
						<div class="flex flex-col items-center rounded-lg bg-gray-50 py-1.5">
							<span class="text-[10px] font-medium uppercase text-gray-400"
								>{key}</span
							>
							<span class="text-sm font-bold text-gray-900">{stats[key]}</span>
						</div>
					{/each}
				</div>
			{/if}

			{#if bodyDescription}
				<p class="grow overflow-hidden text-sm leading-snug text-gray-600 line-clamp-5">
					{bodyDescription}
				</p>
			{:else}
				<div class="grow"></div>
			{/if}

			{#if meta}
				<p class="shrink-0 text-xs text-gray-400">{meta}</p>
			{/if}

			{#if editHref || actions}
				<div class="shrink-0 flex flex-col gap-1">
					{#if editHref}
						<Button href={editHref} icon={mdiPencil} kind="secondary" class="w-full px-3 py-1.5" />
					{/if}
					{#if actions}
						{@render actions()}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
