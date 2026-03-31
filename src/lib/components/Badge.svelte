<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from 'svelte/elements';

  export const kinds = {
    success: 'bg-green-100 text-green-700',
    warn: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-indigo-100 text-indigo-700'
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

<span class={["rounded-full px-3 py-1 text-xs font-medium ", kinds[kind]]}>
  {label}
</span>