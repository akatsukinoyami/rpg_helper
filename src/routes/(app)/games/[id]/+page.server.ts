import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characterVisibility, games } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const userId = locals.user!.id;

	const game = await db.query.games.findFirst({
		where: eq(games.id, params.id),
		with: {
			gm: { columns: { id: true, name: true } },
			characters: {
				with: {
					user: { columns: { id: true, name: true } },
					race: { columns: { id: true, name: true } }
				}
			}
		}
	});

	if (!game) error(404);

	const isGm = game.gmUserId === userId;
	const myCharacter = game.characters.find((c) => c.userId === userId) ?? null;

	const visibilityGrants = myCharacter
		? await db
				.select()
				.from(characterVisibility)
				.where(eq(characterVisibility.visibleToCharacterId, myCharacter.id))
		: [];

	return { game, isGm, myCharacter, visibilityGrants };
};
