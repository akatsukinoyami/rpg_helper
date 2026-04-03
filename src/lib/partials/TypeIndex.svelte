<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
  import SkillForm from '../../routes/(app)/games/[id]/skills/form.svelte';
  import ItemForm from '../../routes/(app)/games/[id]/items/form.svelte';
  import { index as indexItems } from '../remote/item-types.remote';
  import { index as indexSkills } from '../remote/skill-types.remote';

  interface Props {
    isGm: boolean;
    child: Snippet<[entity: any, edits: Record<string, boolean>]>;
    index: typeof indexItems | typeof indexSkills;
    Form: typeof ItemForm | typeof SkillForm;
    dict?: {
      error?: string;
      loading?: string;
      empty?: string;
    }
  }

	let { isGm, child, index, Form, dict = {} }: Props = $props();

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
          {@render child(entity, edits)}
        {:else if isGm}
          <Form action="edit" {entity} bind:open={edits[entity.id]} />
        {/if}
			{/each}
		</div>
	{/if}
{/if}