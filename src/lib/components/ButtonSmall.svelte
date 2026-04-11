<script lang="ts">
  import { type HTMLAttributes } from "svelte/elements";
  import Icon from "$lib/components/Icon.svelte";

  interface Props extends HTMLAttributes<HTMLElement> {
    title?: string;
    onclick?: (e: MouseEvent) => void;
    icon?: string;
    iconSize?: number;
    disabled?: boolean;
    visible?: boolean;
  }

  let { 
    title, 
    onclick, 
    icon: path, 
    iconSize = 16,
    disabled, 
    visible = true, 
    ...rest 
  }: Props = $props()
</script>

{#if visible}
  <button
    class={["p-0.5 rounded text-gray-400 hover:text-gray-700 cursor-pointer", rest.class]}
    type="button"
    {title}
    {onclick}
    {disabled}
  >
    <Icon {path} size={iconSize} pathClass="fill-current" />
  </button>
{/if}