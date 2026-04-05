import { command, form, getRequestEvent, query } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { characterSkills, characters, games, races, user } from '$lib/server/db/schema';
import { assertGm, isGm } from './utils';

// ── Queries ───────────────────────────────────────────────────────────────────

export const indexAll = query(async () => {
	const { params } = getRequestEvent();
	const rows = await db
		.select({
			id: characters.id,
			name: characters.name,
			image: characters.image,
			status: characters.status,
			userId: characters.userId,
			userName: user.name
		})
		.from(characters)
		.leftJoin(user, eq(characters.userId, user.id))
		.where(eq(characters.gameId, params.id!));

	return rows.map(({ userName, ...char }) => ({
		...char,
		user: { id: char.userId, name: userName ?? '' }
	}));
});

export const index = query(v.pipe(v.string(), v.trim(), v.minLength(1)), async (charId) => {
	const { params } = getRequestEvent();

	const [row] = await db
		.select({
			id: characters.id,
			userId: characters.userId,
			gameId: characters.gameId,
			raceId: characters.raceId,
			name: characters.name,
			gender: characters.gender,
			age: characters.age,
			image: characters.image,
			bodyDescription: characters.bodyDescription,
			prehistory: characters.prehistory,
			stats: characters.stats,
			status: characters.status,
			hp: characters.hp,
			maxHp: characters.maxHp,
			mp: characters.mp,
			maxMp: characters.maxMp,
			userName: user.name,
			raceName: races.name
		})
		.from(characters)
		.leftJoin(user, eq(characters.userId, user.id))
		.leftJoin(races, eq(characters.raceId, races.id))
		.where(and(eq(characters.id, charId), eq(characters.gameId, params.id!)));

	if (!row) return null;
	const { userName, raceName, ...charData } = row;
	return {
		...charData,
		user: { id: charData.userId, name: userName ?? '' },
		race: charData.raceId ? { id: charData.raceId, name: raceName! } : null
	};
});

// ── Shared helpers ────────────────────────────────────────────────────────────

const CharacterInGame = v.object({
	gameId: v.string(),
	characterId: v.string()
});

// ── Forms ─────────────────────────────────────────────────────────────────────

const CharacterSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	gender: v.picklist(['male', 'female', 'none', 'both']),
	raceId: v.pipe(
		v.string(),
		v.transform((s) => s || null)
	),
	age: v.pipe(
		v.optional(v.string()),
		v.transform((s) => (s ? parseInt(s) : null))
	),
	image: v.optional(v.string()),
	bodyDescription: v.optional(v.string()),
	prehistory: v.optional(v.string())
});

export const createCharacter = form(CharacterSchema, async (data) => {
	const { locals, params } = getRequestEvent();
	const userId = locals.user!.id;
	const gameId = params.id;

	const game = await db
		.select({ id: games.id })
		.from(games)
		.where(eq(games.id, gameId))
		.limit(1)
		.then((r) => r[0]);

	if (!game) error(404);

	const existing = await db
		.select({ id: characters.id })
		.from(characters)
		.where(and(eq(characters.gameId, gameId), eq(characters.userId, userId)))
		.limit(1);

	if (existing.length > 0) redirect(303, `/games/${gameId}`);

	let stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
	let skillIds: string[] = [];

	if (data.raceId) {
		const race = await db.query.races.findFirst({
			where: eq(races.id, data.raceId),
			with: { raceSkills: true }
		});
		if (race) {
			stats = race.baseStats;
			skillIds = race.raceSkills.map((rs) => rs.skillId);
		}
	}

	const [character] = await db
		.insert(characters)
		.values({
			userId,
			gameId,
			raceId: data.raceId,
			name: data.name,
			gender: data.gender,
			age: data.age,
			image: data.image?.trim() || null,
			bodyDescription: data.bodyDescription?.trim() || null,
			prehistory: data.prehistory?.trim() || null,
			stats
		})
		.returning({ id: characters.id });

	if (skillIds.length > 0) {
		await db
			.insert(characterSkills)
			.values(skillIds.map((skillId) => ({ characterId: character.id, skillId })));
	}

	await indexAll().refresh();
	redirect(303, `/games/${gameId}/characters/${character.id}`);
});

export const editCharacter = form(CharacterSchema, async (data) => {
	const { locals, params } = getRequestEvent();
	const userId = locals.user!.id;
	const gameId = params.id;
	const charId = params.charId;

	const [game] = await db
		.select({ gmUserId: games.gmUserId })
		.from(games)
		.where(eq(games.id, gameId))
		.limit(1);

	if (!game) error(404);

	const [character] = await db
		.select()
		.from(characters)
		.where(and(eq(characters.id, charId), eq(characters.gameId, gameId)))
		.limit(1);

	if (!character) error(404);

	const isGm = game.gmUserId === userId;
	const isOwner = character.userId === userId;

	if (!isGm && !isOwner) error(403);

	if (data.raceId !== character.raceId) {
		let stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
		let skillIds: string[] = [];

		if (data.raceId) {
			const race = await db.query.races.findFirst({
				where: eq(races.id, data.raceId),
				with: { raceSkills: true }
			});
			if (race) {
				stats = race.baseStats;
				skillIds = race.raceSkills.map((rs) => rs.skillId);
			}
		}

		await db.delete(characterSkills).where(eq(characterSkills.characterId, charId));

		if (skillIds.length > 0) {
			await db
				.insert(characterSkills)
				.values(skillIds.map((skillId) => ({ characterId: charId, skillId })));
		}

		await db
			.update(characters)
			.set({
				name: data.name,
				gender: data.gender,
				raceId: data.raceId,
				age: data.age,
				image: data.image?.trim() || null,
				bodyDescription: data.bodyDescription?.trim() || null,
				prehistory: data.prehistory?.trim() || null,
				stats,
				...(isOwner && !isGm ? { status: 'pending' as const } : {}),
				updatedAt: new Date()
			})
			.where(eq(characters.id, charId));
	} else {
		await db
			.update(characters)
			.set({
				name: data.name,
				gender: data.gender,
				age: data.age,
				image: data.image?.trim() || null,
				bodyDescription: data.bodyDescription?.trim() || null,
				prehistory: data.prehistory?.trim() || null,
				...(isOwner && !isGm ? { status: 'pending' as const } : {}),
				updatedAt: new Date()
			})
			.where(eq(characters.id, charId));
	}

	await indexAll().refresh();
	await index(charId).refresh();
	redirect(303, `/games/${gameId}/characters/${charId}`);
});

// ── Commands ──────────────────────────────────────────────────────────────────

export const approve = command(CharacterInGame, async ({ gameId, characterId }) => {
	await assertGm(gameId);
	await db
		.update(characters)
		.set({ status: 'approved' })
		.where(and(eq(characters.id, characterId), eq(characters.gameId, gameId)));
	await indexAll().refresh();
	await index(characterId).refresh();
});

export const reject = command(CharacterInGame, async ({ gameId, characterId }) => {
	await assertGm(gameId);
	await db
		.update(characters)
		.set({ status: 'rejected' })
		.where(and(eq(characters.id, characterId), eq(characters.gameId, gameId)));
	await indexAll().refresh();
	await index(characterId).refresh();
});

export const deleteChar = command(CharacterInGame, async ({ gameId, characterId }) => {
	const { locals } = getRequestEvent();
	const userId = locals.user!.id;

	const [character] = await db
		.select({ userId: characters.userId })
		.from(characters)
		.where(and(eq(characters.id, characterId), eq(characters.gameId, gameId)))
		.limit(1);

	if (!character) throw new Error('Not found');

	const gm = await isGm(gameId, userId);
	const isOwner = character.userId === userId;

	if (!isGm && !isOwner) throw new Error('Forbidden');

	await db.delete(characters).where(eq(characters.id, characterId));
	await indexAll().refresh();
});
