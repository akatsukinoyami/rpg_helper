<script lang="ts">
  let { children } = $props();
</script>

<div class="max-w-lg mx-auto">
  {@render children?.()}
</div>