<script lang="ts">
	import { index } from '$lib/remote/races.remote';
	import * as m from '$lib/paraglide/messages';
	import TypeIndex from '$lib/partials/TypeIndex.svelte';
	import { type PageData } from './$types';
	import Form from './form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<TypeIndex
	isGm={data.isGm}
	{index}
	{Form}
	dict={{ empty: m.race_no_races() }}
/>
