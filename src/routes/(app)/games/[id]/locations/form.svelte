<script lang="ts">
  import * as remoteFunctions from '$lib/remote/locations.remote';
  import * as m from '$lib/paraglide/messages';
  import InputText from '$lib/components/InputText.svelte';
  import InputTextArea from '$lib/components/InputTextArea.svelte';
  import InputSelect from '$lib/components/InputSelect.svelte';
  import TypeForm from '$lib/partials/TypeForm.svelte';

  interface Props {
    action: 'create' | 'edit';
    open: boolean;
    entity?: Record<string, any>;
    defaultParentId?: string;
  }

  let { action, entity, open = $bindable(), defaultParentId }: Props = $props();

  const allQuery = remoteFunctions.all();

  function buildTree(
    all: { id: string; parentId: string | null; name: string }[],
    excludeId?: string
  ): [string, string][] {
    const byParent = new Map<string | null, typeof all>();
    for (const loc of all) {
      if (loc.id === excludeId) continue;
      const key = loc.parentId ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(loc);
    }
    const result: [string, string][] = [];
    function walk(parentId: string | null, depth: number) {
      for (const loc of byParent.get(parentId) ?? []) {
        result.push([loc.id, `${'– '.repeat(depth)}${loc.name}`]);
        walk(loc.id, depth + 1);
      }
    }
    walk(null, 0);
    return result;
  }

  const parentOptions = $derived(buildTree(allQuery.current ?? [], entity?.id));

  const isRoot = $derived(action === 'edit' && (entity?.parentId === null || entity?.parentId === undefined));
</script>

<TypeForm
  {action}
  {remoteFunctions}
  {entity}
  bind:open
  canDelete={!isRoot}
  titles={{ create: m.location_create(), edit: m.location_edit_title() }}
>
  <InputText
    id="location-name"
    name="name"
    label={m.location_field_name()}
    value={entity?.name}
    required
  />

  <InputTextArea
    id="location-desc"
    name="description"
    label={m.location_field_desc()}
    value={entity?.description}
  />

  {#if action === 'create'}
    <input type="hidden" name="parentId" value={defaultParentId} />
  {:else if !isRoot}
    <InputSelect
      id="location-parent"
      name="parentId"
      label={m.location_field_parent()}
      value={entity?.parentId ?? ''}
      options={parentOptions}
    />
  {/if}
</TypeForm>
