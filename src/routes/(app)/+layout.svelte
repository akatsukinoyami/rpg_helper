<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<Navbar appTitle="RPG Helper" />

	<main class="mx-auto max-w-5xl p-4">
		{@render children()}
	</main>
</div>
