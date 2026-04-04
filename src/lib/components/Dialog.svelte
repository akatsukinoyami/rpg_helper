<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	interface Props {
		open: boolean;
		message?: string;
		confirmLabel?: string;
		onconfirm: () => void;
		oncancel?: () => void;
	}

	let {
		open = $bindable(),
		message = 'Are you sure?',
		confirmLabel = 'Confirm',
		onconfirm,
		oncancel
	}: Props = $props();

	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (open) {
			dialog?.showModal();
		} else {
			dialog?.close();
		}
	});

	function cancel() {
		open = false;
		oncancel?.();
	}

	function confirm() {
		open = false;
		onconfirm();
	}
</script>

<dialog
	bind:this={dialog}
	onclose={() => (open = false)}
	class="backdrop:bg-black/40 backdrop:backdrop-blur-xs rounded-xl bg-white p-4 shadow-xl w-xl ring-1 ring-gray-200 m-auto"
>
	<p class="text-sm text-gray-700 mb-4">{message}</p>
	<div class="flex justify-end gap-2">
		<Button kind="secondary" label="Cancel" onclick={cancel} />
		<Button kind="danger" label={confirmLabel} onclick={confirm} />
	</div>
</dialog>
