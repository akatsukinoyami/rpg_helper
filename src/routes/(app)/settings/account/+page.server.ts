import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user as UserTable } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {  
	const userId = locals.user!.id;

  const [user] = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.id, userId))
    .limit(1);

  return { user };
};
