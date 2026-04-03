<script lang="ts">
	import { setContext, onDestroy, untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment';
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

	let addFormState = $state({ open: false });
	setContext('addFormState', addFormState);

	const unsub = ws.on('game:updated', () => invalidateAll());
	onDestroy(() => { unsub(); ws.destroy(); });

	const base = $derived(localizeHref(`/games/${data.game.id}`));
</script>

<Container class="flex flex-col gap-4">
	<!-- Game header -->
	<div class="flex items-start justify-between">
		<div class="flex items-start gap-4">
			{#if data.game.image}
				<img src={data.game.image} alt="" class="h-16 w-16 shrink-0 rounded-full object-cover" />
			{/if}
			<div>
				<h1 class="text-2xl font-semibold text-gray-900">{data.game.name}</h1>
				<p class="mt-2 text-sm text-gray-400">
					GM: <span class="font-medium text-gray-600">{data.game.gm.name}</span>
				</p>
			</div>
		</div>
		{#if data.isGm}
			<Button href={localizeHref(`/games/${data.game.id}/edit`)} icon={mdiPencil} kind="secondary" />
		{/if}
	</div>

	<TabNav 
		options={[
			{ href: base,   							 label: m.game_nav_locations() },
			{ href: `${base}/feed`,        label: m.game_nav_feed() },
			{ href: `${base}/characters`,  label: m.game_nav_characters() },
			{ href: `${base}/items`,       label: m.game_nav_items() },
			{ href: `${base}/skills`,      label: m.game_nav_skills() },
			{ icon: mdiPlus,							 onclick: () => addFormState.open = true }
		]} 
		isActive={({ href = '' }: ButtonProps) => href === base ? page.url.pathname === href : page.url.pathname.startsWith(href)}
		onclick={(e: MouseEvent) => {
			const btn = (e.target as HTMLElement).closest('a, button');
			if (!btn || btn.hasAttribute('href')) addFormState.open = false;
		}}
	/>

	{@render children()}
</Container>
