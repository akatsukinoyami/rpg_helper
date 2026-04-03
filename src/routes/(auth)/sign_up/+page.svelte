<script lang="ts">
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/Button.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import OAuthButtons from '$lib/partials/OAuthButtons.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	function errorMessage(code: string) {
		if (code === 'USER_ALREADY_EXISTS' || code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL')
			return m.auth_error_email_taken();
		if (code === 'PASSWORD_TOO_SHORT') return m.auth_error_password_too_short();
		if (code === 'PASSWORD_TOO_LONG') return m.auth_error_password_too_long();
		return m.auth_error_generic();
	}

	async function submit() {
		if (password.length < 8) {
			error = 'PASSWORD_TOO_SHORT';
			return;
		}
		loading = true;
		error = null;
		try {
			const result = await authClient.signUp.email({ name, email, password });
			if (result.error) {
				error = result.error.code ?? 'GENERIC';
			} else {
				goto('/games');
			}
		} catch (e) {
			console.error('sign-up error', e);
			error = 'GENERIC';
		} finally {
			loading = false;
		}
	}
</script>

<h1 class="mb-6 text-2xl font-semibold">{m.auth_register_title()}</h1>

{#if error}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
		{errorMessage(error)}
	</p>
{/if}

<form onsubmit={(e) => { e.preventDefault(); submit() }} class="flex flex-col gap-4">
	<InputText id="name" label={m.auth_field_name()} bind:value={name} required autocomplete="name" />
	<InputText id="email" label={m.auth_field_email()} type="email" bind:value={email} required autocomplete="email" />
	<InputText id="password" label={m.auth_field_password()} type="password" bind:value={password} required autocomplete="new-password" minlength={8} />

	<Button class="mt-2 w-full px-4 py-2" type="submit" label={m.auth_register_submit()} disabled={loading} />
</form>

<OAuthButtons providers={data.oauthProviders} />

<p class="mt-6 text-center text-sm text-gray-500">
	{m.auth_register_have_account()}
	<a href={localizeHref('/sign_in')} class="font-medium text-indigo-600 hover:text-indigo-500">
		{m.auth_register_login_link()}
	</a>
</p>
