<script lang="ts" module>
	import type { SVGAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export interface Props extends SVGAttributes<SVGPathElement> {
		path?: string;
		class?: string;
		pathClass?: string;
		size?: number;
		height?: number;
		width?: number;
		viewBox?: string;
		fill?: string;
		stroke?: string;
		strokeWidth?: number;
		children?: Snippet;
	}
</script>

<script lang="ts">
  let {
    path = '',
    class: className = '',
    pathClass = '',
    size = 24,
    height = size,
    width = size,
    stroke = undefined,
    strokeWidth = undefined,
    viewBox = '0 0 24 24', //`0 0 ${width} ${height}`,
    fill = 'none',
    children,
    ...rest
  }: Props = $props();
</script>

{#if path || children}
  <svg
    class={className}
    {width}
    {height}
    {fill}
    {viewBox}
    {stroke}
    stroke-width={strokeWidth}
    xmlns="http://www.w3.org/2000/svg"
    style:min-width={width}
    style:min-height={height}
  >
    {#if children}
      {@render children()}
    {:else if Array.isArray(path)}
      {#each path as d}
        <path {d} {...rest} class={pathClass} />
      {/each}
    {:else}
      <path d={path} {...rest} class={pathClass} />
    {/if}
  </svg>
{/if}