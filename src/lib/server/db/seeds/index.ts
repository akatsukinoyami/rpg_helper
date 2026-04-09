import { hashPassword } from 'better-auth/crypto';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import {
	account,
	characters,
	charItems,
	charSkills,
	characterEditProposals,
	characterItems,
	characterSkills,
	characterVisibility,
	diceRolls,
	games,
	itemProposals,
	itemTypes,
	items,
	locations,
	messages,
	raceSkills,
	races,
	session,
	skillTypes,
	skills,
	statProposals,
	user,
	verification
} from '../schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const USERS = [
	{ id: 'user-aleksey', name: 'Алексей', email: 'aleksey@test.com', password: 'test1234' },
	{ id: 'user-mariya', name: 'Мария', email: 'mariya@test.com', password: 'test1234' },
	{ id: 'user-dmitriy', name: 'Дмитрий', email: 'dmitriy@test.com', password: 'test1234' }
];

// Game 1 – Nordic fantasy, GM: Алексей
const GAME1 = {
	name: 'Хроники Арктики',
	description: 'Суровый север, где боги ещё не покинули смертных.',
	hpLabel: 'Здоровье',
	mpLabel: 'Мана',
	skillTypes: [
		{ name: 'Владение мечом', description: 'Атаки холодным оружием ближнего боя' },
		{ name: 'Магия льда', description: 'Управление холодом и зимними стихиями' },
		{ name: 'Выживание в тундре', description: 'Ориентирование и добыча пищи на севере' },
		{ name: 'Охота', description: 'Отслеживание и добыча дичи' }
	],
	itemTypes: [
		{
			name: 'Меч викинга',
			description: 'Широкий железный меч',
			trackingMode: 'durability' as const,
			maxDurability: 100,
			weight: '3.5'
		},
		{
			name: 'Меховой плащ',
			description: 'Тёплый плащ из медвежьей шкуры',
			trackingMode: 'durability' as const,
			maxDurability: 60,
			weight: '2.0'
		},
		{
			name: 'Золотые монеты',
			description: 'Местная валюта',
			trackingMode: 'quantity' as const,
			weight: '0.01'
		},
		{
			name: 'Целебное зелье',
			description: 'Восстанавливает здоровье',
			trackingMode: 'quantity' as const,
			weight: '0.3'
		}
	],
	locations: [
		{ name: 'Хроники Арктики', description: 'Корень мира', parentId: null },
		{ name: 'Деревня Фьорда', description: 'Небольшое поселение у замёрзшего залива', parent: 0 }
	],
	// chars: [{ userId, name, gender, age, stats, hp, maxHp, mp, maxMp }]
	chars: [
		{
			userId: 'user-aleksey',
			name: 'Эрик Снежный',
			gender: 'male' as const,
			age: 28,
			prehistory: 'Северный воин, потерявший свой клан в битве с морозными великанами.',
			stats: { str: 14, dex: 10, con: 13, int: 9, wis: 10, cha: 8 },
			hp: 42,
			maxHp: 42,
			mp: 10,
			maxMp: 10
		},
		{
			userId: 'user-mariya',
			name: 'Фрея Ледяная',
			gender: 'female' as const,
			age: 24,
			prehistory: 'Молодая жрица богини зимы, ищущая артефакт своего ордена.',
			stats: { str: 7, dex: 12, con: 9, int: 14, wis: 13, cha: 11 },
			hp: 28,
			maxHp: 28,
			mp: 35,
			maxMp: 35
		}
	]
};

// Game 2 – Dark naval fantasy, GM: Мария
const GAME2 = {
	name: 'Тёмные воды',
	description: 'Пиратские моря, где каждый порт таит опасность.',
	hpLabel: 'Стойкость',
	mpLabel: 'Воля',
	skillTypes: [
		{ name: 'Мореплавание', description: 'Управление кораблём и навигация' },
		{ name: 'Фехтование', description: 'Искусство владения клинком' },
		{ name: 'Контрабанда', description: 'Тайная перевозка запрещённых товаров' },
		{ name: 'Запугивание', description: 'Принудить к подчинению угрозами' }
	],
	itemTypes: [
		{
			name: 'Абордажная сабля',
			description: 'Кривой клинок морского разбойника',
			trackingMode: 'durability' as const,
			maxDurability: 80,
			weight: '1.8'
		},
		{
			name: 'Ром',
			description: 'Крепкий напиток из тростника',
			trackingMode: 'quantity' as const,
			weight: '0.5'
		},
		{
			name: 'Золото',
			description: 'Универсальная валюта портов',
			trackingMode: 'quantity' as const,
			weight: '0.01'
		},
		{
			name: 'Морской компас',
			description: 'Точный инструмент навигатора',
			trackingMode: 'durability' as const,
			maxDurability: 200,
			weight: '0.2'
		}
	],
	locations: [
		{ name: 'Тёмные воды', description: 'Корень мира', parentId: null },
		{ name: 'Порт Костяной якорь', description: 'Мрачный портовый город пиратов', parent: 0 }
	],
	chars: [
		{
			userId: 'user-mariya',
			name: 'Капитан Морган',
			gender: 'none' as const,
			age: 35,
			prehistory: 'Легендарный пират, захвативший семь торговых флотилий.',
			stats: { str: 12, dex: 13, con: 11, int: 12, wis: 9, cha: 14 },
			hp: 38,
			maxHp: 38,
			mp: 15,
			maxMp: 15
		},
		{
			userId: 'user-dmitriy',
			name: 'Чёрная Роза',
			gender: 'female' as const,
			age: 22,
			prehistory: 'Беглянка из знатного дома, нашедшая свободу на море.',
			stats: { str: 9, dex: 16, con: 9, int: 11, wis: 11, cha: 13 },
			hp: 30,
			maxHp: 30,
			mp: 20,
			maxMp: 20
		}
	]
};

// Game 3 – Post-apocalyptic, GM: Дмитрий
const GAME3 = {
	name: 'Пустошь',
	description: 'Мир после катастрофы. Выживание — единственный закон.',
	hpLabel: 'Живучесть',
	mpLabel: 'Концентрация',
	skillTypes: [
		{ name: 'Стрельба', description: 'Владение огнестрельным и метательным оружием' },
		{ name: 'Взлом', description: 'Открытие замков и электронных замков' },
		{ name: 'Медицина пустоши', description: 'Лечение ран подручными средствами' },
		{ name: 'Торговля хламом', description: 'Обмен мусором по выгодному курсу' }
	],
	itemTypes: [
		{
			name: 'Самодельный пистолет',
			description: 'Ненадёжный, но смертоносный',
			trackingMode: 'durability' as const,
			maxDurability: 50,
			weight: '0.9'
		},
		{
			name: 'Консервы',
			description: 'Единственная еда в пустоши',
			trackingMode: 'quantity' as const,
			weight: '0.4'
		},
		{
			name: 'Аптечка',
			description: 'Остатки довоенной медицины',
			trackingMode: 'quantity' as const,
			weight: '0.6'
		},
		{
			name: 'Металлолом',
			description: 'Валюта пустоши',
			trackingMode: 'quantity' as const,
			weight: '0.1'
		}
	],
	locations: [
		{ name: 'Пустошь', description: 'Корень мира', parentId: null },
		{ name: 'Руины Старого Города', description: 'Обломки некогда великого мегаполиса', parent: 0 }
	],
	chars: [
		{
			userId: 'user-dmitriy',
			name: 'Рустам Отшельник',
			gender: 'male' as const,
			age: 45,
			prehistory: 'Бывший военный инженер, выживший в бункере двадцать лет.',
			stats: { str: 11, dex: 10, con: 14, int: 15, wis: 13, cha: 7 },
			hp: 45,
			maxHp: 45,
			mp: 25,
			maxMp: 25
		},
		{
			userId: 'user-aleksey',
			name: 'Надя Странница',
			gender: 'female' as const,
			age: 19,
			prehistory: 'Выросла среди руин, научилась выживать раньше, чем ходить.',
			stats: { str: 9, dex: 15, con: 10, int: 10, wis: 12, cha: 10 },
			hp: 32,
			maxHp: 32,
			mp: 18,
			maxMp: 18
		}
	]
};

const GAMES = [
	{ def: GAME1, gmUserId: 'user-aleksey' },
	{ def: GAME2, gmUserId: 'user-mariya' },
	{ def: GAME3, gmUserId: 'user-dmitriy' }
];

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

	console.log('Creating users...');
	const now = new Date();
	for (const u of USERS) {
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
	}

	console.log('Seeding races & skills...');
	const { racesSeed } = await import('./races');
	const { skillsSeed } = await import('./skills');

	const insertedSkills = await db
		.insert(skills)
		.values(skillsSeed)
		.onConflictDoNothing()
		.returning({ id: skills.id, name: skills.name });
	const skillMap = new Map(insertedSkills.map((s) => [s.name.en, s.id]));

	for (const { startingSkills, ...raceData } of racesSeed) {
		const [race] = await db
			.insert(races)
			.values(raceData)
			.onConflictDoNothing()
			.returning({ id: races.id });
		if (!race) continue;
		const links = startingSkills
			.map((n) => skillMap.get(n))
			.filter((id): id is string => !!id)
			.map((skillId) => ({ raceId: race.id, skillId }));
		if (links.length) await db.insert(raceSkills).values(links).onConflictDoNothing();
	}

	console.log('Seeding games...');
	for (const { def, gmUserId } of GAMES) {
		const [game] = await db
			.insert(games)
			.values({
				name: def.name,
				description: def.description,
				gmUserId,
				hpLabel: def.hpLabel,
				mpLabel: def.mpLabel
			})
			.returning({ id: games.id });

		// Locations
		const locationIds: string[] = [];
		for (const loc of def.locations) {
			const parentId = 'parent' in loc ? (locationIds[loc.parent as number] ?? null) : null;
			const [inserted] = await db
				.insert(locations)
				.values({ gameId: game.id, name: loc.name, description: loc.description, parentId })
				.returning({ id: locations.id });
			locationIds.push(inserted.id);
		}

		// Skill types
		await db.insert(skillTypes).values(
			def.skillTypes.map((st) => ({
				gameId: game.id,
				name: st.name,
				description: st.description
			}))
		);

		// Item types
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

		// Characters (both approved)
		for (const char of def.chars) {
			await db.insert(characters).values({
				userId: char.userId,
				gameId: game.id,
				name: char.name,
				gender: char.gender,
				age: char.age,
				prehistory: char.prehistory,
				stats: char.stats,
				status: 'approved',
				hp: char.hp,
				maxHp: char.maxHp,
				mp: char.mp,
				maxMp: char.maxMp
			});
		}

		console.log(`  ✓ ${def.name}`);
	}

	console.log('Done.');
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
