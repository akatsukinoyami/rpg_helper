<script lang="ts">
	import { mdiCheck, mdiClose } from '@mdi/js';
	import Icon from '$lib/components/Icon.svelte';
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';
	import * as messages from '$lib/remote/messages.remote';
	import * as m from '$lib/paraglide/messages';

	let { messageId, value = $bindable(''), onClose }: {
		messageId: string;
		value?: string;
		onClose: () => void;
	} = $props();

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		await messages.annotate({ messageId, annotation: value });
		onClose();
	}
</script>

<form onsubmit={handleSubmit} class="flex items-center gap-1 mt-1">
	<input
		class={[fieldColors, fieldSpacing, 'rounded-md border text-xs outline-none flex-1']}
		bind:value
		placeholder={m.message_gm_comment_placeholder()}
	/>
	<button type="submit" class="p-1 rounded text-gray-400 hover:text-indigo-600 cursor-pointer">
		<Icon path={mdiCheck} size={13} pathClass="fill-current" />
	</button>
	<button type="button" class="p-1 rounded text-gray-400 hover:text-gray-700 cursor-pointer" onclick={onClose}>
		<Icon path={mdiClose} size={13} pathClass="fill-current" />
	</button>
</form>
