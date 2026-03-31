<div class="flex gap-3 rounded-xl bg-gray-50 p-4">
  {#each ['bg-indigo-600', 'bg-green-600', 'bg-red-600', 'bg-yellow-700', 'bg-gray-900', 'bg-gray-200'] as bg}
    <div class={["h-8 w-8 rounded-full ring-1 ring-gray-200", bg]}></div>
  {/each}
</div>