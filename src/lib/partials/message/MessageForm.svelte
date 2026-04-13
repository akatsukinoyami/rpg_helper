<script lang="ts">
	import { untrack } from 'svelte';
	import { mdiSend, mdiClose, mdiReply } from '@mdi/js';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';
	import * as m from '$lib/paraglide/messages';
	import MessageMarkdownToolbar from '$lib/partials/message/MessageMarkdownToolbar.svelte';
	import * as messages from '$lib/remote/messages.remote';
	import type { StatDef } from '$lib/server/db/schema';

	const MAX_LENGTH = 4096 as const;

	export interface ReplyTarget {
		id: string;
		characterName: string | null;
		content: string;
	}

	interface Props {
		locationId: string;
		myCharacterId?: string | null;
		messageId?: string;
		initialContent?: string;
		replyTo?: ReplyTarget | null;
		statDefs?: StatDef[];
		onCancelReply?: () => void;
		onDone?: () => void;
	}

	let {
		locationId,
		myCharacterId = null,
		messageId,
		initialContent = '',
		replyTo = null,
		statDefs,
		onCancelReply,
		onDone
	}: Props = $props();

	let content = $state(untrack(() => initialContent));
	let textarea = $state<HTMLTextAreaElement>();
	let submitting = $state(false);
	let htmlWarning = $state(false);

	const isEditing = $derived(!!messageId);
	const disabled = $derived(!isEditing && !myCharacterId);
	const remaining = $derived(MAX_LENGTH - content.length);
	const overLimit = $derived(remaining < 0);

	// ── Action panels ──────────────────────────────────────────────────────────

	type ActionPanel = 'dice' | 'stat' | 'item' | 'skill';
	let activeAction = $state<ActionPanel | null>(null);

	// ── Formatting ─────────────────────────────────────────────────────────────

	function stripHtml(s: string) {
		const stripped = s.replace(/<[^>]*>/g, '');
		if (stripped !== s) htmlWarning = true;
		return stripped;
	}

	function handleInput() {
		const stripped = stripHtml(content);
		if (stripped !== content) content = stripped;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const trimmed = content.trim();
		if (!trimmed || overLimit || submitting) return;

		submitting = true;
		try {
			if (isEditing) {
				await messages.edit({ messageId: messageId!, content: trimmed });
			} else {
				await messages.send({ locationId, content: trimmed, replyToId: replyTo?.id });
			}
			content = '';
			htmlWarning = false;
			onCancelReply?.();
			onDone?.();
		} finally {
			submitting = false;
		}
	}


</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-1">
	{#if replyTo}
		<div class="flex items-center gap-1 rounded bg-gray-100 border-l-2 border-indigo-400 px-1.5 py-1">
			<Icon path={mdiReply} size={12} pathClass="fill-indigo-400 shrink-0" />
			<span class="text-[11px] font-semibold text-indigo-600 shrink-0">{replyTo.characterName ?? m.message_gm()}:</span>
			<span class="text-[11px] text-gray-500 truncate flex-1">{replyTo.content}</span>
			<button
				type="button"
				class="shrink-0 text-gray-400 hover:text-gray-700 cursor-pointer"
				onclick={onCancelReply}
			>
				<Icon path={mdiClose} size={12} pathClass="fill-current" />
			</button>
		</div>
	{/if}

	<MessageMarkdownToolbar
		{disabled}
		{isEditing}
		bind:content
		bind:activeAction
		{textarea}
		{locationId}
		{statDefs}
	/>

	<div class="flex gap-2">
		<textarea
			bind:this={textarea}
			bind:value={content}
			oninput={handleInput}
			{disabled}
			placeholder={disabled ? m.message_no_char() : m.message_placeholder()}
			rows={3}
			class={[fieldColors, fieldSpacing, 'rounded-md border text-xs outline-none resize-y w-full', overLimit && 'border-red-400']}
		></textarea>

		<Button
			type="submit"
			icon={mdiSend}
			class="items-center p-2"
			disabled={disabled || !content.trim() || overLimit || submitting}
		/>
	</div>

	{#if htmlWarning}
		<p class="text-[11px] text-amber-600">{m.message_html_forbidden()}</p>
	{/if}

</form>
