<script lang="ts" module>
	export type MsgView = 'compact' | 'forum';

	export interface MessageData {
		id: string;
		content: string | null;
		createdAt: Date | string;
		editedAt?: Date | string | null;
		gmAnnotation?: string | null;
		characterId?: string | null;
		characterName: string | null;
		characterImage?: string | null;
		locationName?: string;
		locationId?: string;
		moveId?: string | null;
		replyToId?: string | null;
		replyContent?: string | null;
		replyCharacterName?: string | null;
		events?: import('$lib/types').SystemEvent[];
	}

	export interface Props {
		msg: MessageData;
		view: MsgView;
		isGm?: boolean;
		myCharacterId?: string | null;
		onReply?: (msg: MessageData) => void;
	}
</script>

<script lang="ts">
	import { mdiPencil, mdiDelete, mdiCommentEdit, mdiCheck, mdiClose, mdiReply } from '@mdi/js';
	import { untrack } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MessageForm from '$lib/partials/MessageForm.svelte';
	import { fieldColors, fieldSpacing } from '$lib/constants/styles';
	import { renderMarkdown } from '$lib/md';
	import * as messages from '$lib/remote/messages.remote';
	import * as proposals from '$lib/remote/proposals.remote';

	import * as m from '$lib/paraglide/messages';
	import type { SystemEvent, CharacterChangeEvent, ItemChangeEvent, SkillChangeEvent, ProposalEventType } from '$lib/types';

	let { msg, view, isGm = false, myCharacterId = null, onReply }: Props = $props();

	const isSystem = $derived(msg.content === null);

	const name = $derived(msg.characterName ?? m.message_gm());

	const initials = $derived(msg.characterImage ? '' : name
			.split(' ')
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
	);

	const hue = $derived(
		[...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
	);

	const time = $derived(
		new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	);

	const rendered = $derived(msg.content ? renderMarkdown(msg.content) : '');

	const isOwner = $derived(!!myCharacterId && myCharacterId === msg.characterId);
	const canEdit = $derived((isOwner || isGm) && !isSystem);

	let editing = $state(false);
	let annotating = $state(false);
	let annotationDraft = $state(untrack(() => msg.gmAnnotation ?? ''));
	let deletePending = $state(false);

	const statLabels: Record<string, string> = {
		hp: 'HP', mp: 'MP', maxHp: 'Max HP', maxMp: 'Max MP',
		str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA'
	};

	function signedDelta(n: number): string {
		return n > 0 ? `+${n}` : `${n}`;
	}

	function eventLineClass(event: SystemEvent): string {
		if (event.type === 'move' || event.type === 'diceRoll') return 'text-gray-400';
		const e = event as CharacterChangeEvent | ItemChangeEvent | SkillChangeEvent;
		if (e.status === 'rejected') return 'text-gray-300 line-through';
		if (e.status === 'pending') return 'text-gray-400';
		// approved — color by direction
		if (event.type === 'characterChange') return event.delta > 0 ? 'text-green-600' : 'text-red-500';
		if (event.type === 'itemChange') {
			const d = event.deltaQty ?? event.deltaDur ?? 0;
			return d > 0 ? 'text-green-600' : 'text-red-500';
		}
		if (event.type === 'skillChange') return event.action === 'add' ? 'text-green-600' : 'text-red-500';
		return 'text-gray-400';
	}

	function diceRollsText(rolls: number[], modifier: number): string {
		const parts = rolls.join(', ');
		if (modifier === 0) return parts;
		return modifier > 0 ? `${parts} (+${modifier})` : `${parts} (${modifier})`;
	}

	async function handleDelete() {
		if (deletePending) return;
		deletePending = true;
		try {
			await messages.remove(msg.id);
		} finally {
			deletePending = false;
		}
	}

	async function handleEventDelete(event: SystemEvent) {
		if (deletePending) return;
		deletePending = true;
		try {
			if (event.type === 'move' || event.type === 'diceRoll') {
				await messages.remove(msg.id);
			} else {
				await proposals.remove({ type: event.type as ProposalEventType, id: event.id });
			}
		} finally {
			deletePending = false;
		}
	}

	async function handleApprove(event: SystemEvent) {
		await proposals.approve({ type: event.type as ProposalEventType, id: event.id });
	}

	async function saveAnnotation(e: SubmitEvent) {
		e.preventDefault();
		await messages.annotate({ messageId: msg.id, annotation: annotationDraft });
		annotating = false;
	}
</script>

{#snippet avatar(className: string)}
	<span
		class={[
			className, 
			msg.characterImage ? 'rounded-md' : 'rounded-full', 
			"mt-0.5 flex shrink-0 items-center justify-center font-semibold text-white bg-contain"
		]}
		style={msg.characterImage ? `background-image: url(${msg.characterImage})` : `background-color: hsl(${hue} 50% 45%)`}
	>{initials}</span>
{/snippet}

{#snippet actions()}
	{#if myCharacterId || canEdit}
		<div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
			{#if myCharacterId && onReply}
				<button
					type="button"
					title={m.message_reply()}
					class="p-0.5 rounded text-gray-400 hover:text-gray-700 cursor-pointer"
					onclick={() => onReply(msg)}
				>
					<Icon path={mdiReply} size={13} pathClass="fill-current" />
				</button>
			{/if}
			{#if canEdit}
				<button
					type="button"
					title={m.message_edit()}
					class="p-0.5 rounded text-gray-400 hover:text-gray-700 cursor-pointer"
					onclick={() => { editing = true; annotating = false; }}
				>
					<Icon path={mdiPencil} size={13} pathClass="fill-current" />
				</button>
				{#if isGm}
					<button
						type="button"
						title={m.message_gm_comment()}
						class="p-0.5 rounded text-gray-400 hover:text-indigo-600 cursor-pointer"
						onclick={() => { annotating = !annotating; editing = false; annotationDraft = msg.gmAnnotation ?? ''; }}
					>
						<Icon path={mdiCommentEdit} size={13} pathClass="fill-current" />
					</button>
				{/if}
				<button
					type="button"
					title={m.message_delete()}
					class="p-0.5 rounded text-gray-400 hover:text-red-600 cursor-pointer"
					onclick={handleDelete}
					disabled={deletePending}
				>
					<Icon path={mdiDelete} size={13} pathClass="fill-current" />
				</button>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet content()}
	{#if editing}
		<MessageForm
			locationId={msg.locationId ?? ''}
			messageId={msg.id}
			initialContent={msg.content ?? ''}
			myCharacterId={myCharacterId ?? msg.characterId}
			onDone={() => editing = false}
		/>
	{:else}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="msg-content">{@html rendered}</div>
		{#if msg.gmAnnotation}
			<p class="text-[11px] text-indigo-600 border-l-2 border-indigo-300 pl-1.5 mt-0.5 italic">
				<span class="font-bold">ГМ:</span>
				{msg.gmAnnotation}
			</p>
		{/if}
		{#if annotating && isGm}
			<form onsubmit={saveAnnotation} class="flex items-center gap-1 mt-1">
				<input
					class={[fieldColors, fieldSpacing, 'rounded-md border text-xs outline-none flex-1']}
					bind:value={annotationDraft}
					placeholder={m.message_gm_comment_placeholder()}
				/>
				<button type="submit" class="p-1 rounded text-gray-400 hover:text-indigo-600 cursor-pointer">
					<Icon path={mdiCheck} size={13} pathClass="fill-current" />
				</button>
				<button type="button" class="p-1 rounded text-gray-400 hover:text-gray-700 cursor-pointer" onclick={() => annotating = false}>
					<Icon path={mdiClose} size={13} pathClass="fill-current" />
				</button>
			</form>
		{/if}
	{/if}
{/snippet}

{#snippet replyPreview()}
	{#if msg.replyToId && msg.replyContent != null}
		<div class="flex items-start gap-1 rounded bg-gray-100 border-l-2 border-gray-300 px-1.5 py-1 text-[11px] text-gray-500 max-w-full overflow-hidden">
			<Icon path={mdiReply} size={11} pathClass="fill-gray-400 shrink-0 mt-0.5" />
			<span class="font-semibold shrink-0">{msg.replyCharacterName ?? m.message_gm()}:</span>
			<span class="truncate">{msg.replyContent}</span>
		</div>
	{/if}
{/snippet}

{#snippet footer()}
	<footer class={["bg-gray-50 p-1 flex", msg.editedAt ? '' : 'items-end']}>
		{#if msg.editedAt}
			<span class="text-[11px] text-gray-400 italic">{m.message_edited()}</span>
		{/if}
		{@render actions()}
	</footer>
{/snippet}


{#if isSystem}
	<message class="px-2 py-0.5">
		
	</message>
{:else if view === 'compact'}
	<message class="group flex items-start gap-2">
		{@render avatar('h-5 w-5 text-[10px]')}

		<div class="flex flex-col gap-0.5 min-w-0 flex-1">
			<div class="flex items-baseline gap-2">
				<span class="text-xs font-semibold text-gray-800">{name}</span>
				<span class="text-[12px] text-gray-400">{time}</span>
				{#if msg.locationName}
					<span class="text-[12px] text-gray-400">{msg.locationName}</span>
				{/if}
			</div>
			{@render replyPreview()}
			{@render content()}
			{@render footer()}
		</div>
	</message>
{:else}
	<message class="grid grid-cols-[7rem_1fr] group relative gap-y-2 w-full border-y border-gray-200">
		<name class="block text-xs font-semibold text-gray-800 bg-gray-100 p-1">
			{name}
		</name>

		<header class="block text-[12px] text-gray-400 text-right bg-gray-100 p-1">
			{msg.locationName ? `${msg.locationName} / `: ''}
			{msg.id}
			{time}
		</header>

		<avatar class="block">
			{@render avatar('h-24 w-24 text-10')}
		</avatar>

		<section class="flex-1 min-w-0">
			{@render replyPreview()}
			{@render content()}
		</section>

		<div class="bg-gray-50 p-1"></div>

		{@render footer()}
	</message>
{/if}
