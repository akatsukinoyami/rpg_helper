import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, games } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const userId = locals.user!.id;

	const game = await db
		.select({ id: games.id, name: games.name, gmUserId: games.gmUserId })
		.from(games)
		.where(eq(games.id, params.id))
		.limit(1)
		.then((r) => r[0]);

	if (!game) error(404);

	const character = await db.query.characters.findFirst({
		where: and(eq(characters.id, params.charId), eq(characters.gameId, params.id))
	});

	if (!character) error(404);

	const isGm = game.gmUserId === userId;
	const isOwner = character.userId === userId;

	if (!isGm && !isOwner) error(403);

	const allRaces = await db.query.races.findMany({
		with: { raceSkills: { with: { skill: true } } }
	});

	return { game, character, isGm, races: allRaces };
};
