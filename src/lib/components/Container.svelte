<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		maxWidth?: `max-w-${string}`;
		class?: string;
		children?: Snippet;
	}

	let { maxWidth = 'max-w-xl', class: className, children }: Props = $props();
</script>

<div class={["mx-auto", maxWidth, className]}>
  {@render children?.()}
</div>