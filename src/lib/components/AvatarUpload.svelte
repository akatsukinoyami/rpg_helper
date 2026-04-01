<script lang="ts">
	import { mdiCamera, mdiAccount } from '@mdi/js';
	import { untrack } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import Icon from './Icon.svelte';
	import Label from './Label.svelte';

	interface Props {
		name: string;
		value?: string | null;
		type: 'user' | 'game' | 'character';
		label?: string;
		size?: number;
	}

	let { name, value: initialValue = null, type, label, size = 80 }: Props = $props();

	let currentValue = $state(untrack(() => initialValue));
	let fileInput: HTMLInputElement;
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);

	async function handleFileChange(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;

		uploading = true;
		uploadError = null;

		try {
			const fd = new FormData();
			fd.set('file', file);
			fd.set('type', type);

			const res = await fetch('/api/upload', { method: 'POST', body: fd });
			if (!res.ok) {
				const text = await res.text();
				uploadError = text || m.avatar_error_upload();
				return;
			}

			const data = (await res.json()) as { url: string };
			currentValue = data.url;
		} catch {
			uploadError = 'Upload failed';
		} finally {
			uploading = false;
			if (fileInput) fileInput.value = '';
		}
	}
</script>

<div class="flex flex-col gap-1">
	<Label {label} />

	<div class="flex items-center gap-3">
		<button
			type="button"
			onclick={() => fileInput.click()}
			disabled={uploading}
			class="group relative overflow-hidden rounded-full bg-gray-200 transition-opacity hover:opacity-80 disabled:cursor-not-allowed"
			style="width: {size}px; height: {size}px; min-width: {size}px; min-height: {size}px;"
		>
			{#if currentValue}
				<img src={currentValue} alt="" class="h-full w-full object-cover" />
			{:else}
				<div class="flex h-full w-full items-center justify-center">
					<Icon path={mdiAccount} size={Math.round(size * 0.6)} pathClass="fill-gray-400" />
				</div>
			{/if}

			<div
				class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
			>
				{#if uploading}
					<div
						class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
					></div>
				{:else}
					<Icon path={mdiCamera} size={20} pathClass="fill-white" />
				{/if}
			</div>
		</button>

		{#if currentValue}
			<button
				type="button"
				onclick={() => (currentValue = null)}
				class="text-xs text-red-500 hover:text-red-700"
			>
				{m.avatar_remove()}
			</button>
		{/if}
	</div>

	{#if uploadError}
		<p class="mt-1 text-xs text-red-600">{uploadError}</p>
	{/if}

	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={handleFileChange}
	/>
	<input type="hidden" {name} value={currentValue ?? ''} />
</div>
