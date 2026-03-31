<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import type { LayoutData } from './$types'

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props()
</script>

<div class="min-h-screen bg-gray-50">
	<Navbar appTitle="RPG Helper" user={data.user} />

	<main class="mx-auto max-w-5xl px-4 py-8">
		{@render children()}
	</main>
</div>
