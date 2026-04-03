import { command, form, getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { locations } from '$lib/server/db/schema';
import { assertGm, DeleteSchema } from './utils';

export const index = query(async () => {
	const { params } = getRequestEvent();

	return await db
		.select()
		.from(locations)
		.where(eq(locations.gameId, params.id));
});

const LocationCreateSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim()))
});

export const create = form(LocationCreateSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.insert(locations).values({
		gameId,
		name: data.name,
		description: data.description || null
	});
	await index().refresh();
});

const LocationEditSchema = v.object({
	id: v.pipe(v.string(), v.trim(), v.minLength(1)),
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim()))
});

export const edit = form(LocationEditSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db
		.update(locations)
		.set({
			name: data.name,
			description: data.description || null
		})
		.where(and(eq(locations.id, data.id), eq(locations.gameId, gameId)));
	await index().refresh();
});

export const remove = command(DeleteSchema, async ({ id }: { id: string }) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.delete(locations).where(and(eq(locations.id, id), eq(locations.gameId, gameId)));
	await index().refresh();
});
