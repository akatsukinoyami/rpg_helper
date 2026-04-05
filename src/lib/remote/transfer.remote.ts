import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { eq } from 'drizzle-orm';
import yaml from 'js-yaml';
import { db } from '$lib/server/db';
import { games, races, skillTypes, itemTypes, locations } from '$lib/server/db/schema';
import { assertGm } from './utils';



// ── Serialisation ──────────────────────────────────────────────────────────────

function serializeRaces(rows: (typeof races.$inferSelect)[]) {
  return rows.map((r) => ({
    name: r.name,
    ...(r.description ? { description: r.description } : {}),
    baseStats: r.baseStats
  }));
}

function serializeSkillTypes(rows: (typeof skillTypes.$inferSelect)[]) {
  return rows.map((r) => ({
    name: r.name,
    ...(r.description ? { description: r.description } : {})
  }));
}

function serializeItemTypes(rows: (typeof itemTypes.$inferSelect)[]) {
  return rows.map((r) => ({
    name: r.name,
    ...(r.description ? { description: r.description } : {}),
    trackingMode: r.trackingMode,
    weight: r.weight,
    ...(r.maxDurability != null ? { maxDurability: r.maxDurability } : {})
  }));
}

type LocationNode = {
  name: string;
  description?: string;
  hidden: boolean;
  children: LocationNode[];
};

function buildLocationTree(rows: (typeof locations.$inferSelect)[]): LocationNode[] {
  const nodes = new Map<string, LocationNode>();
  const parentIds = new Map<string, string | null>();

  for (const l of rows) {
    nodes.set(l.id, {
      name: l.name,
      ...(l.description ? { description: l.description } : {}),
      hidden: l.hidden,
      children: []
    });
    parentIds.set(l.id, l.parentId);
  }

  const roots: LocationNode[] = [];
  for (const [id, node] of nodes) {
    const parentId = parentIds.get(id);
    if (parentId && nodes.has(parentId)) {
      nodes.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
// ── Commands ───────────────────────────────────────────────────────────────────

const SectionSchema = v.object({
	section: v.picklist(['all', 'races', 'skillTypes', 'itemTypes', 'locations'])
});

export const exportSection = command(
	SectionSchema,
	async ({ section }: { section: 'all' | 'races' | 'skillTypes' | 'itemTypes' | 'locations' }) => {
		const { params } = getRequestEvent();
		const gameId = params.id!;
		await assertGm(gameId);

		const [gameRow] = await db
			.select({ name: games.name, description: games.description })
			.from(games)
			.where(eq(games.id, gameId))
			.limit(1);

		const all = section === 'all';
		const data: Record<string, unknown> = {};

		if (all) {
			data.game = {
				name: gameRow.name,
				...(gameRow.description ? { description: gameRow.description } : {})
			};
		}
		if (all || section === 'races') {
			const rows = await db.select().from(races).where(eq(races.gameId, gameId));
			data.races = serializeRaces(rows);
		}
		if (all || section === 'skillTypes') {
			const rows = await db.select().from(skillTypes).where(eq(skillTypes.gameId, gameId));
			data.skillTypes = serializeSkillTypes(rows);
		}
		if (all || section === 'itemTypes') {
			const rows = await db.select().from(itemTypes).where(eq(itemTypes.gameId, gameId));
			data.itemTypes = serializeItemTypes(rows);
		}
		if (all || section === 'locations') {
			const rows = await db.select().from(locations).where(eq(locations.gameId, gameId));
			data.locations = buildLocationTree(rows);
		}

		const slug = gameRow.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
		const suffix = section === 'all' ? 'export' : section;
		const filename = `${slug}-${suffix}.yaml`;

		return { yaml: yaml.dump(data, { indent: 2, noRefs: true }), filename };
	}
);

