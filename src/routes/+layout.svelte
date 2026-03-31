<script lang="ts">
	import { page } from '$app/state'
	import { locales, localizeHref } from '$lib/paraglide/runtime'
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import type { LayoutData } from './$types'

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props()

	// Keep data-theme in sync across client-side navigations.
	// SSR sets it via transformPageChunk on first load; this keeps it correct afterwards.
	$effect(() => {
		document.documentElement.setAttribute('data-theme', data.theme)
		localStorage.setItem('rph_theme', data.theme)
	})
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
