<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { index } from '$lib/remote/locations.remote';
	import { localizeHref } from '$lib/paraglide/runtime';
	import TypeIndex from '$lib/partials/TypeIndex.svelte';
	import { type PageData } from './$types';
	import Form from './form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<TypeIndex
	{index}
	{Form}
	isGm={data.isGm}
	itemsGetter={(c) => c?.children ?? []}
	hrefGetter={(e) => localizeHref(`/games/${data.gameId}/locations/${e.id}`)}
	dict={{ empty: m.location_no_items() }}
/>
