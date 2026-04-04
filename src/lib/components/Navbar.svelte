<script lang="ts" module>
	import type { Paths } from '$lib/components/Icon.svelte';

	export interface NavTab {
		href: string;
		label: () => string;
		active: boolean;
	}

	export interface NavAction {
		icon: Paths;
		href?: string;
		onclick?: () => void;
		hidden?: boolean;
		label?: string;
	}
</script>

<script lang="ts">
	import { mdiPlus } from '@mdi/js';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		// Left: title area
		title: string;
		titleHref?: string;
		titleImage?: string;
		// Left: tab strip (shown after a divider if provided)
		tabs?: NavTab[];
		onAdd?: () => void;
		// Right: icon buttons
		actions?: NavAction[];
	}

	let { title, titleHref, titleImage, tabs, onAdd, actions }: Props = $props();
</script>

<nav class="sticky top-0 z-10 border-b border-gray-200 bg-white">
	<div class="mx-auto flex max-w-5xl items-center gap-3 px-3 py-1.5">

		<!-- Left -->
		<div class="flex min-w-0 flex-1 items-center gap-2">
			{#if titleImage}
				<img src={titleImage} alt="" class="h-6 w-6 shrink-0 rounded-full object-cover" />
			{/if}

			{#if titleHref}
				<a href={titleHref} class="shrink-0 text-sm font-semibold text-gray-900">{title}</a>
			{:else}
				<span class="shrink-0 text-sm font-semibold text-gray-900">{title}</span>
			{/if}

			{#if tabs}
				<span class="text-gray-300">|</span>

				<div class="flex items-center gap-0.5 overflow-x-auto">
					{#each tabs as tab}
						<Button 
							class="text-xs rounded-md px-2 py-1 border-0" 
							href={tab.href} 
							kind={tab.active ? 'selected' : 'ghost'} 
							label={tab.label()} 
						/>
					{/each}

					<Button 
						class="px-1" 
						kind="ghost" 
						onclick={onAdd} 
						icon={mdiPlus}
						hidden={!onAdd}
					/>
				</div>
			{/if}
		</div>

		<!-- Right -->
		{#if actions?.length}
			<div class="flex shrink-0 items-center gap-1">
				{#each actions as action}
					<Button
						class="px-1"
						icon={action.icon}
						href={action.href}
						onclick={action.onclick}
						hidden={action.hidden}
						kind="ghost"
					/>
				{/each}
			</div>
		{/if}

	</div>
</nav>
