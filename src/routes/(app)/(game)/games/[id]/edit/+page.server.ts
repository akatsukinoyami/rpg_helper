import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, games } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const game = await db
		.select()
		.from(games)
		.where(eq(games.id, params.id))
		.limit(1)
		.then((r) => r[0]);

	if (!game) error(404);
	if (game.gmUserId !== locals.user!.id) error(403);

	const players = await db.query.characters.findMany({
		where: eq(characters.gameId, params.id),
		with: { user: { columns: { id: true, name: true } } },
		columns: { id: true, userId: true }
	});

	const otherPlayers = players.filter(
		(c) => c.userId !== game.gmUserId && c.userId !== locals.user!.id
	);

	return { game, otherPlayers };
};
