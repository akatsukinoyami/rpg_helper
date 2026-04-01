import { command, getRequestEvent } from '$app/server';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import { characters, games } from '$lib/server/db/schema';

const CharacterInGame = v.object({
	gameId: v.string(),
	characterId: v.string()
});

const assertGm = async (gameId: string, userId: string) => {
	const [game] = await db
		.select({ gmUserId: games.gmUserId })
		.from(games)
		.where(eq(games.id, gameId))
		.limit(1);
	return game?.gmUserId === userId;
};

export const approve = command(CharacterInGame, async ({ gameId, characterId }) => {
	const { locals } = getRequestEvent();
	const userId = locals.user!.id;

	if (!(await assertGm(gameId, userId))) throw new Error('Forbidden');

	await db
		.update(characters)
		.set({ status: 'approved' })
		.where(and(eq(characters.id, characterId), eq(characters.gameId, gameId)));
});

export const reject = command(CharacterInGame, async ({ gameId, characterId }) => {
	const { locals } = getRequestEvent();
	const userId = locals.user!.id;

	if (!(await assertGm(gameId, userId))) throw new Error('Forbidden');

	await db
		.update(characters)
		.set({ status: 'rejected' })
		.where(and(eq(characters.id, characterId), eq(characters.gameId, gameId)));
});

export const deleteChar = command(CharacterInGame, async ({ gameId, characterId }) => {
	const { locals } = getRequestEvent();
	const userId = locals.user!.id;

	const [character] = await db
		.select({ userId: characters.userId })
		.from(characters)
		.where(and(eq(characters.id, characterId), eq(characters.gameId, gameId)))
		.limit(1);

	if (!character) throw new Error('Not found');

	const isGm = await assertGm(gameId, userId);
	const isOwner = character.userId === userId;

	if (!isGm && !isOwner) throw new Error('Forbidden');

	await db.delete(characters).where(eq(characters.id, characterId));
});
