import { type StatDef } from '../schema';

export const BASE_STATS: StatDef[] = [
	{ key: 'str', label: 'Сила', isVital: false, color: '#f97316', sortOrder: 3 },
	{ key: 'dex', label: 'Ловкость', isVital: false, color: '#22c55e', sortOrder: 4 },
	{ key: 'con', label: 'Телосложение', isVital: false, color: '#eab308', sortOrder: 5 },
	{ key: 'int', label: 'Интеллект', isVital: false, color: '#a855f7', sortOrder: 6 },
	{ key: 'wis', label: 'Мудрость', isVital: false, color: '#14b8a6', sortOrder: 7 },
	{ key: 'cha', label: 'Харизма', isVital: false, color: '#ec4899', sortOrder: 8 }
];
