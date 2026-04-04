import { redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const userId = locals.user!.id;

	const [own] = await db
		.select({ id: characters.id })
		.from(characters)
		.where(and(eq(characters.gameId, params.id), eq(characters.userId, userId)))
		.limit(1);

	if (own) redirect(302, `/games/${params.id}/characters/${own.id}`);

	return {};
};
