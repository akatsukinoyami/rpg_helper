import { command, getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import { and, asc, desc, eq, isNull, ne } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	characters,
	locations,
	messages,
	moves
} from '$lib/server/db/schema';
import { broadcast } from '$lib/server/ws/adapter';
import { assertGm, isGm } from '$lib/remote/utils';

const replyMsg = alias(messages, 'reply_msg');
const replyChar = alias(characters, 'reply_char');

export const index = query(v.pipe(v.string(), v.trim(), v.minLength(1)), async (locationId) => {
	return await db
		.select({
			id: messages.id,
			content: messages.content,
			createdAt: messages.createdAt,
			editedAt: messages.editedAt,
			gmAnnotation: messages.gmAnnotation,
			locationId: messages.locationId,
			characterId: messages.characterId,
			characterName: characters.name,
			characterImage: characters.image,
			moveId: messages.moveId,
			replyToId: messages.replyToId,
			replyContent: replyMsg.content,
			replyCharacterName: replyChar.name
		})
		.from(messages)
		.leftJoin(characters, eq(messages.characterId, characters.id))
		.leftJoin(replyMsg, eq(messages.replyToId, replyMsg.id))
		.leftJoin(replyChar, eq(replyMsg.characterId, replyChar.id))
		.where(and(isNull(messages.deletedAt), eq(messages.locationId, locationId)))
		.orderBy(asc(messages.createdAt));
});

export const feed = query(async () => {
	const { params } = getRequestEvent();
	const gameId = params.id!;

	return await db
		.select({
			id: messages.id,
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
			replyToId: messages.replyToId,
			replyContent: replyMsg.content,
			replyCharacterName: replyChar.name
		})
		.from(messages)
		.innerJoin(locations, eq(messages.locationId, locations.id))
		.leftJoin(characters, eq(messages.characterId, characters.id))
		.leftJoin(replyMsg, eq(messages.replyToId, replyMsg.id))
		.leftJoin(replyChar, eq(replyMsg.characterId, replyChar.id))
		.where(and(isNull(messages.deletedAt), eq(locations.gameId, gameId)))
		.orderBy(asc(messages.createdAt));
});


export const send = command(
	v.object({
		locationId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		content: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(4096)),
		replyToId: v.optional(v.pipe(v.string(), v.trim()))
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

		const [inserted] = await db
			.insert(messages)
			.values({
				locationId,
				characterId: character.id,
				content,
				replyToId: replyToId || null
			})
			.returning({ id: messages.id, createdAt: messages.createdAt });

		broadcast(gameId, {
			type: 'message:created',
			payload: {
				messageId: inserted.id,
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
	await db.insert(messages).values([
		{ locationId: fromLocationId, characterId, moveId: move.id },
		{ locationId: toLocationId, characterId, moveId: move.id }
	]);

	broadcast(gameId, { type: 'location:revealed', payload: { locationId: fromLocationId } });
	broadcast(gameId, { type: 'location:revealed', payload: { locationId: toLocationId } });

	await Promise.all([index(fromLocationId).refresh(), index(toLocationId).refresh()]);
}

const contentSchema = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(4096));
const messageIdSchema = v.pipe(v.string(), v.trim(), v.minLength(1));

async function getMessageAndCheckAccess(messageId: string) {
	const { locals, params } = getRequestEvent();
	const userId = locals.user!.id;
	const gameId = params.id!;

	const [msg] = await db
		.select({
			characterId: messages.characterId,
			locationId: messages.locationId,
			moveId: messages.moveId,
			content: messages.content
		})
		.from(messages)
		.where(and(eq(messages.id, messageId), isNull(messages.deletedAt)))
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

export const edit = command(
	v.object({ messageId: messageIdSchema, content: contentSchema }),
	async ({ messageId, content }) => {
		const { msg, gameId } = await getMessageAndCheckAccess(messageId);

		// System messages (moveId set or content null) cannot be edited
		if (msg.moveId || msg.content === null) error(400, 'System messages cannot be edited');

		await db
			.update(messages)
			.set({ content, editedAt: new Date() })
			.where(eq(messages.id, messageId));

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

export const remove = command(messageIdSchema, async (messageId) => {
	const { msg, gameId } = await getMessageAndCheckAccess(messageId);

	if (msg.moveId) {
		// System move message: delete the moves row — cascades to both departure + arrival messages
		await db.delete(moves).where(eq(moves.id, msg.moveId));

		broadcast(gameId, { type: 'message:deleted', payload: { messageId } });
		// Also broadcast deletion of the sibling move message (fetched via the move)
		const sibling = await db
			.select({ id: messages.id, locationId: messages.locationId })
			.from(messages)
			.where(and(eq(messages.moveId, msg.moveId), ne(messages.id, messageId)))
			.limit(1);
		if (sibling[0]) {
			broadcast(gameId, { type: 'message:deleted', payload: { messageId: sibling[0].id } });
			await index(sibling[0].locationId).refresh();
		}
	} else if (msg.content === null) {
		// Other system message (proposal/dice): hard delete, cascade handles linked rows
		await db.delete(messages).where(eq(messages.id, messageId));
		broadcast(gameId, { type: 'message:deleted', payload: { messageId } });
	} else {
		// Text message: soft delete
		await db.update(messages).set({ deletedAt: new Date() }).where(eq(messages.id, messageId));
		broadcast(gameId, { type: 'message:deleted', payload: { messageId } });
	}

	await index(msg.locationId).refresh();
});

export const annotate = command(
	v.object({ messageId: messageIdSchema, annotation: v.pipe(v.string(), v.trim()) }),
	async ({ messageId, annotation }) => {
		const { params } = getRequestEvent();
		const gameId = params.id!;

		await assertGm(gameId);

		const [msg] = await db
			.select({
				locationId: messages.locationId,
				content: messages.content,
				editedAt: messages.editedAt
			})
			.from(messages)
			.where(and(eq(messages.id, messageId), isNull(messages.deletedAt)))
			.limit(1);

		if (!msg) error(404, 'Message not found');

		const processedAnnotation = annotation || null;

		await db
			.update(messages)
			.set({ gmAnnotation: processedAnnotation })
			.where(eq(messages.id, messageId));

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
