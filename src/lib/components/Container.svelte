<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		maxWidth?: `max-w-${string}`;
		children?: Snippet;
	}

	let { maxWidth = 'max-w-lg', children }: Props = $props();
</script>

<div class={["mx-auto", maxWidth]}>
  {@render children?.()}
</div>