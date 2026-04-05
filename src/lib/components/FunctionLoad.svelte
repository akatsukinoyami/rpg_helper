<script lang="ts" module>
	import type { RemoteQuery } from '@sveltejs/kit';
	import type { Snippet } from 'svelte';

	interface Props {
		remoreFunc: () => RemoteQuery<any>;
		messages?: {
			error?: string;
			loading?: string;
			empty?: string;
		};
		content?: Snippet<[store: RemoteQuery<any>]>;
	}
</script>

<script lang="ts">
  import * as m from '$lib/paraglide/messages';

  let { remoreFunc, messages = {}, content }: Props = $props();

  const store = $derived(remoreFunc());

  let {
    error = m.load_error(),
    loading = m.load_loading(),
    empty = m.load_empty()
  } = $derived(messages);
</script>

{#if store.error}
  <p class="text-sm text-gray-400">{error}</p>
{:else if store.loading}
  <p class="text-sm text-gray-400">{loading}</p>
{:else}
  {#if Array.isArray(store.current) && store.current.length === 0}
    <p class="text-sm text-gray-400">{empty}</p>
  {:else}
    {@render content?.(store)}
  {/if}
{/if}
