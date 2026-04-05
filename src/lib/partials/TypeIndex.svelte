<script lang="ts" module>
  import SkillForm from '../../routes/(app)/(game)/games/[id]/skills/form.svelte';
  import ItemForm from '../../routes/(app)/(game)/games/[id]/items/form.svelte';
  import LocationForm from '../../routes/(app)/(game)/games/[id]/locations/form.svelte';
  import * as item from '../remote/item-types.remote';
  import * as skill from '../remote/skill-types.remote';
  import * as location from '../remote/locations.remote';

  interface Props {
    isGm: boolean;
    index: typeof item.index | typeof skill.index | typeof location.index;
    Form: typeof ItemForm | typeof SkillForm | typeof LocationForm;
    dict?: {
      error?: string;
      loading?: string;
      empty?: string;
    }
    titleGetter?: (e: any) => string;
    subtitleGetter?: (e: any) => string;
    hrefGetter?: (e: any) => string;
    itemsGetter?: (current: any) => any[];
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
    subtitleGetter = (e) => e.description,
    hrefGetter,
    itemsGetter = (c) => c ?? []
  }: Props = $props();

  const query = index();
  const items = $derived(itemsGetter(query.current));
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
  {#if items.length === 0}
    <p class="text-sm text-gray-400">{empty}</p>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-start gap-2">
      {#each items as entity (entity.id)}
        {#if !edits[entity.id] || hrefGetter}
          <Tile
            title={titleGetter(entity)}
            subtitle={subtitleGetter(entity)}
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
  {/if}
{/if}
