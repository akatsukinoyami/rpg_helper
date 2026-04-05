import { and, eq, inArray, ne, notInArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, games } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	const gmGames = await db.select().from(games).where(eq(games.gmUserId, userId));

	const playerCharacters = await db
		.select({ gameId: characters.gameId })
		.from(characters)
		.where(eq(characters.userId, userId));

	const playerGameIds = playerCharacters
		.map((c) => c.gameId)
		.filter((id) => !gmGames.find((g) => g.id === id));

	const playerGames =
		playerGameIds.length > 0
			? await db
					.select()
					.from(games)
					.where(and(inArray(games.id, playerGameIds), ne(games.gmUserId, userId)))
			: [];

	const myGameIds = [...gmGames.map((g) => g.id), ...playerGameIds];

	const otherGames =
		myGameIds.length > 0
			? await db.select().from(games).where(notInArray(games.id, myGameIds))
			: await db.select().from(games);

	return { gmGames, playerGames, otherGames };
};
