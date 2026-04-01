import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { raceSkills, races, skills } from '../schema';
import { racesSeed } from './races';
import { skillsSeed } from './skills';

const db = drizzle(postgres(process.env.DATABASE_URL!), { schema: { races, raceSkills, skills } });


async function seed() {
	console.log('Seeding skills...');
	const insertedSkills = await db
		.insert(skills)
		.values(skillsSeed)
		.onConflictDoNothing()
		.returning({ id: skills.id, name: skills.name });

	// Map by English name for linking to races
	const skillMap = new Map(insertedSkills.map((s) => [s.name.en, s.id]));

	console.log('Seeding races...');
	for (const { startingSkills, ...raceData } of racesSeed) {
		const [race] = await db
			.insert(races)
			.values(raceData)
			.onConflictDoNothing()
			.returning({ id: races.id });

		if (!race) continue;

		const raceSkillRows = startingSkills
			.map((name) => skillMap.get(name))
			.filter((id): id is string => !!id)
			.map((skillId) => ({ raceId: race.id, skillId }));

		if (raceSkillRows.length > 0) {
			await db.insert(raceSkills).values(raceSkillRows).onConflictDoNothing();
		}
	}

	console.log('Done.');
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
