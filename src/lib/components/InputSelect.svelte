<script lang="ts" module>
  import type { HTMLSelectAttributes } from "svelte/elements";
  import type { Options } from "$lib/types";

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
    ...rest 
  }: Props = $props();

  let optionsLocal = $derived(Array.isArray(options) ? options : Object.entries(options));
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <label class="text-sm font-medium text-gray-700" for={id}>
      {label}
    </label>
  {/if}
  <select
    {...rest}
    {id}
    bind:value
    class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
  >
    {#each optionsLocal as [value, label]}
      <option {value}>{label}</option>
    {/each}
  </select>
</div>