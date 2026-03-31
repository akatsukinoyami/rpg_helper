<script lang="ts">
  let { title, subtitle, children } = $props();
</script>


<div class="flex items-center justify-between rounded-2xl bg-white px-6 py-4 ring-1 ring-gray-200">
  <div>
    <p class="font-medium text-gray-900">{title}</p>
    {#if subtitle}<p class="text-sm text-gray-500">{subtitle}</p>{/if}
  </div>

  <div class="flex items-center gap-3">
    {@render children?.()}
  </div>
</div>