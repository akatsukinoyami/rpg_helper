<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { mdiCog } from '@mdi/js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<title>RPG | Games</title>
</svelte:head>

<Navbar
	title="RPG Helper"
	titleHref={localizeHref('/')}
	actions={[{ icon: mdiCog, href: localizeHref('/settings') }]}
/>

<main class="mx-auto max-w-5xl p-4">
	{@render children()}
</main>
