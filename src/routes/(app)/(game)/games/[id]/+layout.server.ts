import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { games } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const userId = locals.user!.id;

	const game = await db.query.games.findFirst({
		where: eq(games.id, params.id),
		with: { gm: { columns: { id: true, name: true } } },
		columns: { id: true, name: true, description: true, image: true, gmUserId: true }
	});

	if (!game) error(404);

	return {
		gameId: params.id,
		game,
		isGm: game.gmUserId === userId,
		userId
	};
};
