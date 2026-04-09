<script lang="ts" module>
	import SkillForm from '../../routes/(app)/(game)/games/[id]/skills/form.svelte';
	import ItemForm from '../../routes/(app)/(game)/games/[id]/items/form.svelte';
	import LocationForm from '../../routes/(app)/(game)/games/[id]/locations/form.svelte';
	import RaceForm from '../../routes/(app)/(game)/games/[id]/races/form.svelte';
	import * as item from '../remote/item-types.remote';
	import * as skill from '../remote/skill-types.remote';
	import * as location from '../remote/locations.remote';
	import * as race from '../remote/races.remote';

	interface Props {
		isGm: boolean;
		index: typeof item.index | typeof skill.index | typeof location.index | typeof race.index;
		Form: typeof ItemForm | typeof SkillForm | typeof LocationForm | typeof RaceForm;
		dict?: {
			error?: string;
			loading?: string;
			empty?: string;
		};
		titleGetter?: (e: any) => string;
		subtitleGetter?: (e: any) => string;
		hrefGetter?: (e: any) => string;
		itemsGetter?: (current: any) => any[];
	}
</script>

<script lang="ts">
  import { mdiPencil } from '@mdi/js';
  import { getContext } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import FunctionLoad from '$lib/components/FunctionLoad.svelte';
  import Tile from '$lib/components/Tile.svelte';

  let {
    isGm,
    index,
    Form,
    dict = {},
    titleGetter = (e) => e.name,
    subtitleGetter = (e) => e.description,
    hrefGetter,
    itemsGetter = (c) => c ?? []
  }: Props = $props();

  let addFormState = getContext<{ open: boolean }>('addFormState');
  let edits = $state<Record<string, boolean>>({});
</script>

{#if isGm}
  <Form action="create" bind:open={addFormState.open} />
{/if}

<FunctionLoad remoreFunc={() => (index as () => ReturnType<typeof index>)()} messages={dict}>
  {#snippet content(store)}
    {@const items = itemsGetter(store.current)}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-start gap-2">
      {#each items as entity (entity.id)}
        {#if !edits[entity.id] || hrefGetter}
          <Tile
            title={titleGetter(entity)}
            subtitle={subtitleGetter(entity)}
            image={entity.image}
            href={hrefGetter?.(entity)}
          >
            {#if !hrefGetter}
              <Button
                icon={mdiPencil}
                kind="ghost"
                onclick={() => edits[entity.id] = true}
                hidden={!isGm}
              />
            {/if}
          </Tile>
        {:else if isGm}
          <Form action="edit" {entity} bind:open={edits[entity.id]} />
        {/if}
      {/each}
    </div>
  {/snippet}
</FunctionLoad>
