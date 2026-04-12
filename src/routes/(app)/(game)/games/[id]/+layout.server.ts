import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, games } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const userId = locals.user!.id;

	const game = await db.query.games.findFirst({
		where: eq(games.id, params.id),
		with: { gm: { columns: { id: true, name: true } } },
		columns: {
			id: true,
			name: true,
			description: true,
			image: true,
			gmUserId: true,
			statDefs: true
		}
	});

	if (!game) error(404);

	const [myChar] = await db
		.select({ id: characters.id })
		.from(characters)
		.where(and(eq(characters.gameId, params.id), eq(characters.userId, userId)))
		.limit(1);

	return {
		gameId: params.id,
		game,
		isGm: game.gmUserId === userId,
		userId,
		myCharacterId: myChar?.id ?? null
	};
};
