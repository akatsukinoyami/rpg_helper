<script lang="ts">
	import { setContext, onDestroy, untrack } from 'svelte';
	import { invalidateAll, afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Navbar, { type NavTab, type NavAction } from '$lib/components/Navbar.svelte';
	import { WsStore, WS_CONTEXT_KEY } from '$lib/ws/wsStore.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { mdiArrowLeft, mdiCog, mdiPencil } from '@mdi/js';
	import { type Snippet } from 'svelte';
	import { type LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const ws = new WsStore(untrack(() => data.gameId));
	setContext(WS_CONTEXT_KEY, ws);
	const unsub = ws.on('game:updated', () => invalidateAll());
	onDestroy(() => { unsub(); ws.destroy(); });

	let addFormState = $state({ open: false });
	setContext('addFormState', addFormState);
	afterNavigate(() => { addFormState.open = false; });

	const base = $derived(localizeHref(`/games/${data.gameId}`));

	const tabs: NavTab[] = $derived([
		{ href: `${base}/locations`,  label: m.game_nav_locations,  active: page.url.pathname.startsWith(`${base}/locations`) },
		{ href: `${base}/feed`,       label: m.game_nav_feed,       active: page.url.pathname.startsWith(`${base}/feed`) },
		{ href: `${base}/characters`, label: m.game_nav_characters, active: page.url.pathname.startsWith(`${base}/characters`) },
		{ href: `${base}/items`,      label: m.game_nav_items,      active: page.url.pathname.startsWith(`${base}/items`) },
		{ href: `${base}/skills`,     label: m.game_nav_skills,     active: page.url.pathname.startsWith(`${base}/skills`) }
	]);

	const actions: NavAction[] = $derived([
		{ icon: mdiPencil, href: localizeHref(`/games/${data.game.id}/edit`), hidden: !data.isGm },
		{ icon: mdiCog,    href: localizeHref('/settings') },
		{ icon: mdiArrowLeft, href: localizeHref('/games') }
	]);
</script>

<Navbar
	title={data.game.name}
	titleHref={base}
	titleImage={data.game.image ?? undefined}
	onAdd={data.isGm ? () => addFormState.open = true : undefined}
	{tabs}
	{actions}
/>

<main class="mx-auto max-w-3xl p-3">
	{@render children()}
</main>
