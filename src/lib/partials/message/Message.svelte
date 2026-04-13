<script lang="ts" module>
	import type { MessageData } from '$lib/types';
	import type { StatDef } from '$lib/server/db/schema';

	export type MsgView = 'compact' | 'forum';

	export interface Props {
		msg: MessageData;
		view: MsgView;
		isGm?: boolean;
		myCharacterId?: string | null;
		statDefs?: StatDef[];
		onReply?: (msg: MessageData) => void;
	}
</script>

<script lang="ts">
	import { mdiPencil, mdiDelete, mdiCommentEdit, mdiReply } from '@mdi/js';
	import { untrack } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MessageForm from '$lib/partials/message/MessageForm.svelte';
	import { renderMarkdown } from '$lib/md';
	import MessageSystem from '$lib/partials/message/MessageSystem.svelte';
	import MessageAnnotationForm from '$lib/partials/message/MessageAnnotationForm.svelte';
	import * as messages from '$lib/remote/messages.remote';
	import * as m from '$lib/paraglide/messages';
	import ButtonSmall from '$lib/components/ButtonSmall.svelte';
	import VitalBar from '$lib/components/VitalBar.svelte';

	let { msg, view, isGm = false, myCharacterId = null, statDefs = [], onReply }: Props = $props();

	const isSystem = $derived(msg.content === null);

	const name = $derived(msg.character?.name ?? m.message_gm());

	const initials = $derived(msg.character?.image ? '' : name
			.split(' ')
			.slice(0, 2)
			.map((w: string) => w[0]?.toUpperCase() ?? '')
			.join('')
	);

	const hue = $derived(
		untrack(() => [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360)
	);

	const time = $derived(
		new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	);

	const rendered = $derived(msg.content ? renderMarkdown(msg.content) : '');

	const isOwner = $derived(!!myCharacterId && myCharacterId === msg.character?.id);
	const canEdit = $derived((isOwner || isGm) && !isSystem);

	let editing = $state(false);
	let annotating = $state(false);
	let annotationDraft = $state(untrack(() => msg.gmAnnotation ?? ''));
	let deletePending = $state(false);

	async function handleDelete() {
		if (deletePending) return;
		deletePending = true;
		try {
			await messages.remove(msg.id);
		} finally {
			deletePending = false;
		}
	}


</script>

{#snippet avatar(className: string)}
	<span
		class={[
			className,
			msg.character?.image ? 'rounded-md' : 'rounded-full',
			"mt-0.5 flex shrink-0 items-center justify-center font-semibold text-white bg-contain"
		]}
		style={msg.character?.image ? `background-image: url(${msg.character.image})` : `background-color: hsl(${hue} 50% 45%)`}
	>{initials}</span>
{/snippet}

{#snippet actions()}
	{#if myCharacterId || canEdit}
		<div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
			<ButtonSmall 
				title={m.message_reply()}
				onclick={() => onReply?.(msg)}
				visible={!!(myCharacterId && onReply)}
				icon={mdiReply}
			/>
			<ButtonSmall 
				title={m.message_edit()}
				onclick={() => { editing = true; annotating = false; }}
				visible={canEdit}
				icon={mdiPencil}
			/>
			<ButtonSmall 
				class="hover:text-indigo-600"
				title={m.message_gm_comment()}
				onclick={() => { annotating = !annotating; editing = false; annotationDraft = msg.gmAnnotation ?? ''; }}
				visible={canEdit && isGm}
				icon={mdiCommentEdit}
			/>
			<ButtonSmall 
				class="hover:text-red-600"
				title={m.message_delete()}
				onclick={handleDelete}
				disabled={deletePending}
				visible={canEdit}
				icon={mdiDelete}
			/>
		</div>
	{/if}
{/snippet}

{#snippet content()}
	{#if editing}
		<MessageForm
			locationId={msg.locationId ?? ''}
			messageId={msg.id}
			initialContent={msg.content ?? ''}
			myCharacterId={myCharacterId ?? msg.character?.id}
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
			<MessageAnnotationForm
				messageId={msg.id}
				bind:value={annotationDraft}
				onClose={() => annotating = false}
			/>
		{/if}
	{/if}
{/snippet}

{#snippet replyPreview()}
	{#if msg.reply?.id && msg.reply?.content != null}
		<div class="flex items-start gap-1 rounded bg-gray-100 border-l-2 border-gray-300 px-1.5 py-1 text-[11px] text-gray-500 max-w-full overflow-hidden">
			<Icon path={mdiReply} size={11} pathClass="fill-gray-400 shrink-0 mt-0.5" />
			<span class="font-semibold shrink-0">{msg.reply.characterName ?? m.message_gm()}:</span>
			<span class="truncate">{msg.reply.content}</span>
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
	<MessageSystem {msg} {isGm} {statDefs} />
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

		<avatar class="flex flex-col gap-1 p-1">
			{@render avatar('h-24 w-24 text-10')}
			<div class="mt-2 flex flex-col gap-1">
				{#each statDefs.filter(d => d.isVital) as def}
					{@const vital = msg.character?.vitals?.[def.key]}
					{#if vital?.max}
						<VitalBar current={vital.current} max={vital.max} color={def.color} />
					{/if}
				{/each}
			</div>
		</avatar>

		<section class="flex-1 min-w-0">
			{@render replyPreview()}
			{@render content()}
		</section>

		<div class="bg-gray-50 p-1"></div>

		{@render footer()}
	</message>
{/if}
