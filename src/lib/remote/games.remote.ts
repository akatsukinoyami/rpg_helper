import { command, form, getRequestEvent, query } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, games, locations, type StatDef } from '$lib/server/db/schema';
import { broadcast } from '$lib/server/ws/adapter';
import { importGameYaml } from '$lib/server/game-import';
import { assertGm } from '$lib/remote/utils';

const GameBaseSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim())),
	image: v.optional(v.pipe(v.string(), v.trim())),
	yaml: v.optional(v.string()),
	statDefsJson: v.pipe(
		v.optional(v.string(), '[]'),
		v.transform((s): StatDef[] => { try { return JSON.parse(s); } catch { return []; } })
	)
});

export const create = form(GameBaseSchema, async (data) => {
	const { locals } = getRequestEvent();
	const userId = locals.user!.id;

	const [game] = await db
		.insert(games)
		.values({
			name: data.name,
			description: data.description || null,
			image: data.image || null,
			gmUserId: userId,
			statDefs: data.statDefsJson
		})
		.returning({ id: games.id });

	let importedLocations = 0;
	const yamlText = data.yaml?.trim();
	if (yamlText) {
		try {
			const counts = await importGameYaml(game.id, yamlText);
			importedLocations = counts.locations;
		} catch {
			// invalid YAML — game is still created, import skipped
		}
	}

	// Only create the default root location if YAML didn't bring its own
	if (!importedLocations) {
		await db.insert(locations).values({
			gameId: game.id,
			name: data.name,
			parentId: null
		});
	}

	redirect(303, `/games/${game.id}`);
});

export const edit = form(GameBaseSchema, async (data) => {
	const { locals, params } = getRequestEvent();
	const userId = locals.user!.id;
	const gameId = params.id!;

	const [game] = await db
		.select({ gmUserId: games.gmUserId })
		.from(games)
		.where(eq(games.id, gameId))
		.limit(1);

	if (!game || game.gmUserId !== userId) error(403);

	const [updated] = await db
		.update(games)
		.set({ name: data.name, description: data.description || null, image: data.image || null })
		.where(eq(games.id, gameId))
		.returning({ name: games.name, description: games.description, image: games.image });

	await db
		.update(locations)
		.set({ name: data.name })
		.where(and(eq(locations.gameId, gameId), isNull(locations.parentId)));

	broadcast(gameId!, { type: 'game:updated', payload: updated });

	const yamlText = data.yaml?.trim();
	if (yamlText) {
		await importGameYaml(gameId, yamlText);
	}

	redirect(303, `/games/${gameId}`);
});

const TransferSchema = v.object({ newGmUserId: v.pipe(v.string(), v.minLength(1)) });

export const transfer = form(TransferSchema, async (data) => {
	const { locals, params } = getRequestEvent();
	const userId = locals.user!.id;
	const gameId = params.id!;

	const [game] = await db
		.select({ gmUserId: games.gmUserId })
		.from(games)
		.where(eq(games.id, gameId))
		.limit(1);

	if (!game || game.gmUserId !== userId) return { transferError: 'forbidden' as const };

	const [character] = await db
		.select({ id: characters.id })
		.from(characters)
		.where(and(eq(characters.userId, data.newGmUserId), eq(characters.gameId, gameId)))
		.limit(1);

	if (!character) return { transferError: 'user_not_in_game' as const };

	await db.update(games).set({ gmUserId: data.newGmUserId }).where(eq(games.id, gameId));
});

// ---------------------------------------------------------------------------
// Stat definitions
// ---------------------------------------------------------------------------

export const statDefs = query(async () => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	const [game] = await db
		.select({ statDefs: games.statDefs })
		.from(games)
		.where(eq(games.id, gameId))
		.limit(1);
	return game?.statDefs ?? [];
});

const StatDefSchema = v.object({
	key: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(50), v.regex(/^[a-zA-Z][a-zA-Z0-9]*$/, 'Key must be alphanumeric starting with a letter')),
	label: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100)),
	isVital: v.boolean(),
	color: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(20)),
	sortOrder: v.number()
});

export const addStatDef = command(StatDefSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	const [game] = await db.select({ statDefs: games.statDefs }).from(games).where(eq(games.id, gameId)).limit(1);
	if (!game) error(404);

	const existing = (game.statDefs ?? []) as StatDef[];
	if (existing.some((d) => d.key === data.key)) error(400, 'Stat key already exists');

	const newDef: StatDef = { key: data.key, label: data.label, isVital: data.isVital, color: data.color, sortOrder: data.sortOrder };
	await db.update(games).set({ statDefs: [...existing, newDef] }).where(eq(games.id, gameId));
	await statDefs().refresh();
});

const EditStatDefSchema = v.object({
	key: v.pipe(v.string(), v.trim(), v.minLength(1)),
	label: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100)),
	color: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(20)),
	sortOrder: v.number()
});

export const editStatDef = command(EditStatDefSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	const [game] = await db.select({ statDefs: games.statDefs }).from(games).where(eq(games.id, gameId)).limit(1);
	if (!game) error(404);

	const existing = (game.statDefs ?? []) as StatDef[];
	const updated = existing.map((d) =>
		d.key === data.key ? { ...d, label: data.label, color: data.color, sortOrder: data.sortOrder } : d
	);
	await db.update(games).set({ statDefs: updated }).where(eq(games.id, gameId));
	await statDefs().refresh();
});

export const removeStatDef = command(
	v.object({ key: v.pipe(v.string(), v.trim(), v.minLength(1)) }),
	async ({ key }) => {
		const { params } = getRequestEvent();
		const gameId = params.id!;
		await assertGm(gameId);

		// Guard: reject if any character already has values for this key
		const [inUse] = await db
			.select({ id: characters.id })
			.from(characters)
			.where(and(eq(characters.gameId, gameId), sql`(vitals ? ${key} OR stats ? ${key})`))
			.limit(1);
		if (inUse) error(400, 'Stat is in use by one or more characters');

		const [game] = await db.select({ statDefs: games.statDefs }).from(games).where(eq(games.id, gameId)).limit(1);
		if (!game) error(404);

		const updated = (game.statDefs ?? [] as StatDef[]).filter((d: StatDef) => d.key !== key);
		await db.update(games).set({ statDefs: updated }).where(eq(games.id, gameId));
		await statDefs().refresh();
	}
);
