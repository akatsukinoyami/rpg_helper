import { command, getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import { and, asc, desc, eq, isNull, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type * as schema from '$lib/server/db/schema';
import {
	characters,
	locations,
	messages,
	moves
} from '$lib/server/db/schema';
import { broadcast } from '$lib/server/ws/adapter';
import { assertGm, isGm } from '$lib/remote/utils';

type AnyTx = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

const replyMsg = alias(messages, 'reply_msg');
const replyChar = alias(characters, 'reply_char');
const fromLocation = alias(locations, 'from_location');
const toLocation = alias(locations, 'to_location');

/**
 * Correlated scalar subquery: returns the single system event attached to a message row,
 * or NULL for regular text/move messages. Uses UNION ALL + LIMIT 1 so PG short-circuits
 * on first match — no extra joins needed.
 */
const eventSubquery = sql<import('$lib/types').SystemEvent | null>`(
  SELECT json_build_object('type','diceRoll','id',dr.id,'expression',dr.expression,
    'rolls',dr.results->'dice','modifier',(dr.results->>'modifier')::int,'result',(dr.results->>'total')::int)
  FROM dice_rolls dr
  WHERE dr.message_location_id = ${messages.locationId} AND dr.message_id = ${messages.id}
  UNION ALL
  SELECT json_build_object('type','characterChange','id',sp.id,'stat',sp.field,
    'delta',sp.delta,'reason',sp.reason,'status',sp.status)
  FROM stat_proposals sp
  WHERE sp.message_location_id = ${messages.locationId} AND sp.message_id = ${messages.id}
  UNION ALL
  SELECT json_build_object('type','itemChange','id',ip.id,'charItemId',ip.char_item_id,
    'itemTypeId',ip.item_type_id,'deltaQty',ip.delta_qty,'deltaDur',ip.delta_dur,
    'reason',ip.reason,'status',ip.status)
  FROM item_proposals ip
  WHERE ip.message_location_id = ${messages.locationId} AND ip.message_id = ${messages.id}
  UNION ALL
  SELECT json_build_object('type','skillChange','id',skp.id,'skillTypeId',skp.skill_type_id,
    'action',skp.action,'reason',skp.reason,'status',skp.status)
  FROM skill_proposals skp
  WHERE skp.message_location_id = ${messages.locationId} AND skp.message_id = ${messages.id}
  LIMIT 1
)`;

/** 
 * @description Compute the next per-location message ID inside a transaction, using an advisory lock. 
 **/
async function nextMessageId(locationId: string, tx: AnyTx): Promise<number> {
	await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${locationId}))`);
	const [row] = await tx
		.select({ max: sql<number>`COALESCE(MAX(${messages.id}), 0)` })
		.from(messages)
		.where(eq(messages.locationId, locationId));
	return (row?.max ?? 0) + 1;
}

/** 
 * @description WHERE clause that matches a message by its ref string ("locationId#integer"). 
 **/
function whereRef(ref: string) {
	return and(
		eq(messages.locationId, sql`split_part(${ref}, '#', 1)`),
		eq(messages.id, sql`split_part(${ref}, '#', 2)::integer`)
	);
}

export const index = query(v.pipe(v.string(), v.trim(), v.minLength(1)), async (locationId) => {
	return await db
		.select({
			id: sql<string>`${messages.locationId} || '#' || ${messages.id}::text`,
			content: messages.content,
			createdAt: messages.createdAt,
			editedAt: messages.editedAt,
			gmAnnotation: messages.gmAnnotation,
			locationId: messages.locationId,
			characterId: messages.characterId,
			characterName: characters.name,
			characterImage: characters.image,
			moveId: messages.moveId,
			moveFromLocation: fromLocation,
			moveToLocation: toLocation,
			event: eventSubquery,
			replyToId: sql<string | null>`CASE WHEN ${messages.replyToId} IS NOT NULL THEN ${messages.locationId} || '#' || ${messages.replyToId}::text ELSE NULL END`,
			replyContent: replyMsg.content,
			replyCharacterName: replyChar.name
		})
		.from(messages)
		.leftJoin(characters, eq(messages.characterId, characters.id))
		.leftJoin(moves, eq(messages.moveId, moves.id))
		.leftJoin(fromLocation, eq(moves.fromLocationId, fromLocation.id))
		.leftJoin(toLocation, eq(moves.toLocationId, toLocation.id))
		.leftJoin(replyMsg, and(
			eq(replyMsg.locationId, messages.locationId),
			eq(replyMsg.id, messages.replyToId)
		))
		.leftJoin(replyChar, eq(replyMsg.characterId, replyChar.id))
		.where(and(isNull(messages.deletedAt), eq(messages.locationId, locationId)))
		.orderBy(asc(messages.createdAt));
});

export const feed = query(async () => {
	const { params } = getRequestEvent();
	const gameId = params.id!;

	return await db
		.select({
			id: sql<string>`${messages.locationId} || '#' || ${messages.id}::text`,
			content: messages.content,
			createdAt: messages.createdAt,
			editedAt: messages.editedAt,
			gmAnnotation: messages.gmAnnotation,
			locationId: messages.locationId,
			characterId: messages.characterId,
			locationName: locations.name,
			characterName: characters.name,
			characterImage: characters.image,
			moveId: messages.moveId,
			moveFromLocationName: fromLocation.name,
			moveToLocationName: toLocation.name,
			event: eventSubquery,
			replyToId: sql<string | null>`CASE WHEN ${messages.replyToId} IS NOT NULL THEN ${messages.locationId} || '#' || ${messages.replyToId}::text ELSE NULL END`,
			replyContent: replyMsg.content,
			replyCharacterName: replyChar.name
		})
		.from(messages)
		.innerJoin(locations, eq(messages.locationId, locations.id))
		.leftJoin(characters, eq(messages.characterId, characters.id))
		.leftJoin(moves, eq(messages.moveId, moves.id))
		.leftJoin(fromLocation, eq(moves.fromLocationId, fromLocation.id))
		.leftJoin(toLocation, eq(moves.toLocationId, toLocation.id))
		.leftJoin(replyMsg, and(
			eq(replyMsg.locationId, messages.locationId),
			eq(replyMsg.id, messages.replyToId)
		))
		.leftJoin(replyChar, eq(replyMsg.characterId, replyChar.id))
		.where(and(isNull(messages.deletedAt), eq(locations.gameId, gameId)))
		.orderBy(asc(messages.createdAt));
});

const refSchema = v.pipe(v.string(), v.trim(), v.regex(/^.+#\d+$/, 'Invalid message ref'));

export const send = command(
	v.object({
		locationId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		content: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(4096)),
		replyToId: v.optional(refSchema)
	}),
	async ({ locationId, content, replyToId }) => {
		const { locals, params } = getRequestEvent();
		const userId = locals.user!.id;
		const gameId = params.id!;

		const [character] = await db
			.select({ id: characters.id })
			.from(characters)
			.where(and(eq(characters.userId, userId), eq(characters.gameId, gameId)))
			.limit(1);

		if (!character) error(403, 'No character in this game');

		// Detect location change: find last message this character sent in this game
		const [lastMsg] = await db
			.select({ locationId: messages.locationId })
			.from(messages)
			.where(
				and(
					eq(messages.characterId, character.id),
					isNull(messages.deletedAt),
					isNull(messages.moveId) // only text messages count
				)
			)
			.orderBy(desc(messages.createdAt))
			.limit(1);

		if (lastMsg && lastMsg.locationId !== locationId) {
			await createMoveMessages(character.id, lastMsg.locationId, locationId, gameId);
		}

		// Extract replyToId integer from ref (same location guaranteed)
		const replyToInt = replyToId
			? parseInt(replyToId.split('#')[1], 10)
			: null;

		const inserted = await db.transaction(async (tx) => {
			const id = await nextMessageId(locationId, tx);
			const [row] = await tx
				.insert(messages)
				.values({
					locationId,
					id,
					characterId: character.id,
					content,
					replyToId: replyToInt
				})
				.returning({ id: messages.id, ref: messages.ref, createdAt: messages.createdAt });
			return row;
		});

		broadcast(gameId, {
			type: 'message:created',
			payload: {
				messageId: inserted.ref!,
				locationId,
				characterId: character.id,
				content,
				createdAt: inserted.createdAt.toISOString()
			}
		});

		await index(locationId).refresh();
	}
);

async function createMoveMessages(
	characterId: string,
	fromLocationId: string,
	toLocationId: string,
	gameId: string
) {
	const [move] = await db
		.insert(moves)
		.values({ characterId, fromLocationId, toLocationId })
		.returning({ id: moves.id });

	// Departure message in old location, arrival message in new location
	await db.transaction(async (tx) => {
		const fromId = await nextMessageId(fromLocationId, tx);
		const toId = await nextMessageId(toLocationId, tx);
		await tx.insert(messages).values([
			{ locationId: fromLocationId, id: fromId, characterId, moveId: move.id },
			{ locationId: toLocationId, id: toId, characterId, moveId: move.id }
		]);
	});

	broadcast(gameId, { type: 'location:revealed', payload: { locationId: fromLocationId } });
	broadcast(gameId, { type: 'location:revealed', payload: { locationId: toLocationId } });

	await Promise.all([index(fromLocationId).refresh(), index(toLocationId).refresh()]);
}

async function getMessageAndCheckAccess(messageRef: string) {
	const { locals, params } = getRequestEvent();
	const userId = locals.user!.id;
	const gameId = params.id!;

	const [msg] = await db
		.select({
			locationId: messages.locationId,
			id: messages.id,
			characterId: messages.characterId,
			moveId: messages.moveId,
			content: messages.content
		})
		.from(messages)
		.where(and(whereRef(messageRef), isNull(messages.deletedAt)))
		.limit(1);

	if (!msg) error(404, 'Message not found');

	const gmAccess = await isGm(gameId);
	if (!gmAccess) {
		const [char] = await db
			.select({ id: characters.id })
			.from(characters)
			.where(and(eq(characters.userId, userId), eq(characters.gameId, gameId)))
			.limit(1);

		if (!char || char.id !== msg.characterId) error(403, 'Not your message');
	}

	return { msg, gameId };
}

const contentSchema = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(4096));

export const edit = command(
	v.object({ messageId: refSchema, content: contentSchema }),
	async ({ messageId, content }) => {
		const { msg, gameId } = await getMessageAndCheckAccess(messageId);

		// System messages (moveId set or content null) cannot be edited
		if (msg.moveId || msg.content === null) error(400, 'System messages cannot be edited');

		await db
			.update(messages)
			.set({ content, editedAt: new Date() })
			.where(and(eq(messages.locationId, msg.locationId), eq(messages.id, msg.id)));

		broadcast(gameId, {
			type: 'message:edited',
			payload: {
				messageId,
				content,
				gmAnnotation: null,
				editedAt: new Date().toISOString()
			}
		});

		await index(msg.locationId).refresh();
	}
);

export const remove = command(refSchema, async (messageRef) => {
	const { msg, gameId } = await getMessageAndCheckAccess(messageRef);

	if (msg.moveId) {
		// System move message: delete the moves row — cascades to both departure + arrival messages
		await db.delete(moves).where(eq(moves.id, msg.moveId));

		broadcast(gameId, { type: 'message:deleted', payload: { messageId: messageRef } });
		// Also broadcast deletion of the sibling move message
		const sibling = await db
			.select({ locationId: messages.locationId, id: messages.id, ref: messages.ref })
			.from(messages)
			.where(and(eq(messages.moveId, msg.moveId), ne(messages.id, msg.id)))
			.limit(1);
		if (sibling[0]) {
			broadcast(gameId, { type: 'message:deleted', payload: { messageId: sibling[0].ref! } });
			await index(sibling[0].locationId).refresh();
		}
	} else if (msg.content === null) {
		// Other system message (proposal/dice): hard delete, cascade handles linked rows
		await db.delete(messages).where(and(eq(messages.locationId, msg.locationId), eq(messages.id, msg.id)));
		broadcast(gameId, { type: 'message:deleted', payload: { messageId: messageRef } });
	} else {
		// Text message: soft delete
		await db.update(messages).set({ deletedAt: new Date() }).where(and(eq(messages.locationId, msg.locationId), eq(messages.id, msg.id)));
		broadcast(gameId, { type: 'message:deleted', payload: { messageId: messageRef } });
	}

	await index(msg.locationId).refresh();
});

export const annotate = command(
	v.object({ messageId: refSchema, annotation: v.pipe(v.string(), v.trim()) }),
	async ({ messageId, annotation }) => {
		const { params } = getRequestEvent();
		const gameId = params.id!;

		await assertGm(gameId);

		const [msg] = await db
			.select({
				locationId: messages.locationId,
				id: messages.id,
				content: messages.content,
				editedAt: messages.editedAt
			})
			.from(messages)
			.where(and(whereRef(messageId), isNull(messages.deletedAt)))
			.limit(1);

		if (!msg) error(404, 'Message not found');

		const processedAnnotation = annotation || null;

		await db
			.update(messages)
			.set({ gmAnnotation: processedAnnotation })
			.where(and(eq(messages.locationId, msg.locationId), eq(messages.id, msg.id)));

		broadcast(gameId, {
			type: 'message:edited',
			payload: {
				messageId,
				content: msg.content,
				gmAnnotation: processedAnnotation,
				editedAt: msg.editedAt?.toISOString() ?? new Date().toISOString()
			}
		});

		await index(msg.locationId).refresh();
	}
);
