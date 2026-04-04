<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import CharacterForm from '$lib/partials/CharacterForm.svelte';
	import { createCharacter } from '$lib/remote/characters.remote';

	let { data }: { data: PageData } = $props();
</script>

<CharacterForm remoteForm={createCharacter} races={data.races} submitLabel={m.char_create_submit()} />
