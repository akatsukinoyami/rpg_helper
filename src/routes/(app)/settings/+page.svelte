<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
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

	async function signOut() {
		await authClient.signOut();
		goto('/sign_in');
	}

	const forceReload = () =>
		async ({ result }: { result: { type: string; location?: string } }) => {
			if (result.type === 'redirect') {
				window.location.href = result.location!;
			}
		};

	let selectedLocale = $state(untrack(() => data.locale));
	let previewScheme = $state(untrack(() => data.prefs.scheme));
	let previewMode = $state(untrack(() => data.prefs.mode));

	$effect(() => {
		document.documentElement.setAttribute('data-theme', `${previewScheme}-${previewMode}`);
	});
</script>

<Container class="flex flex-col gap-6">
	<h1 class="text-2xl font-semibold text-gray-900">{m.settings_title()}</h1>

	{#if saved}
		<div class="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
			{m.settings_saved()}
		</div>
	{/if}

	<!-- Theme & locale -->
	<form
		method="post"
		action="?/theme"
		use:enhance={forceReload}
		class="flex flex-col gap-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200"
	>
		<ButtonRadioSet label={m.settings_lang_label()} name="locale" options={langLabels} bind:group={selectedLocale} />
		<ButtonRadioSet label={m.settings_scheme_label()} name="scheme" options={schemeLabels} bind:group={previewScheme} />
		<ButtonRadioSet label={m.settings_mode_label()} name="mode" options={modeLabels} bind:group={previewMode} />

		<Palette />

		<div class="flex justify-end">
			<Button label={m.settings_save()} type="submit" />
		</div>
	</form>

	<!-- Avatar -->
	<form
		method="post"
		action="?/avatar"
		use:enhance={forceReload}
		class="flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-gray-200"
	>
		<AvatarUpload
			name="image"
			value={data.user.image}
			type="user"
			label={m.settings_avatar_label()}
			size={80}
		/>
		<div class="flex justify-between">
			<Button label={m.nav_signout()} onclick={signOut} kind="danger" />
			<Button label={m.settings_save()} type="submit" />
		</div>
	</form>
</Container>
