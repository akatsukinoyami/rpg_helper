<script lang="ts">
	import { enhance } from '$app/forms'
	import * as m from '$lib/paraglide/messages'
	import { getLocale, localizeHref } from '$lib/paraglide/runtime'
	import { localize } from '$lib/localize'
	import type { ActionData, PageData } from './$types'
	import Button from '$lib/components/Button.svelte';
	import Container from '$lib/components/Container.svelte';
	import InputNumber from '$lib/components/InputNumber.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import InputTextArea from '$lib/components/InputTextArea.svelte';
	import StatPreview from '$lib/partials/StatPreview.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props()

	let selectedRaceId = $state('')

	const selectedRace = $derived(data.races.find((r) => r.id === selectedRaceId))
</script>

<Container>
	<div class="mb-6">
		<Button 
			class=''
			href={localizeHref(`/games/${data.game.id}`)} 
			label="← {m.char_create_back()}"
			kind="ghost"
		/>
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
		<InputText label={m.char_field_name()} id="name" name="name" required />

		<!-- Gender -->
		<InputSelect 
			label={m.char_field_gender()} 
			id="gender" 
			name="gender" 
			required
			options={{ none: m.char_gender_none(), male: m.char_gender_male(), female: m.char_gender_female(), both: m.char_gender_both() }}
		/>

		<!-- Race -->
		<div class="flex flex-col gap-1">
			<InputSelect 
				label={m.char_field_race()}
				id="raceId"
				name="raceId"
				required
				bind:value={selectedRaceId}
				options={data.races.map(race => [race.id, localize(race.name, getLocale())] as [string, string])}
			/>

			{#if selectedRace}
				{#if selectedRace.description}
					<p class="mt-1 text-xs text-gray-500">
						{localize(selectedRace.description, getLocale())}
					</p>
				{/if}

				<StatPreview {selectedRace} />
			{/if}
		</div>

		<InputNumber id="age" name="age" min="1" max="9999" label={m.char_field_age()} />

		<InputTextArea
			rows={4}
			id="bodyDescription"
			name="bodyDescription" 
			label={m.char_field_body()}
		/>

		<InputTextArea
			rows={4}
			id="prehistory"
			name="prehistory" 
			label={m.char_field_prehistory()}
		/>

		<div class="flex justify-end">
			<Button type="submit" label={m.char_create_submit()} />
		</div>
	</form>
</Container>
