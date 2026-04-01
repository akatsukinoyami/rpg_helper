import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, games } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const userId = locals.user!.id;

	const game = await db
		.select({ id: games.id, name: games.name })
		.from(games)
		.where(eq(games.id, params.id))
		.limit(1)
		.then((r) => r[0]);

	if (!game) error(404);

	// Redirect if already has a character
	const existing = await db
		.select({ id: characters.id })
		.from(characters)
		.where(and(eq(characters.gameId, params.id), eq(characters.userId, userId)))
		.limit(1);

	if (existing.length > 0) redirect(303, `/games/${params.id}`);

	const allRaces = await db.query.races.findMany({
		with: {
			raceSkills: {
				with: { skill: true }
			}
		}
	});

	return { game, races: allRaces };
};
