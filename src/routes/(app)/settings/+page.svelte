<script lang="ts">
	import { untrack, onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import appDia from '$lib/assets/appDia.svg';
	import appMax from '$lib/assets/appMax.svg';
	import {
		errorMsgs,
		langLabels,
		modeLabels,
		providerIcons,
		providerLabels,
		schemeLabels
	} from '$lib/constants/labels';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonRadioSet from '$lib/components/InputButtonRadioSet.svelte';
	import Container from '$lib/components/Container.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import Palette from '$lib/components/Palette.svelte';
	import * as m from '$lib/paraglide/messages';
	import { saveTheme, saveAccount } from '$lib/remote/settings.remote';
	import type { PageData } from './$types';
	import { keys } from '$lib/utils';
	import HR from '$lib/components/HR.svelte';

	let { data }: { data: PageData } = $props();

	const settingsPages = {
		style: m.settings_page_style,
		account: m.settings_page_account
	} as const;

	const saved = $derived(page.url.searchParams.get('saved') === '1');

	async function signOut() {
		await authClient.signOut();
		goto('/sign_in');
	}

	const isErrorMsg = (key: string | undefined): key is keyof typeof errorMsgs => {
		return key ? key in errorMsgs : false;
	}

	const errorMsg = (key: string | undefined) => {
		return isErrorMsg(key) ? errorMsgs[key] : null;
	};

	let selectedPage = $state('style');
	let selectedLocale = $state(untrack(() => data.locale));
	let previewScheme = $state(untrack(() => data.prefs.scheme));
	let previewMode = $state(untrack(() => data.prefs.mode));

	type ConnectedAccount = { providerId: keyof typeof providerLabels };
	let connectedAccounts = $state<ConnectedAccount[]>([]);

	async function fetchAccounts() {
		const result = await authClient.listAccounts();
		connectedAccounts = (result.data ?? []) as ConnectedAccount[];
	}

	onMount(fetchAccounts);

	async function unlink(providerId: string) {
		await authClient.unlinkAccount({ providerId });
		await fetchAccounts();
	}


	async function link(provider: keyof typeof providerIcons) {
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
		class={[
			"flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-200", 
			selectedPage === 'style' ? 'flex' : 'hidden'
		]}
	>
		<ButtonRadioSet 
			label={m.settings_lang_label()} 
			name="locale" 
			options={langLabels} 
			bind:group={selectedLocale} 
			labelClass="w-50" 
			inline 
		/>
		
		<ButtonRadioSet 
			label={m.settings_scheme_label()} 
			name="scheme" 
			options={schemeLabels} 
			bind:group={previewScheme} 
			labelClass="w-50" 
			inline 
		/>
		
		<ButtonRadioSet 
			label={m.settings_mode_label()} 
			name="mode" 
			options={modeLabels} 
			bind:group={previewMode} 
			labelClass="w-50" 
			inline 
		/>

		<Palette />

		<div class="flex justify-end">
			<Button label={m.settings_save()} type="submit" />
		</div>
	</form>

	<!-- Account tab -->
	<form
		{...saveAccount}
		class={[
			"flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-200",
			selectedPage === 'account' ? 'flex' : 'hidden'
		]}
	>
		<AvatarUpload name="image" value={data.user.image} type="user" label={m.settings_avatar_label()} size={40} />
		{#if saveAccount.result?.accountError}
			<p class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
				{errorMsg(saveAccount.result.accountError)}
			</p>
		{/if}

		<InputText 
			id="account-name" 
			name="name" 
			label={m.settings_new_username()} 
			placeholder={data.user.name} 
		/>

		<InputText 
			id="account-email" 
			name="email" 
			type="email" 
			label={m.settings_new_email()} 
			placeholder={data.user.email} 
		/>
		
		<HR />

		<InputText 
			id="account-new-password" 
			name="newPassword" 
			type="password" 
			label={m.settings_new_password()} 
		/>

		<InputText 
			id="account-confirm-password" 
			name="confirmPassword" 
			type="password" 
			label={m.settings_confirm_password()} 
		/>

		<HR />

		<InputText 
			id="account-current-password" 
			name="currentPassword" 
			type="password" 
			label={m.settings_current_password()} 
		/>

		<HR />

		<!-- Connected providers -->
		<div class="flex justify-between items-center">
			<h2 class="text-sm font-medium text-gray-700">{m.settings_connected_providers()}</h2>

			<div class="flex gap-2">
				{#each keys(providerIcons) as provider}
					{@const linked = connectedAccounts.some((a) => a.providerId === provider)}
					<Button
						icon={providerIcons[provider]}
						class={{ 'p-2': true, "grayscale-100": !linked }}
						kind={linked ? 'success' : 'secondary'}
						onclick={() => linked ? unlink(provider) : link(provider)}
					/>
				{/each}
				{#each [[appDia, 'Dia'], [appMax, 'Max']] as [src, alt]}
					<Button 
						class='p-2 grayscale-100'
						kind="secondary"
						onclick={() => window.location.href = 'https://youtu.be/dQw4w9WgXcQfor'}
					><img {src} {alt} width="24px"/></Button>
				{/each}
			</div>
		</div>

		<div class="flex justify-between">
			<Button label={m.nav_signout()} onclick={signOut} kind="danger" />
			<Button label={m.settings_save()} type="submit" />
		</div>
	</form>
</Container>
