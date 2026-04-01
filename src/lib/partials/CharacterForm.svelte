<script lang="ts">
	import { untrack } from 'svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import { localize } from '$lib/localize';
	import * as m from '$lib/paraglide/messages';
	import type { LocalizedText, Stats } from '$lib/server/db/schema';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import Button from '$lib/components/Button.svelte';
	import InputNumber from '$lib/components/InputNumber.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import InputTextArea from '$lib/components/InputTextArea.svelte';
	import StatPreview from '$lib/partials/StatPreview.svelte';

	interface RaceOption {
		id: string;
		name: LocalizedText;
		description?: LocalizedText | null;
		baseStats: Stats;
		raceSkills: { skill: { name: LocalizedText } }[];
	}

	interface Props {
		remoteForm: Record<string, unknown>;
		label?: string;
		races: RaceOption[];
		name?: string;
		gender?: string;
		raceId?: string | null;
		age?: number | null;
		image?: string | null;
		bodyDescription?: string | null;
		prehistory?: string | null;
		submitLabel?: string;
	}

	let {
		remoteForm,
		label,
		races,
		name = '',
		gender = 'none',
		raceId = null,
		age = null,
		image = null,
		bodyDescription = '',
		prehistory = '',
		submitLabel
	}: Props = $props();

	let selectedRaceId = $state(untrack(() => raceId ?? ''));
	const selectedRace = $derived(races.find((r) => r.id === selectedRaceId));
</script>

<div class="rounded-2xl bg-white p-4 ring-1 ring-gray-200 flex flex-col gap-4">
	{#if label}
		<h2 class="text-lg font-medium text-gray-900">{label}</h2>
	{/if}

	<form {...remoteForm} class="flex flex-col gap-6">
		<AvatarUpload name="image" type="character" label={m.char_field_avatar()} value={image} />

		<InputText label={m.char_field_name()} id="name" name="name" value={name} required />

		<InputSelect
			label={m.char_field_gender()}
			id="gender"
			name="gender"
			required
			value={gender}
			options={{ none: m.char_gender_none(), male: m.char_gender_male(), female: m.char_gender_female(), both: m.char_gender_both() }}
		/>

		<div class="flex flex-col gap-1">
			<InputSelect
				label={m.char_field_race()}
				id="raceId"
				name="raceId"
				required
				bind:value={selectedRaceId}
				options={races.map((race) => [race.id, localize(race.name, getLocale())] as [string, string])}
			/>
			{#if selectedRace}
				{#if selectedRace.description}
					<p class="mt-1 text-xs text-gray-500">{localize(selectedRace.description, getLocale())}</p>
				{/if}
				<StatPreview {selectedRace} />
			{/if}
		</div>

		<InputNumber id="age" name="age" min="1" max="9999" label={m.char_field_age()} value={age ?? undefined} />

		<InputTextArea rows={4} id="bodyDescription" name="bodyDescription" label={m.char_field_body()} value={bodyDescription ?? ''} />

		<InputTextArea rows={4} id="prehistory" name="prehistory" label={m.char_field_prehistory()} value={prehistory ?? ''} />

		<div class="flex justify-end">
			<Button type="submit" label={submitLabel ?? m.char_create_submit()} />
		</div>
	</form>
</div>
