import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characterSkills, characters, games, races } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

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

export const actions: Actions = {
	default: async ({ locals, params, request }) => {
		const userId = locals.user!.id;

		const game = await db
			.select({ gmUserId: games.gmUserId })
			.from(games)
			.where(eq(games.id, params.id))
			.limit(1)
			.then((r) => r[0]);

		if (!game) error(404);

		const character = await db
			.select()
			.from(characters)
			.where(and(eq(characters.id, params.charId), eq(characters.gameId, params.id)))
			.limit(1)
			.then((r) => r[0]);

		if (!character) error(404);

		const isGm = game.gmUserId === userId;
		const isOwner = character.userId === userId;

		if (!isGm && !isOwner) error(403);

		const form = await request.formData();
		const name = (form.get('name') as string | null)?.trim() ?? '';
		const gender = form.get('gender') as 'male' | 'female' | 'none' | 'both';
		const raceId = (form.get('raceId') as string | null) || null;
		const ageRaw = form.get('age') as string | null;
		const age = ageRaw ? parseInt(ageRaw) : null;
		const image = ((form.get('image') as string) || '').trim() || null;
		const bodyDescription = (form.get('bodyDescription') as string | null)?.trim() || null;
		const prehistory = (form.get('prehistory') as string | null)?.trim() || null;

		if (!name) return fail(400, { error: 'name_required' });

		// Recalculate stats and skills if race changed
		if (raceId !== character.raceId) {
			let stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
			let skillIds: string[] = [];

			if (raceId) {
				const race = await db.query.races.findFirst({
					where: eq(races.id, raceId),
					with: { raceSkills: true }
				});
				if (race) {
					stats = race.baseStats;
					skillIds = race.raceSkills.map((rs) => rs.skillId);
				}
			}

			await db.delete(characterSkills).where(eq(characterSkills.characterId, params.charId));

			if (skillIds.length > 0) {
				await db
					.insert(characterSkills)
					.values(skillIds.map((skillId) => ({ characterId: params.charId, skillId })));
			}

			await db
				.update(characters)
				.set({
					name,
					gender,
					raceId,
					age,
					image,
					bodyDescription,
					prehistory,
					stats,
					// Owner edits go back to pending; GM edits preserve status
					...(isOwner && !isGm ? { status: 'pending' as const } : {}),
					updatedAt: new Date()
				})
				.where(eq(characters.id, params.charId));
		} else {
			await db
				.update(characters)
				.set({
					name,
					gender,
					age,
					image,
					bodyDescription,
					prehistory,
					...(isOwner && !isGm ? { status: 'pending' as const } : {}),
					updatedAt: new Date()
				})
				.where(eq(characters.id, params.charId));
		}

		redirect(303, `/games/${params.id}`);
	}
};
