import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { gameId } = await parent();
	
	redirect(302, `/games/${gameId}/locations`);
};
