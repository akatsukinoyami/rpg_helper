<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	import Button from '$lib/components/Button.svelte';
	import Container from '$lib/components/Container.svelte';
	import GameForm from '$lib/partials/GameForm.svelte';
	import { editGame } from '$lib/remote/games.remote';

	let { data }: { data: PageData } = $props();
</script>

<Container>

	<div class="mb-6">
		<Button class="" href={localizeHref(`/games/${data.game.id}`)} label="← {m.game_edit_back()}" kind="ghost" />
		<h1 class="mt-2 text-2xl font-semibold text-gray-900">{m.game_edit_title()}</h1>
	</div>

	<GameForm
		remoteForm={editGame}
		submitLabel={m.game_edit_submit()}
		name={data.game.name}
		description={data.game.description}
		image={data.game.image}
	/>
</Container>

