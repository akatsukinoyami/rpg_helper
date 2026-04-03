<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonRadioSet from '$lib/components/InputButtonRadioSet.svelte';
	import Container from '$lib/components/Container.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import Palette from '$lib/components/Palette.svelte';
	import * as m from '$lib/paraglide/messages';
	import { saveTheme, saveAccount } from '$lib/remote/settings.remote';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const schemeLabels = {
		github: m.settings_scheme_github,
		catppuccin: m.settings_scheme_catppuccin,
		gruvbox: m.settings_scheme_gruvbox
	} as const;

	const modeLabels = {
		light: m.settings_mode_light,
		dark: m.settings_mode_dark,
		system: m.settings_mode_system
	} as const;

	const langLabels = {
		en: 'English',
		ru: 'Русский',
		ua: 'Українська'
	} as const;

	const settingsPages = {
		style: m.settings_page_style,
		account: m.settings_page_account
	} as const;

	const saved = $derived(page.url.searchParams.get('saved') === '1');

	async function signOut() {
		await authClient.signOut();
		goto('/sign_in');
	}

	const errorMsg = (key: string | undefined) => {
		if (key === 'wrong_password') return m.settings_error_wrong_password();
		if (key === 'name_taken') return m.settings_error_name_taken();
		if (key === 'email_taken') return m.settings_error_email_taken();
		if (key === 'mismatch') return m.settings_error_password_mismatch();
		if (key === 'too_short') return m.settings_error_password_too_short();
		return null;
	};

	let selectedPage = $state('style');
	let selectedLocale = $state(untrack(() => data.locale));
	let previewScheme = $state(untrack(() => data.prefs.scheme));
	let previewMode = $state(untrack(() => data.prefs.mode));

	const connectedAccounts = authClient.useListAccounts();

	const providerLabels: Record<string, string> = {
		google: 'Google',
		discord: 'Discord',
		telegram: 'Telegram',
		credential: 'Email & password'
	};

	async function unlink(providerId: string) {
		await authClient.unlinkAccount({ providerId });
		await connectedAccounts.refetch();
	}

	async function link(provider: 'google' | 'discord' | 'telegram') {
		await authClient.linkSocial({ provider, callbackURL: window.location.href });
	}

	$effect(() => {
		document.documentElement.setAttribute('data-theme', `${previewScheme}-${previewMode}`);
	});

	// Full reload after theme save so the new cookie is picked up by SSR
	$effect(() => {
		if (saveTheme.result?.success) {
			window.location.href = `${window.location.pathname}?saved=1`;
		}
	});
</script>

<Container class="flex flex-col gap-4">
	<h1 class="text-2xl font-semibold text-gray-900">{m.settings_title()}</h1>

	{#if saved}
		<div class="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
			{m.settings_saved()}
		</div>
	{/if}

	<ButtonRadioSet options={settingsPages} bind:group={selectedPage} kind="ghost" />

	<!-- Style tab -->
	<form
		{...saveTheme}
		class={["flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-200", selectedPage === 'style' ? 'flex' : 'hidden']}
	>
		<ButtonRadioSet label={m.settings_lang_label()} name="locale" options={langLabels} bind:group={selectedLocale} labelClass="w-50" inline />
		<ButtonRadioSet label={m.settings_scheme_label()} name="scheme" options={schemeLabels} bind:group={previewScheme} labelClass="w-50" inline />
		<ButtonRadioSet label={m.settings_mode_label()} name="mode" options={modeLabels} bind:group={previewMode} labelClass="w-50" inline />

		<Palette />

		<div class="flex justify-end">
			<Button label={m.settings_save()} type="submit" />
		</div>
	</form>

	<!-- Account tab -->
	{#if selectedPage === 'account'}
		<form
			{...saveAccount}
			class="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-200"
		>
			<AvatarUpload name="image" value={data.user.image} type="user" label={m.settings_avatar_label()} size={40} />
			{#if saveAccount.result?.accountError}
				<p class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{errorMsg(saveAccount.result.accountError)}</p>
			{/if}

			<InputText id="account-name" name="name" label={m.settings_new_username()} placeholder={data.user.name} />
			<InputText id="account-email" name="email" type="email" label={m.settings_new_email()} placeholder={data.user.email} />

			<hr class="border-gray-100" />

			<InputText id="account-new-password" name="newPassword" type="password" label={m.settings_new_password()} />
			<InputText id="account-confirm-password" name="confirmPassword" type="password" label={m.settings_confirm_password()} />

			<hr class="border-gray-100" />

			<InputText id="account-current-password" name="currentPassword" type="password" label={m.settings_current_password()} />

			<div class="flex justify-between">
				<Button label={m.nav_signout()} onclick={signOut} kind="danger" />
				<Button label={m.settings_save()} type="submit" />
			</div>
		</form>

		<!-- Connected providers -->
		<div class="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-200">
			<h2 class="text-sm font-medium text-gray-700">{m.settings_connected_providers()}</h2>

			{#each connectedAccounts.data ?? [] as acc}
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-900">{providerLabels[acc.provider] ?? acc.provider}</span>
					{#if acc.provider !== 'credential'}
						<Button
							label={m.settings_unlink_provider()}
							kind="secondary"
							onclick={() => unlink(acc.provider)}
						/>
					{/if}
				</div>
			{/each}

			<hr class="border-gray-100" />

			{#each (['google', 'discord', 'telegram'] as const) as provider}
				{@const linked = connectedAccounts.data?.some((a: { provider: string }) => a.provider === provider)}
				{#if !linked}
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-500">{providerLabels[provider]}</span>
						<Button
							label={m.settings_link_provider()}
							kind="secondary"
							onclick={() => link(provider)}
						/>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</Container>
