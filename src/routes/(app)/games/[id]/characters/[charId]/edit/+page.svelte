<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { ActionData, PageData } from './$types';
	import Button from '$lib/components/Button.svelte';
	import Container from '$lib/components/Container.svelte';
	import CharacterForm from '$lib/partials/CharacterForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const submitLabel = data.isGm ? m.char_edit_submit_gm() : m.char_edit_submit_owner();
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

	{#if form?.error === 'name_required'}
		<div class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
			{m.char_error_name_required()}
		</div>
	{/if}

	<CharacterForm
		races={data.races}
		name={data.character.name}
		gender={data.character.gender}
		raceId={data.character.raceId}
		age={data.character.age}
		image={data.character.image}
		bodyDescription={data.character.bodyDescription}
		prehistory={data.character.prehistory}
		{submitLabel}
	/>
</Container>
