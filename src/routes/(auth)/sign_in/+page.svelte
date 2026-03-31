<script lang="ts">
	import { goto } from '$app/navigation'
	import { authClient } from '$lib/auth-client'
	import * as m from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'

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

<h1 class="mb-6 text-2xl font-semibold text-gray-900">{m.auth_login_title()}</h1>

{#if error}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
		{m.auth_error_invalid_credentials()}
	</p>
{/if}

<form onsubmit={(e) => { e.preventDefault(); submit() }} class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium text-gray-700" for="login">{m.auth_field_login()}</label>
		<input
			id="login"
			type="text"
			bind:value={login}
			required
			autocomplete="email"
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
		/>
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium text-gray-700" for="password">{m.auth_field_password()}</label>
		<input
			id="password"
			type="password"
			bind:value={password}
			required
			autocomplete="current-password"
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
		/>
	</div>

	<button
		type="submit"
		disabled={loading}
		class="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
	>
		{m.auth_login_submit()}
	</button>
</form>

<p class="mt-6 text-center text-sm text-gray-500">
	{m.auth_login_no_account()}
	<a href={localizeHref('/sign_up')} class="font-medium text-indigo-600 hover:text-indigo-500">
		{m.auth_login_register_link()}
	</a>
</p>
