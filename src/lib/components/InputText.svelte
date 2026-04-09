<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';
	import Label from '$lib/components/Label.svelte';

	interface Props extends HTMLInputAttributes {
		label?: string;
		value?: string | number;
	}

	let { label, id, type = 'text', required, value = $bindable(), ...rest }: Props = $props();
</script>

<div class={["flex flex-col gap-1", rest.class]}>
  <Label for={id} {label} {required}/>

  <input
    {...rest}
    {id}
    {type}
    {required}
    class={[fieldColors, fieldSpacing, "rounded-md border text-xs outline-none"]}
    bind:value
  />
</div>