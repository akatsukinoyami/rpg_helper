<script lang="ts">
	import { enhance } from '$app/forms'
	import * as m from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'
	import type { ActionData } from './$types'

	let { form }: { form: ActionData } = $props()
</script>

<h1 class="mb-6 text-2xl font-semibold text-gray-900">{m.auth_login_title()}</h1>

{#if form?.error}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
		{m.auth_error_invalid_credentials()}
	</p>
{/if}

<form method="post" use:enhance class="flex flex-col gap-4">
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
			autocomplete="current-password"
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
		/>
	</div>

	<button
		type="submit"
		class="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
	>
		{m.auth_login_submit()}
	</button>
</form>

<p class="mt-6 text-center text-sm text-gray-500">
	{m.auth_login_no_account()}
	<a href={localizeHref('/register')} class="font-medium text-indigo-600 hover:text-indigo-500">
		{m.auth_login_register_link()}
	</a>
</p>
