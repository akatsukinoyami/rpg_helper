import { fail, redirect } from '@sveltejs/kit';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, games } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

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

	return { gmGames, playerGames };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const userId = locals.user!.id;
		const form = await request.formData();
		const name = (form.get('name') as string)?.trim();
		const description = (form.get('description') as string)?.trim() || null;

		if (!name) return fail(400, { error: 'name_required' });

		const [game] = await db
			.insert(games)
			.values({ name, description, gmUserId: userId })
			.returning({ id: games.id });

		redirect(303, `/games/${game.id}`);
	}
};
