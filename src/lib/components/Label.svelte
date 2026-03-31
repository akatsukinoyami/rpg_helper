<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';

	interface Props extends HTMLLabelAttributes {
		label?: string;
		required?: boolean | null | undefined;
	}
	let { label, required, for: id }: Props = $props();
</script>

{#if label}
  <label class="text-sm font-medium text-gray-700" for={id}>
    {label}
    {#if required}<span class="text-red-900">*</span>{/if}
  </label>
{/if}