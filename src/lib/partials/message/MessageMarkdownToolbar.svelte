<script lang="ts">
	import { tick } from 'svelte';
	import {
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
	import ButtonSmall from '$lib/components/ButtonSmall.svelte';
	import MessagePanel from '$lib/partials/message/MessagePanel.svelte';
	import type { StatDef } from '$lib/server/db/schema';

	const MAX_LENGTH = 4096;

	type ActionPanel = 'dice' | 'stat' | 'item' | 'skill';

	let {
		disabled,
		isEditing,
		content = $bindable(''),
		textarea,
		activeAction = $bindable<ActionPanel | null>(null),
		locationId,
		statDefs
	}: {
		disabled: boolean;
		isEditing: boolean;
		content?: string;
		textarea: HTMLTextAreaElement | undefined;
		activeAction?: ActionPanel | null;
		locationId: string;
		statDefs?: StatDef[];
	} = $props();

	const remaining = $derived(MAX_LENGTH - content.length);
	const overLimit = $derived(remaining < 0);

	function togglePanel(panel: ActionPanel) {
		activeAction = activeAction === panel ? null : panel;
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

	const panelButtons = [
		{ id: 'dice', icon: mdiDiceMultiple, title: 'Roll dice' },
		{ id: 'stat', icon: mdiTune, title: 'Propose stat change' },
		{ id: 'item', icon: mdiBriefcase, title: 'Propose item change' },
		{ id: 'skill', icon: mdiFlash, title: 'Propose skill change' }
	] as const;
</script>

<div class="flex gap-0.5 flex-wrap items-center">
	{#each tools as { title, icon, onclick }}
		<ButtonSmall {title} {icon} {onclick} {disabled} />
	{/each}
	{#if !isEditing && !disabled}
		<span class="flex-1"></span>
		{#each panelButtons as { id, icon, title }}
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

{#if !isEditing && !disabled}
	<MessagePanel {activeAction} {locationId} {statDefs} />
{/if}
