<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { fieldColors } from '$lib/constants';
  import Label from '$lib/components/Label.svelte';

  interface Props extends HTMLInputAttributes {
    label?: string;
    value?: string;
  }

  let {
    label,
    id,
    type = 'text',
    required,
    value = $bindable(),
    ...rest
  }: Props = $props()
</script>

<div class="flex flex-col gap-1">
  <Label for={id} {label} {required}/>

  <input
    {...rest}
    {id}
    {type}
    {required}
    class={[fieldColors, "rounded-lg border px-3 py-2 text-sm  outline-none"]}
    bind:value
  />
</div>