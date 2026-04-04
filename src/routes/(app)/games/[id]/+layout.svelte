<script lang="ts">
	import { setContext, onDestroy, untrack } from 'svelte';
	import { invalidateAll, afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Button, { type Props as ButtonProps } from '$lib/components/Button.svelte';
	import Container from '$lib/components/Container.svelte';
	import TabNav from '$lib/components/TabNav.svelte';
	import { WsStore, WS_CONTEXT_KEY } from '$lib/ws/wsStore.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { mdiPencil, mdiPlus } from '@mdi/js';
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

	let tabs = $derived([
			{ href: `${base}/locations`,   label: m.game_nav_locations() },
			{ href: `${base}/feed`,        label: m.game_nav_feed() },
			{ href: `${base}/characters`,  label: m.game_nav_characters() },
			{ href: `${base}/items`,       label: m.game_nav_items() },
			{ href: `${base}/skills`,      label: m.game_nav_skills() },
			...(data.isGm ? [{ icon: mdiPlus, onclick: () => addFormState.open = true }] : [])
		])
</script>

<Container class="flex flex-col gap-2">
	<!-- Game header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			{#if data.game.image}
				<img src={data.game.image} alt="" class="h-10 w-10 shrink-0 rounded-full object-cover" />
			{/if}
			<div class="flex items-baseline gap-2">
				<h1 class="text-lg font-semibold text-gray-900">{data.game.name}</h1>
				<p class="text-xs text-gray-400">GM: <span class="font-medium text-gray-500">{data.game.gm.name}</span></p>
			</div>
		</div>
		{#if data.isGm}
			<Button href={localizeHref(`/games/${data.game.id}/edit`)} icon={mdiPencil} kind="ghost" />
		{/if}
	</div>

	<TabNav
		options={tabs}
		isActive={({ href = '' }: ButtonProps) => href === base ? page.url.pathname === href : page.url.pathname.startsWith(href)}
	/>

	{@render children()}
</Container>
