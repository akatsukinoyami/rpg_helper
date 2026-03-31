<script lang="ts">
	import { goto } from '$app/navigation'
	import * as m from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'
	import { authClient } from '$lib/auth-client'

	let name = $state('')
	let email = $state('')
	let password = $state('')
	let error = $state<string | null>(null)
	let loading = $state(false)

	const errorMessage = (code: string) => {
		if (code === 'USER_ALREADY_EXISTS') return m.auth_error_email_taken()
		return m.auth_error_generic()
	}

	async function submit() {
		loading = true
		error = null
		try {
			const result = await authClient.signUp.email({ name, email, password })
			if (result.error) {
				error = result.error.code ?? 'generic'
			} else {
				goto('/games')
			}
		} catch (e) {
			console.error('sign-up error', e)
			error = 'generic'
		} finally {
			loading = false
		}
	}
</script>

<h1 class="mb-6 text-2xl font-semibold text-gray-900">{m.auth_register_title()}</h1>

{#if error}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
		{errorMessage(error)}
	</p>
{/if}

<form onsubmit={(e) => { e.preventDefault(); submit() }} class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium text-gray-700" for="name">{m.auth_field_name()}</label>
		<input
			id="name"
			type="text"
			bind:value={name}
			required
			autocomplete="name"
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
		/>
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium text-gray-700" for="email">{m.auth_field_email()}</label>
		<input
			id="email"
			type="email"
			bind:value={email}
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
			autocomplete="new-password"
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
		/>
	</div>

	<button
		type="submit"
		disabled={loading}
		class="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
	>
		{m.auth_register_submit()}
	</button>
</form>

<p class="mt-6 text-center text-sm text-gray-500">
	{m.auth_register_have_account()}
	<a href={localizeHref('/login')} class="font-medium text-indigo-600 hover:text-indigo-500">
		{m.auth_register_login_link()}
	</a>
</p>
