<script lang="ts">
  import { fieldColors } from '$lib/constants';
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    label?: string;
    value?: string;
  }

  let {
    label,
    id,
    value = $bindable(),
    ...rest
  }: Props = $props()
</script>

<div class="flex flex-col gap-1">
  <label class="text-sm font-medium text-gray-700" for={id}>{label}</label>
  <textarea
    {...rest}
    {id}  
    class={[fieldColors, "rounded-lg border px-3 py-2 text-sm  outline-none"]}
    bind:value
  ></textarea>
</div>