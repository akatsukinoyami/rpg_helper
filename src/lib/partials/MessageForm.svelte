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
	import * as messages from '$lib/remote/messages.remote';
	import * as proposals from '$lib/remote/proposals.remote';
	import * as diceRemote from '$lib/remote/diceRolls.remote';
	import * as itemTypesRemote from '$lib/remote/item-types.remote';
	import * as skillTypesRemote from '$lib/remote/skill-types.remote';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import InputNumber from '$lib/components/InputNumber.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
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

	// ── Action panels ──────────────────────────────────────────────────────────

	type ActionPanel = 'dice' | 'stat' | 'item' | 'skill';
	let activeAction = $state<ActionPanel | null>(null);

	function togglePanel(panel: ActionPanel) {
		activeAction = activeAction === panel ? null : panel;
	}

	// Dice
	let diceExpr = $state('1d20');
	let diceSubmitting = $state(false);

	async function submitDice() {
		const expr = diceExpr.trim();
		if (!expr || diceSubmitting) return;
		diceSubmitting = true;
		try {
			await diceRemote.roll({ locationId, expression: expr });
			activeAction = null;
			diceExpr = '1d20';
		} finally {
			diceSubmitting = false;
		}
	}

	// Stat proposal
	const statFields = ['hp', 'mp', 'maxHp', 'maxMp', 'str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
	const statOptions: [string, string][] = [
		['hp', m.stat_hp()],
		['mp', m.stat_mp()],
		['maxHp', m.stat_maxHp()],
		['maxMp', m.stat_maxMp()],
		['str', m.stat_str()],
		['dex', m.stat_dex()],
		['con', m.stat_con()],
		['int', m.stat_int()],
		['wis', m.stat_wis()],
		['cha', m.stat_cha()],
	];
	let statField = $state<typeof statFields[number]>('hp');
	let statDelta = $state(1);
	let statReason = $state('');
	let statSubmitting = $state(false);

	async function submitStat() {
		if (statSubmitting) return;
		statSubmitting = true;
		try {
			await proposals.sendStat({ locationId, field: statField, delta: statDelta, reason: statReason || undefined });
			activeAction = null;
			statReason = '';
		} finally {
			statSubmitting = false;
		}
	}

	// Item proposal
	const itemsQuery = itemTypesRemote.index();
	let itemTypeId = $state('');
	let itemDelta = $state(1);
	let itemReason = $state('');
	let itemSubmitting = $state(false);

	const selectedItem = $derived(itemsQuery.current?.find((i) => i.id === itemTypeId));

	async function submitItem() {
		if (!itemTypeId || itemSubmitting) return;
		itemSubmitting = true;
		try {
			const isDur = selectedItem?.trackingMode === 'durability';
			await proposals.sendItem({
				locationId,
				itemTypeId,
				deltaQty: isDur ? undefined : itemDelta,
				deltaDur: isDur ? itemDelta : undefined,
				reason: itemReason || undefined
			});
			activeAction = null;
			itemReason = '';
		} finally {
			itemSubmitting = false;
		}
	}

	// Skill proposal
	const skillsQuery = skillTypesRemote.index();
	let skillTypeId = $state('');
	let skillAction = $state<'add' | 'remove'>('add');
	let skillReason = $state('');
	let skillSubmitting = $state(false);

	async function submitSkill() {
		if (!skillTypeId || skillSubmitting) return;
		skillSubmitting = true;
		try {
			await proposals.sendSkill({ locationId, skillTypeId, action: skillAction, reason: skillReason || undefined });
			activeAction = null;
			skillReason = '';
		} finally {
			skillSubmitting = false;
		}
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

	const submitByType = {
		dice: submitDice,
		stat: submitStat,
		item: submitItem,
		skill: submitSkill,
	};
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
		{#if !isEditing && !disabled}
			<span class="flex-1"></span>
			{#each ([['dice', mdiDiceMultiple, 'Roll dice'], ['stat', mdiTune, 'Propose stat change'], ['item', mdiBriefcase, 'Propose item change'], ['skill', mdiFlash, 'Propose skill change']] as const) as [panel, icon, title]}
				<button
					type="button"
					{title}
					onclick={() => togglePanel(panel)}
					class={['p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer', activeAction === panel && 'bg-gray-200 text-gray-900']}
				>
					<Icon path={icon} size={14} pathClass="fill-current" />
				</button>
			{/each}
		{/if}
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

	{#if !isEditing && !disabled}
		<!-- Action panels -->
		{#if activeAction }
			<div class="flex items-center gap-1.5 rounded bg-gray-50 border border-gray-200 px-2 py-1.5">
				{#if activeAction === 'dice'}
					<InputText
						class="flex-1"
						bind:value={diceExpr}
						placeholder="2d6+3"
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), submitDice())}
					/>

				{:else if activeAction === 'stat'}
					<InputSelect
						class="flex-1"
						bind:value={statField}
						options={statOptions}
					/>
					<InputNumber
						class="flex-1"
						bind:value={statDelta}
						placeholder={m.proposal_stat_delta()}
					/>
					<InputText
						class="flex-1"
						bind:value={statReason}
						placeholder={m.proposal_reason()}
					/>

				{:else if activeAction === 'item'}
					<InputSelect
						class="flex-1"
						bind:value={itemTypeId}
						options={[['', '— item —'], ...(itemsQuery.current ?? []).map((i) => [i.id, i.name] as [string, string])]}
					/>
					<InputNumber
						class="flex-1"
						bind:value={itemDelta}
						placeholder={selectedItem?.trackingMode === 'durability' ? m.proposal_item_dur() : m.proposal_item_qty()}
					/>
					<InputText
						class="flex-1"
						bind:value={itemReason}
						placeholder={m.proposal_reason()}
					/>

				{:else if activeAction === 'skill'}
					<InputSelect
						class="flex-1"
						bind:value={skillTypeId}
						options={[['', '— skill —'], ...(skillsQuery.current ?? []).map((s) => [s.id, s.name] as [string, string])]}
					/>
					<InputSelect
						class="flex-1"
						bind:value={skillAction}
						options={[['add', '+ add'], ['remove', '− remove']]}
					/>
					<InputText
						class="flex-1"
						bind:value={skillReason}
						placeholder={m.proposal_reason()}
					/>
				{/if}
				<Button
					type="button"
					kind="primary"
					icon={mdiSend}
					onclick={submitByType[activeAction]}
					disabled={!skillTypeId || skillSubmitting}
				/>
				<Button
					onclick={() => (activeAction = null)}
					type="button"
					kind="ghost"
					icon={mdiClose}
				/>
			</div>
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
	{/if}
</form>
