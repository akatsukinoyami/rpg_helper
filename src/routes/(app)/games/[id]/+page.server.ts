import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, games } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

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

	return { game, isGm, myCharacter };
};

const assertGm = async (gameId: string, userId: string) => {
	const [game] = await db
		.select({ gmUserId: games.gmUserId })
		.from(games)
		.where(eq(games.id, gameId))
		.limit(1);

	if (!game || game.gmUserId !== userId) return false;
	return true;
};

export const actions: Actions = {
	approve: async ({ locals, params, request }) => {
		if (!(await assertGm(params.id, locals.user!.id))) return fail(403);

		const form = await request.formData();
		const characterId = form.get('characterId') as string;

		await db
			.update(characters)
			.set({ status: 'approved' })
			.where(and(eq(characters.id, characterId), eq(characters.gameId, params.id)));
	},

	reject: async ({ locals, params, request }) => {
		if (!(await assertGm(params.id, locals.user!.id))) return fail(403);

		const form = await request.formData();
		const characterId = form.get('characterId') as string;

		await db
			.update(characters)
			.set({ status: 'rejected' })
			.where(and(eq(characters.id, characterId), eq(characters.gameId, params.id)));
	},

	transfer: async ({ locals, params, request }) => {
		if (!(await assertGm(params.id, locals.user!.id))) return fail(403);

		const form = await request.formData();
		const newGmUserId = form.get('newGmUserId') as string;

		const [character] = await db
			.select({ id: characters.id })
			.from(characters)
			.where(and(eq(characters.userId, newGmUserId), eq(characters.gameId, params.id)))
			.limit(1);

		if (!character) return fail(400, { transferError: 'user_not_in_game' });

		await db.update(games).set({ gmUserId: newGmUserId }).where(eq(games.id, params.id));
	}
};
