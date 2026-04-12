import type { StatDef } from '$lib/server/db/schema';

/**
 * Build a flat map of field key → display label for all stat defs.
 * For vital stats (isVital=true) both the current key and the "max<Key>" variant are included.
 */
export function buildStatOptions(defs: StatDef[]): Record<string, string> {
	const options: Record<string, string> = {};
	for (const def of defs) {
		options[def.key] = def.label;
		if (def.isVital) {
			const maxKey = `max${def.key[0].toUpperCase()}${def.key.slice(1)}`;
			options[maxKey] = `Max ${def.label}`;
		}
	}
	return options;
}

export function statLabel(field: string, defs: StatDef[]): string {
	return buildStatOptions(defs)[field] ?? field;
}
