<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import { localize } from '$lib/localize';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

	const statLabels: Record<string, string> = {
		str: 'STR',
		dex: 'DEX',
		con: 'CON',
		int: 'INT',
		wis: 'WIS',
		cha: 'CHA'
	};

	let { selectedRace } = $props();
</script>


<div class="mt-3 rounded-lg bg-gray-50 p-3">
  <p class="mb-2 text-xs font-medium text-gray-600">{m.char_stats_title()}</p>
  <div class="grid grid-cols-6 gap-2">
    {#each statKeys as key}
      <div class="flex flex-col items-center rounded-lg bg-white py-2 ring-1 ring-gray-200">
        <span class="text-xs font-medium text-gray-500">{statLabels[key]}</span>
        <span class="text-sm font-semibold text-gray-900">
          {selectedRace.baseStats[key]}
        </span>
      </div>
    {/each}
  </div>

  {#if selectedRace.raceSkills.length > 0}
    <p class="mb-1 mt-3 text-xs font-medium text-gray-600">{m.char_starting_skills()}</p>
    <div class="flex flex-wrap gap-1">
      {#each selectedRace.raceSkills as rs}
        <Badge label={localize(rs.skill.name, getLocale())} />
      {/each}
    </div>
  {/if}
</div>