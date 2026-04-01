<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Options } from '$lib/types';
	import type { ButtonKind } from '$lib/components/Button.svelte';

	export interface Props extends HTMLInputAttributes {
		label?: string;
		options: Options;
		group: string;
		inline?: boolean;
		labelClass?: string;
		kind?: ButtonKind;
	}
</script>

<script lang="ts">
  import { kinds } from "$lib/components/Button.svelte";
  import Label from '$lib/components/Label.svelte';

  let { 
    label = '',
    options = {}, 
    group = $bindable(), 
    class: className, 
    inline = false,
    labelClass = '',
    kind = 'secondary',
    ...rest 
  }: Props = $props();

  let optionsLocal = $derived(Array.isArray(options) ? options : Object.entries(options));
</script>

<div class={["flex gap-2", inline ? 'items-center' : 'flex-col']}>
  <Label class={labelClass} {label} {inline} />

  <div class="flex flex-wrap gap-2 w-full">
    {#each optionsLocal as [value, label]}
      <label
        class={[
          "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors flex-1", 
          value === group ? kinds.selected : kinds[kind]
        ]}
      >
        <input {...rest} type="radio" class="sr-only" {value} bind:group />
        {(typeof label === 'string' ? label : label?.()) ?? value}
      </label>
    {/each}
  </div>
</div>
