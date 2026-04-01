<script lang="ts">
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import Button from '$lib/components/Button.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import InputTextArea from '$lib/components/InputTextArea.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		remoteForm: Record<string, unknown>;
		submitLabel: string;
		label?: string;
		name?: string;
		description?: string | null;
		image?: string | null;
		onclickReset?: (e: MouseEvent) => void;
	}

	let {
		remoteForm,
		submitLabel,
		label = '',
		name = '',
		description = '',
		image = null,
		onclickReset
	}: Props = $props();
</script>


<div class="rounded-2xl bg-white p-4 ring-1 ring-gray-200 flex flex-col gap-4">
	{#if label}
		<h2 class="text-lg font-medium text-gray-900">{label}</h2>
	{/if}

	<form {...remoteForm} class="flex flex-col gap-4">
		<AvatarUpload name="image" type="game" label={m.game_field_avatar()} size={64} value={image} />
		<InputText id="name" name="name" label={m.game_field_name()} value={name} required />
		<InputTextArea id="description" name="description" label={m.game_field_description()} value={description ?? ''} />

		<div class="flex justify-end gap-2">
			{#if onclickReset}
				<Button label={m.game_create_reset()} type="reset" onclick={onclickReset} kind="secondary" />
			{/if}
			<Button label={submitLabel} type="submit" />
		</div>
	</form>
</div>
