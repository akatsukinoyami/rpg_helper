import { command, form, getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { skillTypes } from '$lib/server/db/schema';
import { assertGm } from './utils';

const SkillTypeSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim()))
});

export const createSkillType = form(SkillTypeSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.insert(skillTypes).values({
		gameId,
		name: { en: data.name },
		description: data.description ? { en: data.description } : null
	});

	redirect(303, `/games/${gameId}/skills`);
});

export const editSkillType = form(SkillTypeSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	const skillTypeId = params.skillId!;
	await assertGm(gameId);

	await db
		.update(skillTypes)
		.set({
			name: { en: data.name },
			description: data.description ? { en: data.description } : null
		})
		.where(and(eq(skillTypes.id, skillTypeId), eq(skillTypes.gameId, gameId)));

	redirect(303, `/games/${gameId}/skills`);
});

export const deleteSkillType = command(async ({ skillTypeId }: { skillTypeId: string }) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.delete(skillTypes).where(and(eq(skillTypes.id, skillTypeId), eq(skillTypes.gameId, gameId)));
});
