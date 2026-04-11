import * as m from '$lib/paraglide/messages';

export type GameLabels = { hpLabel: string; mpLabel: string };

export function buildStatLabels(game?: GameLabels) {
	return {
		hp: game?.hpLabel ? game.hpLabel : m.stat_hp(),
		mp: game?.mpLabel ? game.mpLabel : m.stat_mp(),
		maxHp: game?.hpLabel ? `${m.stat_max_prefix()} ${game.hpLabel}` : m.stat_maxHp(),
		maxMp: game?.mpLabel ? `${m.stat_max_prefix()} ${game.mpLabel}` : m.stat_maxMp(),
		str: m.stat_str(),
		dex: m.stat_dex(),
		con: m.stat_con(),
		int: m.stat_int(),
		wis: m.stat_wis(),
		cha: m.stat_cha(),
	}
}

export type StatLabels = ReturnType<typeof buildStatLabels>;

export function statLabel(stat: string, statLabelsLocal: StatLabels) {
	return statLabelsLocal?.[stat as keyof StatLabels] ?? stat;
}