<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	export const kinds = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
		selected: 'border-indigo-500 bg-indigo-50 text-indigo-700',
		secondary: 'border-gray-200 text-gray-600 hover:border-gray-300',
		danger: 'bg-red-600 text-red-900 hover:bg-red-700',
		success: 'bg-green-600 text-green-900 hover:bg-green-700',
		ghost: 'text-gray-500 hover:text-gray-900 border-0!'
	} as const;

	export type ButtonKind = keyof typeof kinds;

	interface Props {
		label?: string;
		kind?: ButtonKind;
		children?: Snippet;
	}

	type asAnchor = HTMLAnchorAttributes & { href: string };
	type asButton = HTMLButtonAttributes & { href?: never };
</script>

<script lang="ts">
  let { 
    label = '', 
    kind = 'primary', 
    href,
    class: className = 'px-4 py-2', 
    children, 
    ...rest 
  }: Props & (asAnchor | asButton) = $props();

  let classLocal = $derived([className, kinds[kind], 'border rounded-lg text-sm font-medium']);
</script>

{#snippet content()}
  {#if children}
    {@render children()}
  {:else}
    {label}
  {/if}
{/snippet}


{#if href}
  <a {href} class={classLocal} {...rest as HTMLAnchorAttributes}>{@render content()}</a>
{:else}
  <button class={classLocal} {...rest as HTMLButtonAttributes}>{@render content()}</button>
{/if}