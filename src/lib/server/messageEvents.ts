import { and, eq, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { diceRolls, itemProposals, messages, moves, skillProposals, statProposals } from '$lib/server/db/schema';

type MsgKey = { locationId: string; id: number };

/** Fetches all system events for a batch of messages identified by (locationId, id) pairs. */
export async function getEventsForMessages(msgKeys: MsgKey[]) {
	if (msgKeys.length === 0) {
		return { moves: [], statProposals: [], itemProposals: [], skillProposals: [], diceRolls: [] };
	}

	// Build OR clause for each (locationId, id) pair
	const msgCondition = or(
		...msgKeys.map((k) => and(eq(messages.locationId, k.locationId), eq(messages.id, k.id)))
	)!;

	const proposalCondition = or(
		...msgKeys.map((k) =>
			and(
				eq(statProposals.messageLocationId, k.locationId),
				eq(statProposals.messageId, k.id)
			)
		)
	)!;

	const itemCondition = or(
		...msgKeys.map((k) =>
			and(
				eq(itemProposals.messageLocationId, k.locationId),
				eq(itemProposals.messageId, k.id)
			)
		)
	)!;

	const skillCondition = or(
		...msgKeys.map((k) =>
			and(
				eq(skillProposals.messageLocationId, k.locationId),
				eq(skillProposals.messageId, k.id)
			)
		)
	)!;

	const diceCondition = or(
		...msgKeys.map((k) =>
			and(
				eq(diceRolls.messageLocationId, k.locationId),
				eq(diceRolls.messageId, k.id)
			)
		)
	)!;

	const [movesRows, statRows, itemRows, skillRows, diceRows] = await Promise.all([
		db
			.select({
				messageRef: messages.ref,
				id: moves.id,
				fromLocationId: moves.fromLocationId,
				toLocationId: moves.toLocationId
			})
			.from(messages)
			.innerJoin(moves, eq(messages.moveId, moves.id))
			.where(msgCondition),
		db.select().from(statProposals).where(proposalCondition),
		db.select().from(itemProposals).where(itemCondition),
		db.select().from(skillProposals).where(skillCondition),
		db.select().from(diceRolls).where(diceCondition)
	]);

	return {
		moves: movesRows,
		statProposals: statRows,
		itemProposals: itemRows,
		skillProposals: skillRows,
		diceRolls: diceRows
	};
}
