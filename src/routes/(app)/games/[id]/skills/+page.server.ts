import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { skillTypes } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const skills = await db.query.skillTypes.findMany({
		where: eq(skillTypes.gameId, params.id)
	});

	return { skills };
};
