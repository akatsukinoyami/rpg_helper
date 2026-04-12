<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import yaml from 'js-yaml';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import Button from '$lib/components/Button.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import InputTextArea from '$lib/components/InputTextArea.svelte';
	import Label from '$lib/components/Label.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { StatDef } from '$lib/server/db/schema';
	import StatDefDraftList, { type Draft } from '$lib/partials/game/StatDefDraftList.svelte';
	import StatDefLiveList from '$lib/partials/game/StatDefLiveList.svelte';

	interface Props {
		remoteForm: Record<string, unknown>;
		submitLabel: string;
		label?: string;
		name?: string;
		description?: string | null;
		image?: string | null;
		/** 'create' shows full CRUD for stat defs (submitted with form).
		 *  'edit' shows label/color/sortOrder editing only (via immediate commands). */
		mode?: 'create' | 'edit';
		/** Current stat defs — required in edit mode, ignored in create mode. */
		statDefs?: StatDef[];
		onclickReset?: (e: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		remoteForm,
		submitLabel,
		label = '',
		name = '',
		description = '',
		image = null,
		mode = 'create',
		statDefs = [],
		onclickReset,
		children
	}: Props = $props();

	let nameValue = $state(untrack(() => name));
	let descriptionValue = $state(untrack(() => description ?? ''));

	// Create mode: draft stat defs submitted with the form
	let draftDefs = $state<Draft[]>([]);
	let draftDefsJson = $derived(JSON.stringify(draftDefs));

	// YAML import
	let yamlContent = $state('');
	let yamlFileName = $state('');

	async function handleYamlFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) { yamlContent = ''; yamlFileName = ''; return; }
		yamlContent = await file.text();
		yamlFileName = file.name;
		try {
			const parsed = yaml.load(yamlContent) as Record<string, any>;
			if (parsed?.game?.name) nameValue = parsed.game.name;
			if (parsed?.game?.description) descriptionValue = parsed.game.description;
		} catch { /* invalid YAML — server will reject it */ }
	}
</script>

<div class="rounded-2xl bg-white p-4 ring-1 ring-gray-200 flex flex-col gap-4">
	{#if label}
		<h2 class="text-lg font-medium text-gray-900">{label}</h2>
	{/if}

	<form {...remoteForm} class="flex flex-col gap-4">
		<AvatarUpload name="image" type="game" label={m.game_field_avatar()} size={64} value={image} />
		<InputText id="name" name="name" label={m.game_field_name()} value={nameValue} required />
		<InputTextArea id="description" name="description" label={m.game_field_description()} value={descriptionValue} />

		<!-- ── Stat definitions ──────────────────────────────────────────────── -->
		<div class="flex flex-col gap-2">
			<Label label="Stat Definitions" />

			{#if mode === 'create'}
				<StatDefDraftList bind:draftDefs />
				<input type="hidden" name="statDefsJson" value={draftDefsJson} />
			{:else}
				<StatDefLiveList {statDefs} />
			{/if}
		</div>

		<!-- ── YAML import ───────────────────────────────────────────────────── -->
		<div class="flex flex-col gap-1">
			<Label label={m.transfer_import()} />
			<p class="text-xs text-gray-400">{m.transfer_import_hint()}</p>
			<div class="flex items-center gap-2 mt-1">
				<label class="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
					{yamlFileName || m.transfer_import_button()}
					<input type="file" accept=".yaml,.yml" class="hidden" onchange={handleYamlFile} />
				</label>
				{#if yamlFileName}
					<button type="button" class="text-xs text-red-500 hover:text-red-700"
						onclick={() => { yamlContent = ''; yamlFileName = ''; }}>
						{m.avatar_remove()}
					</button>
				{/if}
			</div>
			<input type="hidden" name="yaml" value={yamlContent} />
		</div>

		<div class="flex justify-end gap-2">
			{#if onclickReset}
				<Button label={m.game_create_reset()} type="reset" onclick={onclickReset} kind="secondary" />
			{/if}
			<Button label={submitLabel} type="submit" />
		</div>

		{@render children?.()}
	</form>
</div>
