<script lang="ts">
	import { mdiPencil } from '@mdi/js';
	import { index } from '$lib/remote/skill-types.remote';
	import Button from '$lib/components/Button.svelte';
	import Tile from '$lib/components/Tile.svelte';
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
	dict={{ empty: m.skill_type_no_skills() }}
>
	{#snippet child(entity, edits)}
		{#if !edits[entity.id]}
			<Tile title={entity.name} subtitle={entity?.description}>
				<Button 
					icon={mdiPencil} 
					kind="secondary" 
					onclick={() => edits[entity.id] = true} 
					hidden={!data.isGm}
				/>
			</Tile>
		{:else if data.isGm}
			<Form action="edit" {entity} bind:open={edits[entity.id]} />
		{/if}
	{/snippet}
</TypeIndex>