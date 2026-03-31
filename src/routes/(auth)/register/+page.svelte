<script lang="ts">
	import { enhance } from '$app/forms'
	import * as m from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'
	import type { ActionData } from './$types'

	let { form }: { form: ActionData } = $props()

	const errorMessage = (error: string | undefined) => {
		if (error === 'email_taken') return m.auth_error_email_taken()
		if (error) return m.auth_error_generic()
		return null
	}
</script>

<h1 class="mb-6 text-2xl font-semibold text-gray-900">{m.auth_register_title()}</h1>

{#if form?.error}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
		{errorMessage(form.error)}
	</p>
{/if}

<form method="post" use:enhance class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium text-gray-700" for="name">{m.auth_field_name()}</label>
		<input
			id="name"
			name="name"
			type="text"
			required
			autocomplete="name"
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
		/>
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium text-gray-700" for="email">{m.auth_field_email()}</label>
		<input
			id="email"
			name="email"
			type="email"
			required
			autocomplete="email"
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
		/>
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-sm font-medium text-gray-700" for="password">{m.auth_field_password()}</label>
		<input
			id="password"
			name="password"
			type="password"
			required
			autocomplete="new-password"
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
		/>
	</div>

	<button
		type="submit"
		class="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
