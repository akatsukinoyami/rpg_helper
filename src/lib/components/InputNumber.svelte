<script lang="ts">
  let {
    label,
    id,
    value = $bindable(),
    ...rest
  } = $props()
</script>

<div class="flex flex-col gap-1">
  <label class="text-sm font-medium text-gray-700" for={id}>{label}</label>
  <input
    {...rest}
    {id}
    type="number"
    class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    bind:value
  />
</div>