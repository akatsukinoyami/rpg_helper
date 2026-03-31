<script lang="ts">
	import { untrack } from 'svelte'
	import { enhance } from '$app/forms'
	import { page } from '$app/state'
	import * as m from '$lib/paraglide/messages'
	import { getLocale } from '$lib/paraglide/runtime'
	import { SCHEMES, MODES } from '$lib/theme'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	const schemeLabels: Record<string, () => string> = {
		github: m.settings_scheme_github,
		catppuccin: m.settings_scheme_catppuccin,
		gruvbox: m.settings_scheme_gruvbox
	}

	const modeLabels: Record<string, () => string> = {
		light: m.settings_mode_light,
		dark: m.settings_mode_dark,
		system: m.settings_mode_system
	}

	const langLabels: Record<string, string> = {
		en: 'English',
		ru: 'Русский',
		ua: 'Українська'
	}

	const saved = $derived(page.url.searchParams.get('saved') === '1')

	let selectedLocale = $state(getLocale())
	let previewScheme = $state(untrack(() => data.prefs.scheme))
	let previewMode = $state(untrack(() => data.prefs.mode))

	// Live preview — update data-theme immediately as user picks
	$effect(() => {
		document.documentElement.setAttribute('data-theme', `${previewScheme}-${previewMode}`)
	})
</script>

<div class="max-w-lg">
	<h1 class="mb-6 text-2xl font-semibold text-gray-900">{m.settings_title()}</h1>

	{#if saved}
		<div class="mb-6 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
			{m.settings_saved()}
		</div>
	{/if}

	<form
		method="post"
		use:enhance={() => {
			// Force a full navigation so the server re-reads both cookies
			// (PARAGLIDE_LOCALE and rph_theme) and re-runs handleParaglide + handleTheme.
			return async ({ result }) => {
				if (result.type === 'redirect') {
					window.location.href = result.location
				}
			}
		}}
		class="flex flex-col gap-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200"
	>
		<!-- Language -->
		<div class="flex flex-col gap-2">
			<p class="text-sm font-medium text-gray-700">{m.settings_lang_label()}</p>
			<div class="flex flex-wrap gap-2">
				{#each ['en', 'ru', 'ua'] as lang}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors
						{selectedLocale === lang
							? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-700'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<input
							type="radio"
							name="locale"
							value={lang}
							bind:group={selectedLocale}
							class="sr-only"
						/>
						{langLabels[lang]}
					</label>
				{/each}
			</div>
		</div>

		<!-- Color scheme -->
		<div class="flex flex-col gap-2">
			<p class="text-sm font-medium text-gray-700">{m.settings_scheme_label()}</p>
			<div class="flex flex-wrap gap-2">
				{#each SCHEMES as scheme}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors
						{previewScheme === scheme
							? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-700'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<input
							type="radio"
							name="scheme"
							value={scheme}
							bind:group={previewScheme}
							class="sr-only"
						/>
						{schemeLabels[scheme]()}
					</label>
				{/each}
			</div>
		</div>

		<!-- Mode -->
		<div class="flex flex-col gap-2">
			<p class="text-sm font-medium text-gray-700">{m.settings_mode_label()}</p>
			<div class="flex flex-wrap gap-2">
				{#each MODES as mode}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors
						{previewMode === mode
							? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-700'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<input
							type="radio"
							name="mode"
							value={mode}
							bind:group={previewMode}
							class="sr-only"
						/>
						{modeLabels[mode]()}
					</label>
				{/each}
			</div>
		</div>

		<!-- Theme preview swatches -->
		<div class="flex gap-3 rounded-xl bg-gray-50 p-4">
			<div class="h-8 w-8 rounded-full bg-indigo-600 ring-1 ring-gray-200"></div>
			<div class="h-8 w-8 rounded-full bg-green-600 ring-1 ring-gray-200"></div>
			<div class="h-8 w-8 rounded-full bg-red-600 ring-1 ring-gray-200"></div>
			<div class="h-8 w-8 rounded-full bg-yellow-600 ring-1 ring-gray-200"></div>
			<div class="h-8 w-8 rounded-full bg-gray-900 ring-1 ring-gray-200"></div>
			<div class="h-8 w-8 rounded-full bg-gray-200 ring-1 ring-gray-200"></div>
		</div>

		<div class="flex justify-end">
			<button
				type="submit"
				class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
			>
				{m.settings_save()}
			</button>
		</div>
	</form>
</div>
