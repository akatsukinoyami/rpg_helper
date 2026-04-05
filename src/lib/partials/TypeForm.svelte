<script lang="ts">
  import { mdiClose } from "@mdi/js";
  import { type Snippet } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import * as m from '$lib/paraglide/messages';
  import Button from "$lib/components/Button.svelte";
  import * as ItemTypeRemoteFuncs from "$lib/remote/item-types.remote";
  import * as SkillTypeRemoteFuncs from "$lib/remote/skill-types.remote";
  import * as LocationTypeRemoteFuncs from "$lib/remote/locations.remote";
  import * as RaceRemoteFuncs from "$lib/remote/races.remote";

  async function remove(id: string) {
    if (!id) return;
    await remoteFunctions.remove({ id });
    await invalidateAll();
    open = false;
  }

  interface Props {
    action: 'create' | 'edit';
    open: boolean;
    class?: string;
    entity?: Record<string, any>;
    children?: Snippet;
    canDelete?: boolean;
    remoteFunctions: typeof ItemTypeRemoteFuncs | typeof SkillTypeRemoteFuncs | typeof LocationTypeRemoteFuncs | typeof RaceRemoteFuncs;
    titles?: Partial<Record<keyof typeof ItemTypeRemoteFuncs, string>>;
  }

  let {
    action,
    entity,
    class: className,
    open = $bindable(),
    titles,
    children,
    canDelete = true,
    remoteFunctions,
  }: Props = $props();

  const func = $derived(remoteFunctions[action]);
</script>

{#if open}
  <form
    {...func.enhance(async ({ form, data, submit }) => {
      await submit();
      form.reset();
      open = false;
    })}
    oninput={() => func.validate()}
    class={[className, "flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-gray-200"]}
  >
    <input type="hidden" name="id" value={entity?.id} />

    <div class="flex justify-between items-center">
      <h2 class="text-sm font-semibold text-gray-700">{titles?.[action]}</h2>

      <Button
        kind="secondary"
        type="reset"
        icon={mdiClose}
        onclick={() => open = false}
      />
    </div>

    {#each func.fields.allIssues() as issue}
      <p>{issue.message}</p>
    {/each}

    {@render children?.()}

    <div class={["flex", action === 'edit' ? 'justify-between' : 'justify-end']}>
      {#if action === 'edit' && canDelete}
        <Button kind="danger" label={m.item_type_delete()} onclick={() => remove(entity?.id)} />
      {/if}
      <Button type="submit" label={m.item_type_save()} />
    </div>
  </form>
{/if}
