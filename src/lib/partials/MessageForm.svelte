<script lang="ts">
	import { tick, untrack } from 'svelte';
	import {
		mdiSend,
		mdiClose,
		mdiReply,
		mdiFormatBold,
		mdiFormatItalic,
		mdiFormatUnderline,
		mdiFormatStrikethrough,
		mdiEyeOff,
		mdiFormatQuoteClose,
		mdiCodeBraces,
		mdiConsole,
		mdiLink,
		mdiImage
	} from '@mdi/js';
	import * as messages from '$lib/remote/messages.remote';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';

	const MAX_LENGTH = 4096;

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
		onCancelReply?: () => void;
		onDone?: () => void;
	}

	let {
		locationId,
		myCharacterId = null,
		messageId,
		initialContent = '',
		replyTo = null,
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

	function handleCancel() {
		content = initialContent;
		htmlWarning = false;
		onDone?.();
	}

	async function insertMarkdown(prefix: string, suffix = prefix) {
		if (!textarea) return;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = content.slice(start, end);
		const newContent = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
		if (newContent.length > MAX_LENGTH) return;
		content = newContent;
		await tick();
		textarea.focus();
		if (selected) {
			textarea.setSelectionRange(start + prefix.length, end + prefix.length);
		} else {
			const cursor = start + prefix.length;
			textarea.setSelectionRange(cursor, cursor);
		}
	}

	async function insertCodeBlock() {
		if (!textarea) return;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = content.slice(start, end);
		const inner = selected && !selected.endsWith('\n') ? selected + '\n' : selected;
		const block = '```\n' + inner + '```';
		const newContent = content.slice(0, start) + block + content.slice(end);
		if (newContent.length > MAX_LENGTH) return;
		content = newContent;
		await tick();
		textarea.focus();
		textarea.setSelectionRange(start + 4, start + 4 + selected.length);
	}

	async function insertLinePrefix(prefix: string) {
		if (!textarea) return;
		const start = textarea.selectionStart;
		const lineStart = content.lastIndexOf('\n', start - 1) + 1;
		const newContent = content.slice(0, lineStart) + prefix + content.slice(lineStart);
		if (newContent.length > MAX_LENGTH) return;
		content = newContent;
		await tick();
		textarea.focus();
		textarea.setSelectionRange(start + prefix.length, start + prefix.length);
	}

	const tools: { icon: string; title: string; action: () => void }[] = [
		{ icon: mdiFormatBold, title: 'Bold', action: () => insertMarkdown('**') },
		{ icon: mdiFormatItalic, title: 'Italic', action: () => insertMarkdown('*') },
		{ icon: mdiFormatUnderline, title: 'Underline', action: () => insertMarkdown('++') },
		{ icon: mdiFormatStrikethrough, title: 'Strikethrough', action: () => insertMarkdown('~~') },
		{ icon: mdiEyeOff, title: 'Hidden text', action: () => insertMarkdown('||') },
		{ icon: mdiFormatQuoteClose, title: 'Quote', action: () => insertLinePrefix('> ') },
		{ icon: mdiCodeBraces, title: 'Inline code', action: () => insertMarkdown('`') },
		{ icon: mdiConsole, title: 'Code block', action: insertCodeBlock },
		{ icon: mdiLink, title: 'Link', action: () => insertMarkdown('[', '](url)') },
		{ icon: mdiImage, title: 'Image', action: () => insertMarkdown('![', '](url)') }
	];
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

	<div class="flex gap-0.5 flex-wrap">
		{#each tools as tool}
			<button
				type="button"
				title={tool.title}
				class="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 cursor-pointer disabled:cursor-default"
				onclick={tool.action}
				{disabled}
			>
				<Icon path={tool.icon} size={14} pathClass="fill-current" />
			</button>
		{/each}
	</div>

	<textarea
		bind:this={textarea}
		bind:value={content}
		oninput={handleInput}
		{disabled}
		placeholder={disabled ? m.message_no_char() : m.message_placeholder()}
		rows={3}
		class={[fieldColors, fieldSpacing, 'rounded-md border text-xs outline-none resize-y w-full', overLimit && 'border-red-400']}
	></textarea>

	{#if htmlWarning}
		<p class="text-[11px] text-amber-600">{m.message_html_forbidden()}</p>
	{/if}

	<div class="flex items-center justify-end gap-2">
		<span class={['text-[11px] tabular-nums', remaining < 100 ? (overLimit ? 'text-red-500 font-semibold' : 'text-amber-500') : 'text-gray-400']}>
			{remaining}
		</span>
		{#if isEditing}
			<Button type="button" kind="secondary" icon={mdiClose} onclick={handleCancel} />
		{/if}
		<Button
			type="submit"
			icon={mdiSend}
			kind="primary"
			disabled={disabled || !content.trim() || overLimit || submitting}
		/>
	</div>
</form>
