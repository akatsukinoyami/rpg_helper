<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import CharacterForm from '$lib/partials/CharacterForm.svelte';
	import { editCharacter } from '$lib/remote/characters.remote';

	let { data }: { data: PageData } = $props();

	const submitLabel = $derived(data.isGm ? m.char_edit_submit_gm : m.char_edit_submit_owner);
</script>

<CharacterForm
	remoteForm={editCharacter}
	races={data.races}
	name={data.character.name}
	gender={data.character.gender}
	raceId={data.character.raceId}
	age={data.character.age}
	image={data.character.image}
	bodyDescription={data.character.bodyDescription}
	prehistory={data.character.prehistory}
	submitLabel={submitLabel()}
/>
