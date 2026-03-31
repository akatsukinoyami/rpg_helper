<script lang="ts">
	import { goto } from '$app/navigation'
	import { authClient } from '$lib/auth-client'
	import * as m from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'
	import Button from '$lib/components/Button.svelte'
	import InputText from '$lib/components/InputText.svelte'

	let login = $state('')
	let password = $state('')
	let error = $state(false)
	let loading = $state(false)

	async function resolveEmail(nameOrEmail: string): Promise<string | null> {
		if (nameOrEmail.includes('@')) return nameOrEmail
		const res = await fetch('/api/resolve-login', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name: nameOrEmail })
		})
		const data = await res.json()
		return data.email
	}

	async function submit() {
		loading = true
		error = false
		try {
			const email = await resolveEmail(login)
			if (!email) {
				error = true
				return
			}
			const result = await authClient.signIn.email({ email, password })
			if (result.error) {
				error = true
			} else {
				goto('/games')
			}
		} catch (e) {
			console.error('sign-in error', e)
			error = true
		} finally {
			loading = false
		}
	}
</script>

<h1 class="mb-6 text-2xl font-semibold">{m.auth_login_title()}</h1>

{#if error}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
		{m.auth_error_invalid_credentials()}
	</p>
{/if}

<form onsubmit={(e) => { e.preventDefault(); submit() }} class="flex flex-col gap-4">
	<InputText id="login" label={m.auth_field_login()} bind:value={login} required autocomplete="email" />
	<InputText id="password" label={m.auth_field_password()} type="password" bind:value={password} required autocomplete="current-password" />

	<Button class="mt-2 w-full px-4 py-2" type="submit" label={m.auth_login_submit()} disabled={loading} />
</form>

<p class="mt-6 text-center text-sm text-gray-500">
	{m.auth_login_no_account()}
	<a href={localizeHref('/sign_up')} class="font-medium text-indigo-600 hover:text-indigo-500">
		{m.auth_login_register_link()}
	</a>
</p>
