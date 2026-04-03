<script lang="ts">
	import { mdiPencil } from '@mdi/js';
	import * as m from '$lib/paraglide/messages';
	import { index } from '$lib/remote/item-types.remote';
	import Button from '$lib/components/Button.svelte';
	import Tile from '$lib/components/Tile.svelte';
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
>
	{#snippet child(entity, edits)}
		<Tile 
			title={entity.name} 
			subtitle="{entity.trackingMode === 'quantity' ? m.item_type_tracking_qty() : m.item_type_tracking_dur()} · {entity.trackingMode === 'durability' && entity.maxDurability ? `${entity.maxDurability} · ` : ''}{m.item_type_field_weight()}: {entity.weight}">
			<Button 
				icon={mdiPencil} 
				kind="secondary" 
				onclick={() => edits[entity.id] = true} 
				hidden={!data.isGm}
			/>
		</Tile>
	{/snippet}
</TypeIndex>
