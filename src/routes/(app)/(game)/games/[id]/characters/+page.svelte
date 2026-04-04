<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Button from '$lib/components/Button.svelte';
	import Tile from '$lib/components/Tile.svelte';

	let { data }: { data: { gameId: string } } = $props();
</script>

<Tile title={m.char_no_character()} kind="info">
	<Button href={localizeHref(`/games/${data.gameId}/characters/new`)} label={m.char_create_button()} />
</Tile>
