<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export const kinds = {
		success: 'bg-green-100 text-green-700 ring-green-200',
		warn: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
		danger: 'bg-red-100 text-red-700 ring-red-200',
		info: 'bg-indigo-100 text-indigo-700 ring-indigo-950',
		secondary: 'bg-white text-gray-900 ring-gray-200 hover:ring-gray-400',
	} as const;

	export type BadgeKind = keyof typeof kinds;

	export interface Props extends HTMLAttributes<HTMLSpanElement> {
		label?: string;
		kind?: BadgeKind;
		children?: Snippet;
	}
</script>

<script lang="ts">
  let { label, kind = 'info' }: Props = $props();
</script>

<span class={[kinds[kind], "rounded-full px-3 py-1 text-xs font-medium "]}>
  {label}
</span>