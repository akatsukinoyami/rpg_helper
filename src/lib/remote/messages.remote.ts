import { command, getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characters, messages } from '$lib/server/db/schema';
import { broadcast } from '$lib/server/ws/adapter';

export const index = query(
	v.pipe(v.string(), v.trim(), v.minLength(1)),
	async (locationId) => {
		return await db
			.select({
				id: messages.id,
				content: messages.content,
				createdAt: messages.createdAt,
				characterName: characters.name
			})
			.from(messages)
			.leftJoin(characters, eq(messages.characterId, characters.id))
			.where(and(isNull(messages.deletedAt), eq(messages.locationId, locationId)))
			.orderBy(asc(messages.createdAt));
	}
);

export const send = command(
	v.object({
		locationId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		content: v.pipe(v.string(), v.trim(), v.minLength(1))
	}),
	async ({ locationId, content }) => {
		const { locals, params } = getRequestEvent();
		const userId = locals.user!.id;
		const gameId = params.id!;

		const [character] = await db
			.select({ id: characters.id })
			.from(characters)
			.where(and(eq(characters.userId, userId), eq(characters.gameId, gameId)))
			.limit(1);

		const [inserted] = await db.insert(messages).values({
			locationId,
			characterId: character?.id ?? null,
			content
		}).returning({ id: messages.id, createdAt: messages.createdAt });

		broadcast(gameId, {
			type: 'message:created',
			payload: {
				messageId: inserted.id,
				locationId,
				characterId: character?.id ?? null,
				content,
				createdAt: inserted.createdAt.toISOString()
			}
		});

		await index(locationId).refresh();
	}
);
