<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';

	interface Props extends HTMLLabelAttributes {
		label?: string;
		required?: boolean | null | undefined;
    inline?: boolean;
	}
	let { label, for: id, class: className, required, inline }: Props = $props();
</script>

{#if label}
  <label class={[className, "text-sm font-medium text-gray-700"]} for={id}>
    {label}
    {#if required}<span class="text-red-900">*</span>{/if}
  </label>
{/if}