import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import yaml from 'js-yaml';
import { db } from '$lib/server/db';
import { races, skillTypes, itemTypes, locations } from '$lib/server/db/schema';
import type { Stats } from '$lib/server/db/schema';

// ── Schemas ────────────────────────────────────────────────────────────────────

const numStat = v.pipe(v.number(), v.integer(), v.minValue(0));

const RaceNodeSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.string()),
	baseStats: v.object({
		str: numStat,
		dex: numStat,
		con: numStat,
		int: numStat,
		wis: numStat,
		cha: numStat
	})
});

const SkillTypeNodeSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.string())
});

const ItemTypeNodeSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.string()),
	trackingMode: v.picklist(['quantity', 'durability'] as const),
	weight: v.optional(v.string()),
	maxDurability: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)))
});

interface LocationInput {
	name: string;
	description?: string;
	hidden?: boolean;
	children?: LocationInput[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LocationNodeSchema: v.BaseSchema<unknown, LocationInput, v.BaseIssue<unknown>> = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.string()),
	hidden: v.optional(v.boolean()),
	children: v.optional(v.lazy(() => v.array(LocationNodeSchema)))
});

export const GameDataSchema = v.object({
	game: v.optional(
		v.object({
			name: v.optional(v.string()),
			description: v.optional(v.string())
		})
	),
	races: v.optional(v.array(RaceNodeSchema)),
	skillTypes: v.optional(v.array(SkillTypeNodeSchema)),
	itemTypes: v.optional(v.array(ItemTypeNodeSchema)),
	locations: v.optional(v.array(LocationNodeSchema))
});

// ── Helpers ────────────────────────────────────────────────────────────────────

async function insertLocations(
	nodes: LocationInput[],
	gameId: string,
	parentId: string | null = null
): Promise<number> {
	let count = 0;
	for (const node of nodes) {
		const [inserted] = await db
			.insert(locations)
			.values({
				gameId,
				parentId,
				name: node.name,
				description: node.description || null,
				hidden: node.hidden ?? false
			})
			.returning({ id: locations.id });
		count++;
		if (node.children?.length) {
			count += await insertLocations(node.children, gameId, inserted.id);
		}
	}
	return count;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export type ImportCounts = {
	races: number;
	skillTypes: number;
	itemTypes: number;
	locations: number;
};

export async function importGameYaml(gameId: string, yamlText: string): Promise<ImportCounts> {
	let parsed: unknown;
	try {
		parsed = yaml.load(yamlText);
	} catch {
		error(400, 'Invalid YAML');
	}

	const result = v.safeParse(GameDataSchema, parsed);
	if (!result.success) {
		error(400, `Invalid data: ${result.issues.map((i) => i.message).join(', ')}`);
	}

	const d = result.output;
	const counts: ImportCounts = { races: 0, skillTypes: 0, itemTypes: 0, locations: 0 };

	if (d.races?.length) {
		await db.insert(races).values(
			d.races.map((r) => ({
				gameId,
				name: r.name,
				description: r.description || null,
				image: null,
				baseStats: r.baseStats as Stats
			}))
		);
		counts.races = d.races.length;
	}
	if (d.skillTypes?.length) {
		await db.insert(skillTypes).values(
			d.skillTypes.map((s) => ({
				gameId,
				name: s.name,
				description: s.description || null,
				image: null
			}))
		);
		counts.skillTypes = d.skillTypes.length;
	}
	if (d.itemTypes?.length) {
		await db.insert(itemTypes).values(
			d.itemTypes.map((it) => ({
				gameId,
				name: it.name,
				description: it.description || null,
				image: null,
				trackingMode: it.trackingMode,
				weight: it.weight ?? '0',
				maxDurability: it.maxDurability ?? null
			}))
		);
		counts.itemTypes = d.itemTypes.length;
	}
	if (d.locations?.length) {
		counts.locations = await insertLocations(d.locations, gameId);
	}

	return counts;
}
