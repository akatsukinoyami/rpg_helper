import { hashPassword } from 'better-auth/crypto';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import {
	account,
	characters,
	games,
	itemTypes,
	locations,
	skillTypes,
	user
} from '../schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seed() {
	console.log('Purging database...');
	await client.unsafe(`
		TRUNCATE TABLE
			char_skills, char_items, item_proposals, stat_proposals, skill_proposals,
			character_visibility, character_items, character_skills, character_edit_proposals,
			moves, messages, dice_rolls,
			characters,
			item_types, skill_types, locations,
			race_skills, games,
			races, skills, items,
			session, account, verification, "user"
		CASCADE
	`);

	const now = new Date();

	const { USERS } = await import('./users');
	console.log('Creating users...');
	
	const { GAMES } = await import('./games');
	console.log('Seeding games...');

	await Promise.all([
		USERS.map(async (u) => {
			const hash = await hashPassword(u.password);
				await db.insert(user).values({
					id: u.id,
					name: u.name,
					email: u.email,
					emailVerified: true,
					createdAt: now,
					updatedAt: now
				});
				await db.insert(account).values({
					id: `account-${u.id}`,
					accountId: u.email,
					providerId: 'credential',
					userId: u.id,
					password: hash,
					createdAt: now,
					updatedAt: now
				});
		}),
		
		GAMES.map(async ({ def, gmUserId }) => {
			const [game] = await db
				.insert(games)
				.values({
					name: def.name,
					description: def.description,
					gmUserId,
					statDefs: def.statDefs
				})
				.returning({ id: games.id });

			const locationIds: string[] = [];
			for (const loc of def.locations) {
				const parentId = 'parent' in loc ? (locationIds[loc.parent as number] ?? null) : null;
				const [inserted] = await db
					.insert(locations)
					.values({ gameId: game.id, name: loc.name, description: loc.description, parentId })
					.returning({ id: locations.id });
				locationIds.push(inserted.id);
			}

			await db.insert(skillTypes).values(
				def.skillTypes.map((st) => ({
					gameId: game.id,
					name: st.name,
					description: st.description
				}))
			);

			await db.insert(itemTypes).values(
				def.itemTypes.map((it) => ({
					gameId: game.id,
					name: it.name,
					description: it.description,
					trackingMode: it.trackingMode,
					maxDurability: 'maxDurability' in it ? it.maxDurability : null,
					weight: it.weight
				}))
			);

			await db.insert(characters).values(
				def.chars.map(char => ({
					userId: char.userId,
					gameId: game.id,
					name: char.name,
					gender: char.gender,
					age: char.age,
					prehistory: char.prehistory,
					vitals: char.vitals,
					stats: char.stats,
					status: 'approved' as const
				}))
			);

			console.log(`  ✓ ${def.name}`);
		})
	].flat(1));

	console.log('Done.');
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
