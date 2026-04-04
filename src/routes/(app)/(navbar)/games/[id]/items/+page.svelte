<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { index } from '$lib/remote/item-types.remote';
	import TypeIndex from '$lib/partials/TypeIndex.svelte';
	import { type PageData } from './$types';
	import Form from './form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<TypeIndex
	isGm={data.isGm}
	{index}
	{Form}
	dict={{ empty: m.item_type_no_items() }}
	titleGetter={(entity) => entity.name}
	subtitleGetter={(entity) => ([
		entity.trackingMode === 'quantity' ? m.item_type_tracking_qty() : m.item_type_tracking_dur(),
		entity.trackingMode === 'durability' && entity.maxDurability ? entity.maxDurability : '',
		`${m.item_type_field_weight()}: ${entity.weight}`
	].filter(Boolean).join(' · '))}
/>
