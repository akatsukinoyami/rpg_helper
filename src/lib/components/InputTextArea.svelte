<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { fieldColors } from '$lib/constants/styles';
	import Label from '$lib/components/Label.svelte';

	interface Props extends HTMLTextareaAttributes {
		label?: string;
		value?: string | number;
	}

	let { label, id, value = $bindable(), required, ...rest }: Props = $props();
</script>

<div class="flex flex-col gap-1">
  <Label for={id} {label} {required}/>
  <textarea
    {...rest}
    {id}  
    {required}
    class={[fieldColors, "rounded-lg border px-2 py-1 text-sm outline-none"]}
    bind:value
  ></textarea>
</div>