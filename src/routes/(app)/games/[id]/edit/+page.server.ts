import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { games } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const game = await db
		.select()
		.from(games)
		.where(eq(games.id, params.id))
		.limit(1)
		.then((r) => r[0]);

	if (!game) error(404);
	if (game.gmUserId !== locals.user!.id) error(403);

	return { game };
};

export const actions: Actions = {
	default: async ({ locals, params, request }) => {
		const game = await db
			.select({ gmUserId: games.gmUserId })
			.from(games)
			.where(eq(games.id, params.id))
			.limit(1)
			.then((r) => r[0]);

		if (!game || game.gmUserId !== locals.user!.id) error(403);

		const form = await request.formData();
		const name = (form.get('name') as string)?.trim();
		const description = (form.get('description') as string)?.trim() || null;
		const image = ((form.get('image') as string) || '').trim() || null;

		if (!name) return fail(400, { error: 'name_required' });

		await db.update(games).set({ name, description, image }).where(eq(games.id, params.id));

		redirect(303, `/games/${params.id}`);
	}
};
