import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { and, eq, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	characters,
	charItems,
	charSkills,
	itemProposals,
	messages,
	skillProposals,
	statProposals
} from '$lib/server/db/schema';
import { broadcast } from '$lib/server/ws/adapter';
import { assertGm } from '$lib/remote/utils';
import { index } from '$lib/remote/messages.remote';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statNames = new Set(['str', 'dex', 'con', 'int', 'wis', 'cha']);

async function getCharacterInGame(userId: string, gameId: string) {
	const [character] = await db
		.select({ id: characters.id })
		.from(characters)
		.where(and(eq(characters.userId, userId), eq(characters.gameId, gameId)))
		.limit(1);
	if (!character) error(403, 'No character in this game');
	return character;
}

/** Insert a system message using per-location counter. Returns { locationId, id, ref }. */
async function insertSystemMessage(locationId: string, characterId: string) {
	return await db.transaction(async (tx) => {
		await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${locationId}))`);
		const [row] = await tx
			.select({ max: sql<number>`COALESCE(MAX(${messages.id}), 0)` })
			.from(messages)
			.where(eq(messages.locationId, locationId));
		const id = (row?.max ?? 0) + 1;

		const [msg] = await tx
			.insert(messages)
			.values({ locationId, id, characterId })
			.returning({ locationId: messages.locationId, id: messages.id, ref: messages.ref });
		return msg;
	});
}

async function applyStatDelta(characterId: string, field: string, delta: number) {
	if (statNames.has(field)) {
		await db
			.update(characters)
			.set({ stats: sql`jsonb_set(stats, ${sql.raw(`'{${field}}'`)}, to_jsonb((stats->>${field})::int + ${delta}))` })
			.where(eq(characters.id, characterId));
	} else {
		switch (field) {
			case 'hp':    await db.update(characters).set({ hp:    sql`hp + ${delta}`     }).where(eq(characters.id, characterId)); break;
			case 'mp':    await db.update(characters).set({ mp:    sql`mp + ${delta}`     }).where(eq(characters.id, characterId)); break;
			case 'maxHp': await db.update(characters).set({ maxHp: sql`max_hp + ${delta}` }).where(eq(characters.id, characterId)); break;
			case 'maxMp': await db.update(characters).set({ maxMp: sql`max_mp + ${delta}` }).where(eq(characters.id, characterId)); break;
		}
	}
}

async function refreshMessage(gameId: string, messageRef: string, type: 'edited' | 'deleted') {
	const locationId = messageRef.split('#')[0];
	if (type === 'edited') {
		broadcast(gameId, {
			type: 'message:edited',
			payload: { messageId: messageRef, content: null, gmAnnotation: null, editedAt: new Date().toISOString() }
		});
	} else {
		broadcast(gameId, {
			type: 'message:deleted',
			payload: { messageId: messageRef }
		});
	}
	await index(locationId).refresh();
}

function broadcastSystemMessage(gameId: string, messageRef: string, locationId: string, characterId: string) {
	broadcast(gameId, {
		type: 'message:created',
		payload: { messageId: messageRef, locationId, characterId, content: null, createdAt: new Date().toISOString() }
	});
}

async function _getProposal<T extends keyof typeof proposalTables>(type: T, proposalId: string, deletion = false) {
	const table = proposalTables[type];
	const [proposal] = await db
		.select()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		.from(table as any)
		.where(eq((table as any).id, proposalId))
		.limit(1);

	if (!proposal) error(404, 'Proposal not found');
	if (!deletion && proposal.status !== 'pending') error(409, 'Proposal already reviewed');

	return proposal;
}
type ProposalOf<T extends keyof typeof proposalTables> = Awaited<ReturnType<typeof _getProposal<T>>>;

// ---------------------------------------------------------------------------
// Proposal type schema
// ---------------------------------------------------------------------------

const proposalTypeSchema = v.picklist(['characterChange', 'itemChange', 'skillChange'] as const);
const proposalIdSchema = v.pipe(v.string(), v.trim(), v.minLength(1));

// ---------------------------------------------------------------------------
// Unified public commands
// ---------------------------------------------------------------------------

const proposalTables = {
	characterChange: statProposals,
	itemChange: itemProposals,
	skillChange: skillProposals,
};

const applyApprove = {
	async characterChange(proposal: ProposalOf<'characterChange'>) {
		await applyStatDelta(proposal.characterId, proposal.field, proposal.delta);
	},
	async itemChange(proposal: ProposalOf<'itemChange'>) {
		if (proposal.charItemId) {
			if (proposal.deltaQty != null) {
				await db
					.update(charItems)
					.set({ quantity: sql`quantity + ${proposal.deltaQty}` })
					.where(eq(charItems.id, proposal.charItemId));
			}
			if (proposal.deltaDur != null) {
				await db
					.update(charItems)
					.set({ durability: sql`durability + ${proposal.deltaDur}` })
					.where(eq(charItems.id, proposal.charItemId));
			}
		} else {
			await db
				.insert(charItems)
				.values({
					characterId: proposal.characterId,
					itemTypeId: proposal.itemTypeId,
					quantity: proposal.deltaQty ?? null,
					durability: proposal.deltaDur ?? null
				});
		}
	},
	async skillChange(proposal: ProposalOf<'skillChange'>) {
		if (proposal.action === 'add') {
			await db
				.insert(charSkills)
				.values({
					characterId: proposal.characterId,
					skillTypeId: proposal.skillTypeId
				})
				.onConflictDoNothing();
		} else {
			await db
				.delete(charSkills)
				.where(and(
					eq(charSkills.characterId, proposal.characterId),
					eq(charSkills.skillTypeId, proposal.skillTypeId)
				));
		}
	},
};

export const approve = command(
	v.object({ type: proposalTypeSchema, id: proposalIdSchema }),
	async ({ type, id }) => {
		const { params } = getRequestEvent();
		const gameId = params.id!;
		await assertGm(gameId);

		const proposal = await _getProposal(type, id);

		await (applyApprove[type] as (p: typeof proposal) => Promise<void>)(proposal);

		await db
			.update(proposalTables[type])
			.set({ status: 'approved' })
			.where(eq(proposalTables[type].id, proposal.id));

		const ref = `${proposal.messageLocationId}#${proposal.messageId}`;
		await refreshMessage(gameId, ref, 'edited');
	}
);

export const reject = command(
	v.object({ type: proposalTypeSchema, id: proposalIdSchema }),
	async ({ type, id }) => {
		const { params } = getRequestEvent();
		const gameId = params.id!;
		await assertGm(gameId);

		const proposal = await _getProposal(type, id);

		await db
			.update(proposalTables[type])
			.set({ status: 'rejected' })
			.where(eq(proposalTables[type].id, id));

		const ref = `${proposal.messageLocationId}#${proposal.messageId}`;
		await refreshMessage(gameId, ref, 'edited');
	}
);

const removePropose = {
	async characterChange(proposal: ProposalOf<'characterChange'>) {
		if (proposal.status === 'approved') {
			await applyStatDelta(proposal.characterId, proposal.field, -proposal.delta);
		}
	},

	async itemChange(proposal: ProposalOf<'itemChange'>) {
		if (proposal.status === 'approved' && proposal.charItemId) {
			if (proposal.deltaQty != null) {
				await db
					.update(charItems)
					.set({ quantity: sql`quantity - ${proposal.deltaQty}` })
					.where(eq(charItems.id, proposal.charItemId));
			}
			if (proposal.deltaDur != null) {
				await db
					.update(charItems)
					.set({ durability: sql`durability - ${proposal.deltaDur}` })
					.where(eq(charItems.id, proposal.charItemId));
			}
		}
	},

	async skillChange(proposal: ProposalOf<'skillChange'>) {
		if (proposal.status === 'approved') {
			if (proposal.action === 'add') {
				await db
					.delete(charSkills)
					.where(and(
						eq(charSkills.characterId, proposal.characterId),
						eq(charSkills.skillTypeId, proposal.skillTypeId)
					));
			} else {
				await db
					.insert(charSkills)
					.values({
						characterId: proposal.characterId,
						skillTypeId: proposal.skillTypeId
					})
					.onConflictDoNothing();
			}
		}
	}
};

export const remove = command(
	v.object({ type: proposalTypeSchema, id: proposalIdSchema }),
	async ({ type, id }) => {
		const { params } = getRequestEvent();
		const gameId = params.id!;
		await assertGm(gameId);

		const proposal = await _getProposal(type, id, true);

		await (removePropose[type] as (p: typeof proposal) => Promise<void>)(proposal);

		// Hard delete the system message — cascade removes the proposal row
		await db.delete(messages).where(
			and(
				eq(messages.locationId, proposal.messageLocationId),
				eq(messages.id, proposal.messageId)
			)
		);

		const ref = `${proposal.messageLocationId}#${proposal.messageId}`;
		await refreshMessage(gameId, ref, 'deleted');
	}
);

// ---------------------------------------------------------------------------
// Send commands (per-type, called from message form)
// ---------------------------------------------------------------------------

const statFieldValues = ['hp', 'mp', 'maxHp', 'maxMp', 'str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

export const sendStat = command(
	v.object({
		locationId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		field: v.picklist(statFieldValues),
		delta: v.pipe(v.number(), v.integer()),
		reason: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(512)))
	}),
	async ({ locationId, field, delta, reason }) => {
		const { locals, params } = getRequestEvent();
		const gameId = params.id!;
		const character = await getCharacterInGame(locals.user!.id, gameId);

		const msg = await insertSystemMessage(locationId, character.id);
		await db.insert(statProposals).values({
			messageLocationId: msg.locationId,
			messageId: msg.id,
			characterId: character.id,
			proposedBy: locals.user!.id,
			field,
			delta,
			reason: reason ?? null,
			status: 'pending'
		});

		broadcastSystemMessage(gameId, msg.ref!, locationId, character.id);
		await index(locationId).refresh();
	}
);

export const sendItem = command(
	v.object({
		locationId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		itemTypeId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		charItemId: v.optional(v.pipe(v.string(), v.trim())),
		deltaQty: v.optional(v.pipe(v.number(), v.integer())),
		deltaDur: v.optional(v.pipe(v.number(), v.integer())),
		reason: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(512)))
	}),
	async ({ locationId, itemTypeId, charItemId, deltaQty, deltaDur, reason }) => {
		const { locals, params } = getRequestEvent();
		const gameId = params.id!;
		const character = await getCharacterInGame(locals.user!.id, gameId);
		if (deltaQty == null && deltaDur == null) error(400, 'Must provide deltaQty or deltaDur');

		const msg = await insertSystemMessage(locationId, character.id);
		await db.insert(itemProposals).values({
			messageLocationId: msg.locationId,
			messageId: msg.id,
			characterId: character.id,
			proposedBy: locals.user!.id,
			itemTypeId,
			charItemId: charItemId ?? null,
			deltaQty: deltaQty ?? null,
			deltaDur: deltaDur ?? null,
			reason: reason ?? null,
			status: 'pending'
		});

		broadcastSystemMessage(gameId, msg.ref!, locationId, character.id);
		await index(locationId).refresh();
	}
);

export const sendSkill = command(
	v.object({
		locationId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		skillTypeId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		action: v.picklist(['add', 'remove'] as const),
		reason: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(512)))
	}),
	async ({ locationId, skillTypeId, action, reason }) => {
		const { locals, params } = getRequestEvent();
		const gameId = params.id!;
		const character = await getCharacterInGame(locals.user!.id, gameId);

		const msg = await insertSystemMessage(locationId, character.id);
		await db.insert(skillProposals).values({
			messageLocationId: msg.locationId,
			messageId: msg.id,
			characterId: character.id,
			proposedBy: locals.user!.id,
			skillTypeId,
			action,
			reason: reason ?? null,
			status: 'pending'
		});

		broadcastSystemMessage(gameId, msg.ref!, locationId, character.id);
		await index(locationId).refresh();
	}
);

// ---------------------------------------------------------------------------
// GM direct stat change — auto-approved, creates feed record
// ---------------------------------------------------------------------------

export const gmSetStat = command(
	v.object({
		locationId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		characterId: v.pipe(v.string(), v.trim(), v.minLength(1)),
		field: v.picklist(statFieldValues),
		delta: v.pipe(v.number(), v.integer())
	}),
	async ({ locationId, characterId, field, delta }) => {
		const { locals, params } = getRequestEvent();
		const gameId = params.id!;
		await assertGm(gameId);

		const msg = await insertSystemMessage(locationId, characterId);
		await db.insert(statProposals).values({
			messageLocationId: msg.locationId,
			messageId: msg.id,
			characterId,
			proposedBy: locals.user!.id,
			field,
			delta,
			status: 'approved'
		});
		await applyStatDelta(characterId, field, delta);

		broadcastSystemMessage(gameId, msg.ref!, locationId, characterId);
		await index(locationId).refresh();
	}
);
