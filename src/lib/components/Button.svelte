<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	export const kinds = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
		selected: 'bg-indigo-50 text-indigo-700 border-indigo-500',
		danger: 'bg-red-600 text-red-900 hover:bg-red-700',
		success: 'bg-green-600 text-green-900 hover:bg-green-700',
		secondary: 'text-gray-600 border-gray-200 hover:border-gray-300',
		ghost: 'text-gray-500 hover:text-gray-900 border-0!'
	} as const;

	export type ButtonKind = keyof typeof kinds;

	export const iconKinds = {
		primary: 	'fill-white',
		selected: 'fill-indigo-700',
		danger: 	'fill-red-900',
		success: 	'fill-green-900',
		secondary:'fill-gray-600',
		ghost: 		'fill-gray-500'
	} satisfies Record<ButtonKind, string>;

	interface Props {
		label?: string;
		kind?: ButtonKind;
		children?: Snippet;
		icon?: string;
	}

	type asAnchor = HTMLAnchorAttributes & { href: string };
	type asButton = HTMLButtonAttributes & { href?: never };
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

  let { 
    label = '', 
    kind = 'primary', 
    href,
		icon,
    class: className, 
    children, 
    ...rest 
  }: Props & (asAnchor | asButton) = $props();

  let classLocal = $derived([
		className, 
		kinds[kind], 
		'flex border rounded-lg text-sm font-medium',
		label && icon 
			? 'justify-between' 
			: `${label ? 'px-4 py-2' : 'p-2'} justify-center`, 
	]);
</script>

{#snippet content()}
  {#if children}
    {@render children()}
  {:else}
    {#if label}
			<span>{label}</span>
		{/if}
		<Icon path={icon} pathClass={iconKinds[kind]}/>
  {/if}
{/snippet}

{#if href}
  <a {href} class={classLocal} {...rest as HTMLAnchorAttributes}>{@render content()}</a>
{:else}
  <button class={classLocal} {...rest as HTMLButtonAttributes}>{@render content()}</button>
{/if}
