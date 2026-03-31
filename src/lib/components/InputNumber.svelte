<script lang="ts">
	import { fieldColors } from '$lib/constants';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		value?: number;
	}

	let { label, id, value = $bindable(), ...rest }: Props = $props();
</script>

<div class="flex flex-col gap-1">
  <label class="text-sm font-medium text-gray-700" for={id}>{label}</label>
  <input
    {...rest}
    {id}
    type="number"
    class={[fieldColors, "rounded-lg border px-3 py-2 text-sm  outline-none"]}
    bind:value
  />
</div>