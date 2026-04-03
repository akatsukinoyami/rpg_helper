import { command, form, getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { games, itemTypes } from '$lib/server/db/schema';

const assertGm = async (gameId: string) => {
	const { locals } = getRequestEvent();
	const userId = locals.user!.id;
	const [game] = await db.select({ gmUserId: games.gmUserId }).from(games).where(eq(games.id, gameId)).limit(1);
	if (!game || game.gmUserId !== userId) error(403);
};

const ItemTypeSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim())),
	trackingMode: v.picklist(['quantity', 'durability'] as const),
	weight: v.optional(v.pipe(v.string(), v.trim())),
	maxDurability: v.optional(v.pipe(v.string(), v.trim(), v.transform((v) => (v ? Number(v) : null))))
});

export const createItemType = form(ItemTypeSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.insert(itemTypes).values({
		gameId,
		name: { en: data.name },
		description: data.description ? { en: data.description } : null,
		trackingMode: data.trackingMode,
		weight: data.weight || '0',
		maxDurability: data.trackingMode === 'durability' ? (data.maxDurability ?? null) : null
	});

	redirect(303, `/games/${gameId}/items`);
});

export const editItemType = form(ItemTypeSchema, async (data) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	const itemTypeId = params.itemId!;
	await assertGm(gameId);

	await db
		.update(itemTypes)
		.set({
			name: { en: data.name },
			description: data.description ? { en: data.description } : null,
			trackingMode: data.trackingMode,
			weight: data.weight || '0',
			maxDurability: data.trackingMode === 'durability' ? (data.maxDurability ?? null) : null
		})
		.where(and(eq(itemTypes.id, itemTypeId), eq(itemTypes.gameId, gameId)));

	redirect(303, `/games/${gameId}/items`);
});

export const deleteItemType = command(async ({ itemTypeId }: { itemTypeId: string }) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	await db.delete(itemTypes).where(and(eq(itemTypes.id, itemTypeId), eq(itemTypes.gameId, gameId)));
});
