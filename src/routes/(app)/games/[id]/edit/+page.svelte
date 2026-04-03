<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	import Button from '$lib/components/Button.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import GameForm from '$lib/partials/GameForm.svelte';
	import { editGame, transfer } from '$lib/remote/games.remote';

	let { data }: { data: PageData } = $props();
</script>

<div class="mb-6">
	<Button href={localizeHref(`/games/${data.game.id}`)} label="← {m.game_edit_back()}" kind="ghost" />
	<h1 class="mt-2 text-2xl font-semibold text-gray-900">{m.game_edit_title()}</h1>
</div>

<GameForm
	remoteForm={editGame}
	submitLabel={m.game_edit_submit()}
	name={data.game.name}
	description={data.game.description}
	image={data.game.image}
/>

{#if data.otherPlayers.length > 0}
	<section class="mt-6 border-t border-gray-200 pt-6">
		<h2 class="mb-4 text-lg font-medium text-gray-900">{m.game_transfer_gm()}</h2>
		<form {...transfer} class="flex items-end gap-3">
			<InputSelect
				id="newGmUserId"
				name="newGmUserId"
				label={m.game_transfer_gm_to()}
				options={data.otherPlayers.map((p) => [p.userId, p.user.name] as [string, string])}
			/>
			<Button type="submit" label={m.game_transfer_gm_submit()} kind="danger" />
		</form>
	</section>
{/if}

