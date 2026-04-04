<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { PageData } from './$types';
	import Button from '$lib/components/Button.svelte';
	import Container from '$lib/components/Container.svelte';
	import CharacterForm from '$lib/partials/CharacterForm.svelte';
	import { createCharacter } from '$lib/remote/characters.remote';

	let { data }: { data: PageData } = $props();
</script>

<Container>
	<div class="mb-6">
		<Button
			href={localizeHref(`/games/${data.game.id}/characters`)}
			label="← {m.char_create_back()}"
			kind="ghost"
		/>
		<h1 class="mt-2 text-2xl font-semibold text-gray-900">{m.char_create_title()}</h1>
		<p class="mt-1 text-sm text-gray-500">{data.game.name}</p>
	</div>

	<CharacterForm remoteForm={createCharacter} races={data.races} submitLabel={m.char_create_submit()} />
</Container>
