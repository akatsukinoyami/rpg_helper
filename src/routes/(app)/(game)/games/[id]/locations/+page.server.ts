import { redirect, error } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { locations } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [root] = await db
		.select({ id: locations.id })
		.from(locations)
		.where(and(eq(locations.gameId, params.id), isNull(locations.parentId)))
		.limit(1);

	if (!root) error(404, 'No locations found for this game');

	redirect(302, `/games/${params.id}/locations/${root.id}`);
};
