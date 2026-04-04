<script lang="ts" module>
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { Options } from '$lib/types';
	import Label from '$lib/components/Label.svelte';

	export interface Props extends HTMLSelectAttributes {
		label?: string;
		value?: string;
		options: Options;
	}
</script>

<script lang="ts">
  let { 
    label = '',
    options = {}, 
    value = $bindable(),
    id,
    required,
    ...rest 
  }: Props = $props();

  let optionsLocal = $derived(Array.isArray(options) ? options : Object.entries(options));
</script>

<div class="flex flex-col gap-1">
  <Label for={id} {label} {required} />
  <select
    {...rest}
    {id}
    {required}
    bind:value
    class={[fieldColors, fieldSpacing, "rounded-md border text-xs outline-none"]}
  >
    {#each optionsLocal as [value, label]}
      <option {value}>{label}</option>
    {/each}
  </select>
</div>