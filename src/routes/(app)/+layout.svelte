<script lang="ts">
	import { goto } from '$app/navigation'
	import { authClient } from '$lib/auth-client'
	import * as m from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'
	import type { LayoutData } from './$types'

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props()

	async function signOut() {
		await authClient.signOut()
		goto('/sign_in')
	}
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="border-b border-gray-200 bg-white">
		<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
			<div class="flex items-center gap-6">
				<a href={localizeHref('/games')} class="text-base font-semibold text-gray-900">
					RPG Helper
				</a>
				<a href={localizeHref('/games')} class="text-sm text-gray-500 hover:text-gray-900">
					{m.nav_games()}
				</a>
			</div>

			<div class="flex items-center gap-4">
				<span class="text-sm text-gray-600">{data.user.name}</span>
				<a href={localizeHref('/settings')} class="text-sm text-gray-500 hover:text-gray-900">
					{m.nav_settings()}
				</a>
				<button onclick={signOut} class="text-sm text-gray-500 hover:text-gray-900">
					{m.nav_signout()}
				</button>
			</div>
		</div>
	</nav>

	<main class="mx-auto max-w-5xl px-4 py-8">
		{@render children()}
	</main>
</div>
