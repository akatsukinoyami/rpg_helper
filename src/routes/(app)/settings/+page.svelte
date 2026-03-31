<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	import Button from '$lib/components/Button.svelte';
	import ButtonRadioSet from '$lib/components/InputButtonRadioSet.svelte';
	import Container from '$lib/components/Container.svelte';
	import Palette from '$lib/components/Palette.svelte';

	let { data }: { data: PageData } = $props();

	const schemeLabels: Record<string, () => string> = {
		github: m.settings_scheme_github,
		catppuccin: m.settings_scheme_catppuccin,
		gruvbox: m.settings_scheme_gruvbox
	};

	const modeLabels: Record<string, () => string> = {
		light: m.settings_mode_light,
		dark: m.settings_mode_dark,
		system: m.settings_mode_system
	};

	const langLabels: Record<string, string> = {
		en: 'English',
		ru: 'Русский',
		ua: 'Українська'
	};

	const saved = $derived(page.url.searchParams.get('saved') === '1');

	// Initialize from server-loaded values, not from client-side getLocale().
	// getLocale() on the client reads document.cookie, which may not reflect
	// the saved cookie until the next full navigation.
	async function signOut() {
		await authClient.signOut();
		goto('/sign_in');
	}

	let selectedLocale = $state(untrack(() => data.locale));
	let previewScheme = $state(untrack(() => data.prefs.scheme));
	let previewMode = $state(untrack(() => data.prefs.mode));

	// Live preview — update data-theme immediately as user picks
	$effect(() => {
		document.documentElement.setAttribute('data-theme', `${previewScheme}-${previewMode}`);
	});
</script>

<Container>
	<h1 class="mb-6 text-2xl font-semibold text-gray-900">{m.settings_title()}</h1>

	{#if saved}
		<div class="mb-6 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
			{m.settings_saved()}
		</div>
	{/if}

	<form
		method="post"
		use:enhance={() => {
			// Force a full navigation so the server re-reads both cookies
			// (PARAGLIDE_LOCALE and rph_theme) and re-runs handleParaglide + handleTheme.
			return async ({ result }) => {
				if (result.type === 'redirect') {
					window.location.href = result.location
				}
			}
		}}
		class="flex flex-col gap-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200"
	>
		<ButtonRadioSet label={m.settings_lang_label()} name="locale" options={langLabels} bind:group={selectedLocale} />
		<ButtonRadioSet label={m.settings_scheme_label()} name="scheme" options={schemeLabels} bind:group={previewScheme} />
		<ButtonRadioSet label={m.settings_mode_label()} name="mode" options={modeLabels} bind:group={previewMode} />

		<Palette />

		<div class="flex justify-between">
			<Button label={m.nav_signout()} onclick={signOut} kind="danger" />
			<Button	label={m.settings_save()} type="submit"	/>
		</div>
	</form>
</Container>
