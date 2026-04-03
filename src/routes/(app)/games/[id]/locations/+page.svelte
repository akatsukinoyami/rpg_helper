<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { index } from '$lib/remote/locations.remote';
	import TypeIndex from '$lib/partials/TypeIndex.svelte';
	import { type PageData } from './$types';
	import Form from './form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<TypeIndex isGm={data.isGm} {index} {Form} dict={{ empty: m.location_no_items() }} />
