import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { characters, diceRolls, messages } from '$lib/server/db/schema';
import { broadcast } from '$lib/server/ws/adapter';
import { assertGm } from '$lib/remote/utils';
import { index } from '$lib/remote/messages.remote';
import { insertSystemMessage, broadcastSystemMessage } from '$lib/remote/messageUtils';

// Matches e.g. "2d6", "1d20+3", "3d8-2"
const diceExpressionSchema = v.pipe(
	v.string(),
	v.trim(),
	v.regex(/^\d+[dD]\d+([+-]\d+)?$/, 'Invalid dice expression')
);

const refSchema = v.pipe(v.string(), v.trim(), v.regex(/^.+#\d+$/, 'Invalid message ref'));

function evaluateDice(expression: string): { rolls: number[]; modifier: number; result: number } {
	const match = expression.match(/^(\d+)[dD](\d+)([+-]\d+)?$/);
	if (!match) throw new Error('Invalid expression');

	const count = parseInt(match[1], 10);
	const sides = parseInt(match[2], 10);
	const modifier = match[3] ? parseInt(match[3], 10) : 0;

	if (count < 1 || count > 100) throw new Error('Dice count must be 1–100');
	if (sides < 1 || sides > 1000) throw new Error('Sides must be 1–1000');

	const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
	const result = rolls.reduce((a, b) => a + b, 0) + modifier;

	return { rolls, modifier, result };
}

export const roll = command(
	v.object({
		locationId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		expression: diceExpressionSchema
	}),
	async ({ locationId, expression }) => {
		const { locals, params } = getRequestEvent();
		const userId = locals.user!.id;
		const gameId = params.id!;

		const [character] = await db
			.select({ id: characters.id })
			.from(characters)
			.where(and(eq(characters.userId, userId), eq(characters.gameId, gameId)))
			.limit(1);

		if (!character) error(403, 'No character in this game');

		const { rolls, modifier, result } = evaluateDice(expression);

		const msg = await insertSystemMessage(locationId, character.id);

		await db.insert(diceRolls).values({
			messageLocationId: msg.locationId,
			messageId: msg.id,
			gameId,
			userId,
			expression,
			results: { dice: rolls, modifier, total: result }
		});

		broadcast(gameId, {
			type: 'dice:roll',
			payload: { characterId: character.id, expression, dice: rolls, modifier, total: result }
		});

		broadcastSystemMessage(gameId, msg.ref!, locationId, character.id);

		await index(locationId).refresh();
	}
);

export const deleteRoll = command(refSchema, async (messageRef) => {
	const { params } = getRequestEvent();
	const gameId = params.id!;
	await assertGm(gameId);

	const locationId = messageRef.split('#')[0];
	const messageId = parseInt(messageRef.split('#')[1], 10);

	const [msg] = await db
		.select({ locationId: messages.locationId })
		.from(messages)
		.where(and(eq(messages.locationId, locationId), eq(messages.id, messageId)))
		.limit(1);

	if (!msg) error(404, 'Message not found');

	// Hard delete — cascades to diceRolls row
	await db
		.delete(messages)
		.where(and(eq(messages.locationId, locationId), eq(messages.id, messageId)));

	broadcast(gameId, { type: 'message:deleted', payload: { messageId: messageRef } });
	await index(locationId).refresh();
});
