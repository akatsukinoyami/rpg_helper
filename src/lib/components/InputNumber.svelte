<script lang="ts">
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Label from './Label.svelte';

	interface Props extends HTMLInputAttributes {
		label?: string;
		value?: number;
	}

	let { label, id, value = $bindable(), required, ...rest }: Props = $props();
</script>

<div class={["flex flex-col gap-1", rest.class]}>
  <Label for={id} {label} {required} />
  <input
    {...rest}
    {id}
    {required}
    type="number"
    class={[fieldColors, fieldSpacing, "rounded-md border text-xs outline-none"]}
    bind:value
  />
</div>