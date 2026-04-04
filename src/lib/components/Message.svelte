<script lang="ts" module>
	export type MsgView = 'compact' | 'forum';

	export interface MessageData {
		id: string;
		content: string;
		createdAt: Date | string;
		characterName: string | null;
		locationName?: string;
	}
</script>

<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	interface Props {
		msg: MessageData;
		view: MsgView;
	}

	let { msg, view }: Props = $props();

	const name = $derived(msg.characterName ?? m.message_gm());

	const initials = $derived(
		name
			.split(' ')
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
	);

	// Deterministic hue from name so each character has a consistent colour
	const hue = $derived(
		[...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
	);

	const time = $derived(
		new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	);
</script>

{#if view === 'compact'}
	<div class="flex items-center-safe gap-1.5">
		<span
			class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
			style:background-color="hsl({hue} 50% 45%)"
		>{initials}</span>
			<span class="text-xs font-semibold text-gray-700">{name}:&nbsp;</span>
			<span class="text-xs text-gray-900">{msg.content}</span>
			{#if msg.locationName}
				<span class="ml-1 text-[12px] text-gray-400">· {msg.locationName}</span>
			{/if}
	</div>
{:else}
	<div class="flex items-center gap-2">
		<span
			class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
			style:background-color="hsl({hue} 50% 45%)"
		>{initials}</span>

		<div class="flex flex-col gap-0.5">
			<div class="flex items-baseline gap-2">
				<span class="text-xs font-semibold text-gray-800">{name}</span>
				<span class="text-[12px] text-gray-400">{time}</span>
				{#if msg.locationName}
					<span class="text-[12px] text-gray-400">{msg.locationName}</span>
				{/if}
			</div>
			<p class="text-xs text-gray-900">{msg.content}</p>
		</div>
	</div>
{/if}
