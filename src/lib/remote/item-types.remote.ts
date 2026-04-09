import { command, form, getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { itemTypes } from '$lib/server/db/schema';
import { assertGm, DeleteSchema } from './utils';

export const index = query(async () => {
	const { params } = getRequestEvent();

	return await db
		.select()
		.from(itemTypes)
		.where(eq(itemTypes.gameId, params.id!));
});

const imageField = v.optional(v.pipe(v.string(), v.trim()));

const ItemTypeCreateSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim())),
	image: imageField,
	trackingMode: v.picklist(['quantity', 'durability'] as const),
	weight: v.optional(v.pipe(v.string(), v.trim())),
	maxDurability: v.optional(
		v.pipe(
			v.string(),
			v.trim(),
			v.transform((v) => (v ? Number(v) : null))
		)
	)
});

export const create = form(ItemTypeCreateSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.insert(itemTypes).values({
		gameId,
		name: data.name,
		description: data.description || null,
		image: data.image || null,
		trackingMode: data.trackingMode,
		weight: data.weight || '0',
		maxDurability: data.trackingMode === 'durability' ? (data.maxDurability ?? null) : null
	});
	await index().refresh();
});

const ItemTypeEditSchema = v.object({
	id: v.pipe(v.string(), v.trim(), v.minLength(1)),
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim())),
	image: imageField,
	trackingMode: v.picklist(['quantity', 'durability'] as const),
	weight: v.optional(v.pipe(v.string(), v.trim())),
	maxDurability: v.optional(
		v.pipe(
			v.string(),
			v.trim(),
			v.transform((v) => (v ? Number(v) : null))
		)
	)
});

export const edit = form(ItemTypeEditSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db
		.update(itemTypes)
		.set({
			name: data.name,
			description: data.description || null,
			image: data.image || null,
			trackingMode: data.trackingMode,
			weight: data.weight || '0',
			maxDurability: data.trackingMode === 'durability' ? (data.maxDurability ?? null) : null
		})
		.where(and(eq(itemTypes.id, data.id), eq(itemTypes.gameId, gameId)));

	await index().refresh();
});

export const remove = command(DeleteSchema, async ({ id }: { id: string }) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.delete(itemTypes).where(and(eq(itemTypes.id, id), eq(itemTypes.gameId, gameId)));
	await index().refresh();
});
