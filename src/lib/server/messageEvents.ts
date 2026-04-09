import { inArray, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { diceRolls, itemProposals, messages, moves, skillProposals, statProposals } from '$lib/server/db/schema';

/** Fetches all system events for a batch of message IDs. */
export async function getEventsForMessages(messageIds: string[]) {
	if (messageIds.length === 0) {
		return { moves: [], statProposals: [], itemProposals: [], skillProposals: [], diceRolls: [] };
	}

	const [movesRows, statRows, itemRows, skillRows, diceRows] = await Promise.all([
		db
			.select({ messageId: messages.id, id: moves.id, fromLocationId: moves.fromLocationId, toLocationId: moves.toLocationId })
			.from(messages)
			.innerJoin(moves, eq(messages.moveId, moves.id))
			.where(inArray(messages.id, messageIds)),
		db.select().from(statProposals).where(inArray(statProposals.messageId, messageIds)),
		db.select().from(itemProposals).where(inArray(itemProposals.messageId, messageIds)),
		db.select().from(skillProposals).where(inArray(skillProposals.messageId, messageIds)),
		db.select().from(diceRolls).where(inArray(diceRolls.messageId, messageIds))
	]);

	return {
		moves: movesRows,
		statProposals: statRows,
		itemProposals: itemRows,
		skillProposals: skillRows,
		diceRolls: diceRows
	};
}
