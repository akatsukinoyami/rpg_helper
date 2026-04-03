import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { itemTypes } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const items = await db.query.itemTypes.findMany({
		where: eq(itemTypes.gameId, params.id)
	});

	return { items };
};
