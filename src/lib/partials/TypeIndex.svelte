<script lang="ts" module>
	import { type Snippet } from 'svelte';
  import SkillForm from '../../routes/(app)/games/[id]/skills/form.svelte';
  import ItemForm from '../../routes/(app)/games/[id]/items/form.svelte';
  import LocationForm from '../../routes/(app)/games/[id]/locations/form.svelte';
  import { index as indexItems } from '../remote/item-types.remote';
  import { index as indexSkills } from '../remote/skill-types.remote';
  import { index as indexLocations } from '../remote/locations.remote';

  interface Props {
    isGm: boolean;
    index: typeof indexItems | typeof indexSkills | typeof indexLocations;
    Form: typeof ItemForm | typeof SkillForm | typeof LocationForm;
    dict?: {
      error?: string;
      loading?: string;
      empty?: string;
    }
    titleGetter?: (e: any) => string
    subtitleGetter?: (e: any) => string
  }

</script>

<script lang="ts">
  import { mdiPencil } from '@mdi/js';
	import { getContext } from 'svelte';
  import Tile from '$lib/components/Tile.svelte';
  import Button from '$lib/components/Button.svelte';

	let { 
    isGm, 
    index,
    Form, 
    dict = {},
    titleGetter = (e) => e.name,
    subtitleGetter = (e) => e.description
  }: Props = $props();

	const query = index();
  let { 
    error = "Error on load", 
    loading = "Loading", 
    empty = "No anything here"
  } = $derived(dict);
	let addFormState = getContext<{ open: boolean }>('addFormState');
	let edits = $state<Record<string, boolean>>({});
</script>

{#if isGm}
	<Form action="create" bind:open={addFormState.open} />
{/if}

{#if query.error}
	<p class="text-sm text-gray-400">{error}</p>
{:else if query.loading}
	<p class="text-sm text-gray-400">{loading}</p>
{:else}
	{#if query.current?.length === 0}
		<p class="text-sm text-gray-400">{empty}</p>
	{:else}
		<div class="grid grid-cols-2 items-start gap-2">
			{#each query.current as entity (entity.id)}
        {#if !edits[entity.id]}
          <Tile title={titleGetter(entity)} subtitle={subtitleGetter(entity)}>
            <Button 
              icon={mdiPencil} 
              kind="ghost" 
              onclick={() => edits[entity.id] = true} 
              hidden={!isGm}
            />
          </Tile>
        {:else if isGm}
          <Form action="edit" {entity} bind:open={edits[entity.id]} />
        {/if}
			{/each}
		</div>
	{/if}
{/if}