<script lang="ts">
	import { getContext } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import * as m from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { mdiPencil, mdiTrashCan } from '@mdi/js';
	import { deleteSkillType } from '$lib/remote/skill-types.remote';
	import type { PageData } from './$types';
	import Form from './form.svelte';

	let { data }: { data: PageData } = $props();

	let addFormState = getContext<{ open: boolean }>('addFormState');

	async function remove(skillTypeId: string) {
		await deleteSkillType({ skillTypeId });
		await invalidateAll();
	}
</script>

{#if data.isGm}
	<Form action="c" bind:open={addFormState.open}/>
{/if}

{#if data.skills.length === 0}
	<p class="text-sm text-gray-400">{m.skill_type_no_skills()}</p>
{:else}
	<div class="flex flex-col gap-2">
		{#each data.skills as skill}
			<div class="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-gray-200">
				<div>
					<p class="text-sm font-medium text-gray-900">{skill.name.en}</p>
					{#if skill.description?.en}
						<p class="text-xs text-gray-400">{skill.description.en}</p>
					{/if}
				</div>
				{#if data.isGm}
					<div class="flex gap-2">
						<Button icon={mdiPencil} kind="secondary" href={localizeHref(`/games/${data.gameId}/skills/${skill.id}/edit`)} />
						<Button icon={mdiTrashCan} kind="danger" onclick={() => remove(skill.id)} />
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
