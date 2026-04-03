import { command, form, getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { skillTypes } from '$lib/server/db/schema';
import { assertGm, DeleteSchema } from './utils';

export const index = query(async () => {
	const { params } = getRequestEvent();
	
	return await db
		.select()
		.from(skillTypes)
		.where(eq(skillTypes.gameId, params.id));
});

const SkillTypeCreateSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim()))
});

export const create = form(SkillTypeCreateSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.insert(skillTypes).values({
		gameId,
		name: data.name,
		description: data.description || null
	});
	await index().refresh();
});

const SkillTypeEditSchema = v.object({
	id: v.pipe(v.string(), v.trim(), v.minLength(1)),
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim()))
});

export const edit = form(SkillTypeEditSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db
		.update(skillTypes)
		.set({
			name: data.name,
			description: data.description || null
		})
		.where(and(eq(skillTypes.id, data.id), eq(skillTypes.gameId, gameId)));
	await index().refresh();	
});

export const remove = command(DeleteSchema, async ({ id }: { id: string }) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db
		.delete(skillTypes)
		.where(and(eq(skillTypes.id, id), eq(skillTypes.gameId, gameId)));
	await index().refresh();
});
