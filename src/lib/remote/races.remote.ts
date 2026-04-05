import { command, form, getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { races } from '$lib/server/db/schema';
import type { Stats } from '$lib/server/db/schema';
import { assertGm, DeleteSchema } from './utils';

export const index = query(async () => {
	const { params } = getRequestEvent();
	return await db.select().from(races).where(eq(races.gameId, params.id));
});

const numStat = v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(0));

const RaceSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim())),
	image: v.optional(v.pipe(v.string(), v.trim())),
	str: numStat,
	dex: numStat,
	con: numStat,
	int: numStat,
	wis: numStat,
	cha: numStat
});

const RaceEditSchema = v.object({
	id: v.pipe(v.string(), v.trim(), v.minLength(1)),
	...RaceSchema.entries
});

function buildStats(data: v.InferOutput<typeof RaceSchema>): Stats {
	return { str: data.str, dex: data.dex, con: data.con, int: data.int, wis: data.wis, cha: data.cha };
}

export const create = form(RaceSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);
	await db.insert(races).values({
		gameId,
		name: data.name,
		description: data.description || null,
		image: data.image || null,
		baseStats: buildStats(data)
	});
	await index().refresh();
});

export const edit = form(RaceEditSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);
	await db
		.update(races)
		.set({ name: data.name, description: data.description || null, image: data.image || null, baseStats: buildStats(data) })
		.where(and(eq(races.id, data.id), eq(races.gameId, gameId)));
	await index().refresh();
});

export const remove = command(DeleteSchema, async ({ id }: { id: string }) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);
	await db.delete(races).where(and(eq(races.id, id), eq(races.gameId, gameId)));
	await index().refresh();
});
