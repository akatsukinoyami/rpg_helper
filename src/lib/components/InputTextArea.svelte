<script lang="ts">
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
    class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    bind:value
  ></textarea>
</div>