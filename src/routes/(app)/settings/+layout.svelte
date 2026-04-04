<script lang="ts">
	import { page } from '$app/state';
	import Navbar from '$lib/components/Navbar.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	const base = $derived(localizeHref(`/settings`));

</script>

<Navbar
	title={m.nav_settings()}
	titleHref={localizeHref('/')}
	tabs={[
		{ href: `${base}/style`,      label: m.settings_page_style,      active: page.url.pathname.startsWith(`${base}/style`) },
		{ href: `${base}/account`,    label: m.settings_page_account,    active: page.url.pathname.startsWith(`${base}/account`) }
	]}
/>

<main class="mx-auto max-w-5xl p-4">
	{@render children()}
</main>
