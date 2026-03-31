<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Options } from '$lib/types';

	export interface Props extends HTMLInputAttributes {
		label?: string;
		options: Options;
		group: string;
	}
</script>

<script lang="ts">
  import { kinds } from "./Button.svelte";

  let { 
    label = '',
    options = {}, 
    group = $bindable(), 
    class: className, 
    ...rest 
  }: Props = $props();

  let optionsLocal = $derived(Array.isArray(options) ? options : Object.entries(options));
</script>

<div class="flex flex-col gap-2">
  {#if label} 
    <p class="text-sm font-medium text-gray-700">{label}</p>
  {/if}

  <div class="flex flex-wrap gap-2">
    {#each optionsLocal as [value, label]}
      <label
        class={["flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors flex-1", value === group ? kinds.selected : kinds.secondary]}
      >
        <input {...rest} type="radio" class="sr-only" {value} bind:group />
        {(typeof label === 'string' ? label : label?.()) ?? value}
      </label>
    {/each}
  </div>
</div>
