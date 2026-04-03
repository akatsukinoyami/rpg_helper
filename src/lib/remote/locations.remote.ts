import { command, form, getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { locations } from '$lib/server/db/schema';
import { assertGm, DeleteSchema } from './utils';

export const index = query(
	v.optional(v.pipe(v.string(), v.trim(), v.minLength(1))),
	async (id) => {
		const { params } = getRequestEvent();
		const gameId = params.id!;

		if (!id) {
			const children = await db
				.select()
				.from(locations)
				.where(and(eq(locations.gameId, gameId), isNull(locations.parentId)));
			return { id: null, name: null, description: null, children };
		}

		const [location] = await db
			.select()
			.from(locations)
			.where(and(eq(locations.id, id), eq(locations.gameId, gameId)));

		if (!location) return null;

		const children = await db
			.select()
			.from(locations)
			.where(and(eq(locations.parentId, id), eq(locations.gameId, gameId)));

		return { ...location, children };
	}
);

export const all = query(async () => {
	const { params } = getRequestEvent();

	return await db
		.select()
		.from(locations)
		.where(eq(locations.gameId, params.id!));
});

const LocationCreateSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim())),
	parentId: v.optional(v.pipe(v.string(), v.trim()))
});

export const create = form(LocationCreateSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.insert(locations).values({
		gameId,
		name: data.name,
		description: data.description || null,
		parentId: data.parentId || null
	});
	await index().refresh();
	if (data.parentId) await index(data.parentId).refresh();
	await all().refresh();
});

const LocationEditSchema = v.object({
	id: v.pipe(v.string(), v.trim(), v.minLength(1)),
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim())),
	parentId: v.optional(v.pipe(v.string(), v.trim()))
});

export const edit = form(LocationEditSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db
		.update(locations)
		.set({
			name: data.name,
			description: data.description || null,
			parentId: data.parentId || null
		})
		.where(and(eq(locations.id, data.id), eq(locations.gameId, gameId)));
	await index().refresh();
	await index(data.id).refresh();
	if (data.parentId) await index(data.parentId).refresh();
	await all().refresh();
});

export const remove = command(DeleteSchema, async ({ id }: { id: string }) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.delete(locations).where(and(eq(locations.id, id), eq(locations.gameId, gameId)));
	await index().refresh();
	await all().refresh();
});
