<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { PageData } from './$types';
	import Button from '$lib/components/Button.svelte';
	import Container from '$lib/components/Container.svelte';
	import CharacterForm from '$lib/partials/CharacterForm.svelte';
	import { editCharacter } from '$lib/remote/characters.remote';

	let { data }: { data: PageData } = $props();

	const submitLabel = $derived(data.isGm ? m.char_edit_submit_gm : m.char_edit_submit_owner);
</script>

<Container>
	<div class="mb-6">
		<Button
			href={localizeHref(`/games/${data.game.id}`)}
			label="← {m.char_edit_back()}"
			kind="ghost"
		/>
		<h1 class="mt-2 text-2xl font-semibold text-gray-900">{m.char_edit_title()}</h1>
		<p class="mt-1 text-sm text-gray-500">{data.game.name}</p>
	</div>

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
</Container>
