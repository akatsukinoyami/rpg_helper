<script lang="ts">
	import { enhance } from '$app/forms'
	import * as m from '$lib/paraglide/messages'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	const statusLabel = (status: string) => {
		if (status === 'approved') return m.game_dashboard_approved()
		if (status === 'rejected') return m.game_dashboard_rejected()
		return m.game_dashboard_pending()
	}

	const statusClass = (status: string) => {
		if (status === 'approved') return 'bg-green-100 text-green-700'
		if (status === 'rejected') return 'bg-red-100 text-red-700'
		return 'bg-yellow-100 text-yellow-700'
	}

	const otherPlayers = $derived(
		data.game.characters.filter((c) => c.userId !== data.game.gmUserId && c.userId !== data.myCharacter?.userId)
	)
</script>

<div class="flex items-start justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-gray-900">{data.game.name}</h1>
		{#if data.game.description}
			<p class="mt-1 text-gray-500">{data.game.description}</p>
		{/if}
		<p class="mt-2 text-sm text-gray-400">
			GM: <span class="font-medium text-gray-600">{data.game.gm.name}</span>
		</p>
	</div>
	{#if data.isGm}
		<span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
			{m.games_gm_badge()}
		</span>
	{/if}
</div>

<!-- Characters -->
<section class="mt-8">
	<h2 class="mb-4 text-lg font-medium text-gray-900">{m.game_dashboard_characters()}</h2>

	{#if data.game.characters.length === 0}
		<p class="text-sm text-gray-400">{m.game_dashboard_no_characters()}</p>
	{:else}
		<div class="flex flex-col gap-3">
			{#each data.game.characters as char}
				<div class="flex items-center justify-between rounded-2xl bg-white px-6 py-4 ring-1 ring-gray-200">
					<div>
						<p class="font-medium text-gray-900">{char.name}</p>
						<p class="text-sm text-gray-500">{char.user.name}{char.race ? ` · ${char.race.name}` : ''}</p>
					</div>

					<div class="flex items-center gap-3">
						<span class="rounded-full px-3 py-1 text-xs font-medium {statusClass(char.status)}">
							{statusLabel(char.status)}
						</span>

						{#if data.isGm && char.status === 'pending'}
							<form method="post" action="?/approve" use:enhance>
								<input type="hidden" name="characterId" value={char.id} />
								<button
									type="submit"
									class="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
								>
									{m.game_dashboard_approve()}
								</button>
							</form>
							<form method="post" action="?/reject" use:enhance>
								<input type="hidden" name="characterId" value={char.id} />
								<button
									type="submit"
									class="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
								>
									{m.game_dashboard_reject()}
								</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- Transfer GM (GM only, only if there are other players) -->
{#if data.isGm && otherPlayers.length > 0}
	<section class="mt-10 border-t border-gray-200 pt-8">
		<h2 class="mb-4 text-lg font-medium text-gray-900">{m.game_transfer_gm()}</h2>
		<form method="post" action="?/transfer" use:enhance class="flex items-end gap-3">
			<div class="flex flex-col gap-1">
				<label class="text-sm font-medium text-gray-700" for="newGmUserId">
					{m.game_transfer_gm_to()}
				</label>
				<select
					id="newGmUserId"
					name="newGmUserId"
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
				>
					{#each otherPlayers as player}
						<option value={player.userId}>{player.user.name}</option>
					{/each}
				</select>
			</div>
			<button
				type="submit"
				class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
			>
				{m.game_transfer_gm_submit()}
			</button>
		</form>
	</section>
{/if}
