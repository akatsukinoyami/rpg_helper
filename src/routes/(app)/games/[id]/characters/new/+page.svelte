<script lang="ts">
	import { enhance } from '$app/forms'
	import * as m from '$lib/paraglide/messages'
	import { getLocale, localizeHref } from '$lib/paraglide/runtime'
	import { localize } from '$lib/localize'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	let selectedRaceId = $state('')

	const selectedRace = $derived(data.races.find((r) => r.id === selectedRaceId))

	const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
	const statLabels: Record<string, string> = {
		str: 'STR',
		dex: 'DEX',
		con: 'CON',
		int: 'INT',
		wis: 'WIS',
		cha: 'CHA'
	}
</script>

<div class="max-w-2xl">
	<div class="mb-6">
		<a
			href={localizeHref(`/games/${data.game.id}`)}
			class="text-sm text-gray-500 hover:text-gray-900"
		>
			← {m.char_create_back()}
		</a>
		<h1 class="mt-2 text-2xl font-semibold text-gray-900">{m.char_create_title()}</h1>
		<p class="mt-1 text-sm text-gray-500">{data.game.name}</p>
	</div>

	{#if form?.error === 'name_required'}
		<div class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
			{m.char_error_name_required()}
		</div>
	{/if}

	<form
		method="post"
		use:enhance
		class="flex flex-col gap-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200"
	>
		<!-- Name -->
		<div class="flex flex-col gap-1">
			<label class="text-sm font-medium text-gray-700" for="name">{m.char_field_name()}</label>
			<input
				id="name"
				name="name"
				type="text"
				required
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			/>
		</div>

		<!-- Gender -->
		<div class="flex flex-col gap-1">
			<label class="text-sm font-medium text-gray-700" for="gender">
				{m.char_field_gender()}
			</label>
			<select
				id="gender"
				name="gender"
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			>
				<option value="none">{m.char_gender_none()}</option>
				<option value="male">{m.char_gender_male()}</option>
				<option value="female">{m.char_gender_female()}</option>
				<option value="both">{m.char_gender_both()}</option>
			</select>
		</div>

		<!-- Race -->
		<div class="flex flex-col gap-1">
			<label class="text-sm font-medium text-gray-700" for="raceId">{m.char_field_race()}</label>
			<select
				id="raceId"
				name="raceId"
				bind:value={selectedRaceId}
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			>
				<option value="">{m.char_field_race_placeholder()}</option>
				{#each data.races as race}
					<option value={race.id}>{localize(race.name, getLocale())}</option>
				{/each}
			</select>

			{#if selectedRace}
				{#if selectedRace.description}
					<p class="mt-1 text-xs text-gray-500">
						{localize(selectedRace.description, getLocale())}
					</p>
				{/if}

				<!-- Stats preview -->
				<div class="mt-3 rounded-lg bg-gray-50 p-3">
					<p class="mb-2 text-xs font-medium text-gray-600">{m.char_stats_title()}</p>
					<div class="grid grid-cols-6 gap-2">
						{#each statKeys as key}
							<div class="flex flex-col items-center rounded-lg bg-white py-2 ring-1 ring-gray-200">
								<span class="text-xs font-medium text-gray-500">{statLabels[key]}</span>
								<span class="text-sm font-semibold text-gray-900">
									{selectedRace.baseStats[key]}
								</span>
							</div>
						{/each}
					</div>

					{#if selectedRace.raceSkills.length > 0}
						<p class="mb-1 mt-3 text-xs font-medium text-gray-600">{m.char_starting_skills()}</p>
						<div class="flex flex-wrap gap-1">
							{#each selectedRace.raceSkills as rs}
								<span class="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
									{localize(rs.skill.name, getLocale())}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Age -->
		<div class="flex flex-col gap-1">
			<label class="text-sm font-medium text-gray-700" for="age">{m.char_field_age()}</label>
			<input
				id="age"
				name="age"
				type="number"
				min="1"
				max="9999"
				class="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			/>
		</div>

		<!-- Body description -->
		<div class="flex flex-col gap-1">
			<label class="text-sm font-medium text-gray-700" for="bodyDescription">
				{m.char_field_body()}
			</label>
			<textarea
				id="bodyDescription"
				name="bodyDescription"
				rows="3"
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			></textarea>
		</div>

		<!-- Prehistory -->
		<div class="flex flex-col gap-1">
			<label class="text-sm font-medium text-gray-700" for="prehistory">
				{m.char_field_prehistory()}
			</label>
			<textarea
				id="prehistory"
				name="prehistory"
				rows="4"
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			></textarea>
		</div>

		<div class="flex justify-end">
			<button
				type="submit"
				class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
			>
				{m.char_create_submit()}
			</button>
		</div>
	</form>
</div>
