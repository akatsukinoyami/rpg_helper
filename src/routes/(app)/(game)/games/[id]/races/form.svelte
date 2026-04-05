<script lang="ts">
	import * as remoteFunctions from '$lib/remote/races.remote';
	import * as m from '$lib/paraglide/messages';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import InputTextArea from '$lib/components/InputTextArea.svelte';
	import TypeForm from '$lib/partials/TypeForm.svelte';

	interface Props {
		action: 'create' | 'edit';
		open: boolean;
		entity?: Record<string, any>;
	}

	let { action, entity, open = $bindable() }: Props = $props();

	const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
</script>

<TypeForm
	{action}
	{remoteFunctions}
	{entity}
	bind:open
	titles={{ create: m.race_create(), edit: m.race_edit_title() }}
>
	<AvatarUpload
		name="image"
		type="race"
		value={entity?.image}
		label={m.race_field_image()}
	/>

	<InputText
		id="race-name"
		name="name"
		label={m.race_field_name()}
		value={entity?.name}
		required
	/>

	<InputTextArea
		id="race-desc"
		name="description"
		label={m.race_field_desc()}
		value={entity?.description}
		rows={2}
	/>

	<p class="text-xs font-medium text-gray-600">{m.race_field_stats()}</p>
	<div class="grid grid-cols-6 gap-2">
		{#each stats as stat}
			<InputText
				id="race-{stat}"
				name={stat}
				label={stat.toUpperCase()}
				type="number"
				value={entity?.baseStats?.[stat]?.toString() ?? '10'}
			/>
		{/each}
	</div>
</TypeForm>
