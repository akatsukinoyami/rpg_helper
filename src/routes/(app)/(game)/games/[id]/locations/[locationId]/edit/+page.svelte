<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as locations from '$lib/remote/locations.remote';
	import Form from '../../form.svelte';

	let { data }: { data: { gameId: string } } = $props();

	const query = $derived(locations.index(page.params.locationId!));
	let open = $state(true);

	$effect(() => {
		if (!open) goto(localizeHref(`/games/${data.gameId}/locations/${page.params.locationId}`));
	});
</script>

{#if query.loading}
	<p class="text-sm text-gray-400">Loading…</p>
{:else if query.current}
	<Form action="edit" entity={query.current} bind:open />
{/if}
