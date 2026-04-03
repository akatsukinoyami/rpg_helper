import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { games } from "$lib/server/db/schema";

export async function isGm(gameId: string, userId: string = '') {
  let usedUserId = userId;
  if (!usedUserId) {
    const { locals } = getRequestEvent();
    usedUserId = locals.user!.id;
  }

  const [game] = await db
    .select({ gmUserId: games.gmUserId })
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1);

	return game?.gmUserId === usedUserId;
};

export async function assertGm(gameId: string, userId: string = '') {
  if (!(await isGm(gameId, userId))) error(403);
}
