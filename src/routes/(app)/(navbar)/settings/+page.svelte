<script lang="ts">
	import { page } from '$app/state';
	import ButtonRadioSet from '$lib/components/InputButtonRadioSet.svelte';
	import Container from '$lib/components/Container.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import TabAccount from './tab_account.svelte';
	import TabStyle from './tab_style.svelte';

	let { data }: { data: PageData } = $props();

	const settingsComponents = {
		style: TabStyle,
		account: TabAccount
	} as const;

	type PageName = keyof typeof settingsComponents;

	const settingsOptions = {
		style: m.settings_page_style,
		account: m.settings_page_account
	} as const satisfies Record<PageName, () => m.LocalizedString>;

	let selectedPageName = $state<PageName>('style');
	let Page = $derived(settingsComponents[selectedPageName]);
</script>

<Container class="flex flex-col gap-4">
	<h1 class="text-2xl font-semibold text-gray-900">
		{m.settings_title()}
	</h1>

	<ButtonRadioSet 
		options={settingsOptions} 
		bind:group={selectedPageName} 
		kind="ghost" 
	/>

	<Page {data} />
</Container>
