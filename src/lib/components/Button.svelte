<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';
	import type { Props as IconProps, Paths } from '$lib/components/Icon.svelte';

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
		primary: 'fill-white',
		selected: 'fill-indigo-700',
		danger: 'fill-red-900',
		success: 'fill-green-900',
		secondary: 'fill-gray-600',
		ghost: 'fill-gray-500'
	} satisfies Record<ButtonKind, string>;

	export interface Props extends HTMLAttributes<HTMLElement> {
		label?: string;
		kind?: ButtonKind;
		children?: Snippet;
		icon?: Paths;
		iconProps?: IconProps;
		href?: string;
		hidden?: boolean;
		onclick?: (e: MouseEvent) => void;
	}

	type asAnchor = HTMLAnchorAttributes & { href: string };
	type asButton = HTMLButtonAttributes & { href?: never };
</script>

<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

  let { 
    label = '', 
    kind = 'primary', 
    href,
		icon,
		iconProps,
		hidden = false,
    class: className = label ? 'px-2 py-1' : 'p-1', 
    children, 
    ...rest 
  }: Props & (asAnchor | asButton) = $props();

  let classLocal = $derived([
		kinds[kind], 
		'flex border rounded-lg text-sm font-medium',
		!!(href || rest.onclick) ? 'cursor-pointer' : '',
		label && icon 
			? 'justify-between' 
			: `justify-center`, 
		className, 
	]);
</script>

{#if !hidden}
	{#snippet content()}
		{#if children}
			{@render children()}
		{:else}
			{#if label}
				<span>{label}</span>
			{/if}
			<Icon {...iconProps} path={icon} pathClass={iconKinds[kind]} />
		{/if}
	{/snippet}

	{#if href}
		<a {href} class={classLocal} {...rest as HTMLAnchorAttributes}>{@render content()}</a>
	{:else}
		<button class={classLocal} {...rest as HTMLButtonAttributes}>{@render content()}</button>
	{/if}
{/if}