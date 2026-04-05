<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import * as m from '$lib/paraglide/messages';
	import GameForm from '$lib/partials/GameForm.svelte';
	import * as game from '$lib/remote/games.remote';
	import * as transfer from '$lib/remote/transfer.remote';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function doExport(section: 'all' | 'races' | 'skillTypes' | 'itemTypes' | 'locations') {
		const result = await transfer.exportSection({ section });
		const blob = new Blob([result.yaml], { type: 'text/yaml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = result.filename;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="mb-6">
	<h1 class="mt-2 text-2xl font-semibold text-gray-900">{m.game_edit_title()}</h1>
</div>

<GameForm
	remoteForm={game.edit}
	submitLabel={m.game_edit_submit()}
	name={data.game.name}
	description={data.game.description}
	image={data.game.image}
>
	<div class="flex flex-col gap-4 my-4 py-4 border-t border-gray-200">
		{#if data.otherPlayers.length > 0}
			<section>
				<form {...game.transfer} class="flex justify-between items-center gap-3">
				<span class="text-sm font-semibold text-gray-700">{m.game_transfer_gm()}</span>
					<div class="flex gap-2 items-center">
						<InputSelect
							id="newGmUserId"
							name="newGmUserId"
							class="w-48"
							options={data.otherPlayers.map((p) => [p.userId, p.user.name] as [string, string])}
						/>
						<Button type="submit" label={m.game_transfer_gm_submit()} kind="danger" />
					</div>
				</form>
			</section>
		{/if}

		<section>
			<div class="flex flex-wrap justify-between items-center gap-2">
				<span class="text-sm font-semibold text-gray-700">{m.transfer_export()}</span>
				<div class="flex gap-2 items-center">
					<Button onclick={() => doExport('all')} label={m.transfer_export_all()} kind="secondary" />
					<Button onclick={() => doExport('races')} label={m.transfer_export_races()} kind="secondary" />
					<Button onclick={() => doExport('skillTypes')} label={m.transfer_export_skills()} kind="secondary" />
					<Button onclick={() => doExport('itemTypes')} label={m.transfer_export_items()} kind="secondary" />
					<Button onclick={() => doExport('locations')} label={m.transfer_export_locations()} kind="secondary" />
				</div>
			</div>
		</section>
	</div>
</GameForm>

