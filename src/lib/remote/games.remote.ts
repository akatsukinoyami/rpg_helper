import { form, getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, games, locations } from '$lib/server/db/schema';
import { broadcast } from '$lib/server/ws/adapter';
import { importGameYaml } from '$lib/server/game-import';

const GameBaseSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	description: v.optional(v.pipe(v.string(), v.trim())),
	image: v.optional(v.pipe(v.string(), v.trim())),
	yaml: v.optional(v.string())
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
			gmUserId: userId
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
		.returning({
			name: games.name,
			description: games.description,
			image: games.image,
			hpLabel: games.hpLabel,
			mpLabel: games.mpLabel
		});

	await db
		.update(locations)
		.set({ name: data.name })
		.where(and(eq(locations.gameId, gameId), eq(locations.parentId, null)));

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
	const gameId = params.id;

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
