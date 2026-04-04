<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Form from '../form.svelte';

	let { data }: { data: { gameId: string } } = $props();

	const parentId = $derived(page.url.searchParams.get('parentId') ?? '');
	let open = $state(true);

	$effect(() => {
		if (!open) goto(localizeHref(`/games/${data.gameId}/locations`));
	});
</script>

<Form action="create" defaultParentId={parentId} bind:open />
