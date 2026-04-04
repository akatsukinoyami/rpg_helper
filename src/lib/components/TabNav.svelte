<script lang="ts">
  import Button, { type Props as ButtonProps } from "./Button.svelte";

  interface Props {
    options: ButtonProps[];
    isActive: (e: ButtonProps) => boolean;
    onclick?: (e: MouseEvent) => void;
  }

  let { options, isActive, onclick }: Props = $props();
</script>

<nav class="flex gap-0.5 border-b border-gray-200" {onclick}>
  {#each options as option}
    <Button
      {...option}
      kind="ghost"
      class={[
        'flex-1 px-2 py-1 text-xs font-medium border-b-2 -mb-px transition-colors text-center',
        isActive(option)
          ? 'border-gray-900 text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      ]}
    />
  {/each}
</nav>