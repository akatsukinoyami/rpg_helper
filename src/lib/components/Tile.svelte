<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes, HTMLAttributes } from 'svelte/elements';
	import type { BadgeKind } from './Badge.svelte';

	export interface Props {
		class?: string;
		title?: string;
		subtitle?: string | null;
		kind?: BadgeKind;
		image?: string | null;
		children?: Snippet;
    content?: Snippet;
	}

	type asAnchor = HTMLAnchorAttributes & { href: string; onclick?: never };
	type asButton = HTMLButtonAttributes & { href?: never; onclick?: (e: MouseEvent) => void };
	type asDiv = HTMLAttributes<HTMLDivElement> & { href?: never; onclick?: never };
</script>

<script lang="ts">
  import { kinds } from "./Badge.svelte";
    
	let {
    class: className,
    title,
    subtitle,
    kind = 'secondary',
    image,
    href,
    onclick,
    children,
    content,
    ...rest
  }: Props & (asAnchor | asButton | asDiv) = $props();

  let classLocal = $derived([className, kinds[kind], "flex items-center justify-between rounded-xl px-2 py-1 ring-1"]);
  let contentRendered = $derived(content ?? contentLocal)
</script>

{#snippet contentLocal()}
  <div class="flex items-center gap-3">
    {#if image}
      <img src={image} alt="" class="h-10 w-10 shrink-0 rounded-full object-cover" />
    {/if}
    <div>
      {#if title}<p class="text-sm font-medium text-gray-900">{title}</p>{/if}
      {#if subtitle}<p class="text-[12px] text-gray-500 h-4 overflow-hidden text-ellipsis">{subtitle}</p>{/if}
    </div>
  </div>

  <div class="flex items-center gap-3">
    {@render children?.()}
  </div>
{/snippet}


{#if href}
  <a {href} class={[classLocal, "cursor-pointer"]} {...rest as HTMLAnchorAttributes}>
    {@render contentRendered()}
  </a>
{:else if onclick}
  <button {onclick} class={[classLocal, "cursor-pointer"]} {...rest as HTMLButtonAttributes}>
    {@render contentRendered()}
  </button>
{:else}
  <div class={classLocal} {...rest as HTMLAttributes<HTMLDivElement>}>
    {@render contentRendered()}
  </div>
{/if}