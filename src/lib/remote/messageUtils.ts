import { sql, eq } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { messages } from '$lib/server/db/schema';
import { broadcast } from '$lib/server/ws/adapter';
import type * as schema from '$lib/server/db/schema';

type AnyTx = PgTransaction<
	PostgresJsQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;

/** Compute next per-location message ID inside an existing transaction with advisory lock. */
export async function nextMessageId(locationId: string, tx: AnyTx): Promise<number> {
	await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${locationId}))`);
	const [row] = await tx
		.select({ max: sql<number>`COALESCE(MAX(${messages.id}), 0)` })
		.from(messages)
		.where(eq(messages.locationId, locationId));
	return (row?.max ?? 0) + 1;
}

/** Insert a system message (no content) with per-location counter. Returns { locationId, id, ref }. */
export async function insertSystemMessage(locationId: string, characterId: string) {
	return await db.transaction(async (tx) => {
		const id = await nextMessageId(locationId, tx);
		const [msg] = await tx
			.insert(messages)
			.values({ locationId, id, characterId })
			.returning({ locationId: messages.locationId, id: messages.id, ref: messages.ref });
		return msg;
	});
}

/** Broadcast message:created event for a system message (no content). */
export function broadcastSystemMessage(
	gameId: string,
	messageRef: string,
	locationId: string,
	characterId: string
) {
	broadcast(gameId, {
		type: 'message:created',
		payload: {
			messageId: messageRef,
			locationId,
			characterId,
			content: null,
			createdAt: new Date().toISOString()
		}
	});
}
