import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characterVisibility, games } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const userId = locals.user!.id;

	const game = await db.query.games.findFirst({
		where: eq(games.id, params.id),
		with: {
			characters: {
				with: {
					user: { columns: { id: true, name: true } },
					race: { columns: { id: true, name: true } }
				}
			}
		},
		columns: { id: true, gmUserId: true }
	});

	const myCharacter = game?.characters.find((c) => c.userId === userId) ?? null;

	const visibilityGrants = myCharacter
		? await db
				.select()
				.from(characterVisibility)
				.where(eq(characterVisibility.visibleToCharacterId, myCharacter.id))
		: [];

	return { game, myCharacter, visibilityGrants };
};
