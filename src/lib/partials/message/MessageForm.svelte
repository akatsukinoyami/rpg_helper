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
		mdiImage,
		mdiDiceMultiple,
		mdiTune,
		mdiBriefcase,
		mdiFlash
	} from '@mdi/js';
	import Button from '$lib/components/Button.svelte';
	import ButtonSmall from '$lib/components/ButtonSmall.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';
	import * as m from '$lib/paraglide/messages';
	import MessagePanel from '$lib/partials/message/MessagePanel.svelte';
	import * as messages from '$lib/remote/messages.remote';
	import type { StatDef } from '$lib/server/db/schema';

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

	function togglePanel(panel: ActionPanel) {
		activeAction = activeAction === panel ? null : panel;
	}

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

	const tools: { icon: string; title: string; onclick: () => void }[] = [
		{ icon: mdiFormatBold, title: 'Bold', onclick: () => insertMarkdown('**') },
		{ icon: mdiFormatItalic, title: 'Italic', onclick: () => insertMarkdown('*') },
		{ icon: mdiFormatUnderline, title: 'Underline', onclick: () => insertMarkdown('++') },
		{ icon: mdiFormatStrikethrough, title: 'Strikethrough', onclick: () => insertMarkdown('~~') },
		{ icon: mdiEyeOff, title: 'Hidden text', onclick: () => insertMarkdown('||') },
		{ icon: mdiFormatQuoteClose, title: 'Quote', onclick: () => insertLinePrefix('> ') },
		{ icon: mdiCodeBraces, title: 'Inline code', onclick: () => insertMarkdown('`') },
		{ icon: mdiConsole, title: 'Code block', onclick: insertCodeBlock },
		{ icon: mdiLink, title: 'Link', onclick: () => insertMarkdown('[', '](url)') },
		{ icon: mdiImage, title: 'Image', onclick: () => insertMarkdown('![', '](url)') }
	];

	const panelButton = [
		{ id: 'dice', icon: mdiDiceMultiple, title: 'Roll dice' },
		{ id: 'stat', icon: mdiTune, title: 'Propose stat change' },
		{ id: 'item', icon: mdiBriefcase, title: 'Propose item change' },
		{ id: 'skill', icon: mdiFlash, title: 'Propose skill change' }
	] as const;
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

	<div class="flex gap-0.5 flex-wrap items-center">
		{#each tools as { title, icon, onclick }}
			<ButtonSmall {title} {icon} {onclick} {disabled} />
		{/each}
		{#if !isEditing && !disabled}
			<span class="flex-1"></span>
			{#each (panelButton) as { id, icon, title }}
				<ButtonSmall 
					class={activeAction === id ? 'bg-gray-200 text-gray-900' : ''} 
					onclick={() => togglePanel(id)} 
					{title} 
					{icon} 
					{disabled} 
				/>
			{/each}
			<span class={[
				'text-[11px] tabular-nums', 
				remaining < 100 
					? (overLimit ? 'text-red-500 font-semibold' : 'text-amber-500') 
					: 'text-gray-400'
			]}>
				{remaining}
			</span>
		{/if}
	</div>

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

	{#if !isEditing && !disabled}
		<!-- Action panels -->
		<MessagePanel {activeAction} {locationId} {statDefs} />

		<div class="flex items-center justify-end gap-2">
			{#if isEditing}
				<Button type="button" kind="secondary" icon={mdiClose} onclick={handleCancel} />
			{/if}
		</div>
	{/if}
</form>
