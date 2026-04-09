<script lang="ts">
  let { msg, children } = $props();

  const time = $derived(
		new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	);
</script>

<message-wrapper class="flex items-center gap-2 px-2 py-1 font-light text-gray-500">
  <hr class="flex-1 border-gray-500" />
  <span class="text-[10px]">{msg.characterName}</span>
  <span class="text-xs shrink-0 align-middle">{@render children?.()} </span>
  <span class="text-[10px]">{time}</span>
  <hr class="flex-1 border-gray-500" />
</message-wrapper>