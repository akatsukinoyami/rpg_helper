import { relations } from 'drizzle-orm';
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type Stats = {
	str: number;
	dex: number;
	con: number;
	int: number;
	wis: number;
	cha: number;
};

export type ItemEffect = {
	stat?: keyof Stats;
	modifier?: number;
	description?: string;
};

export type DiceResult = {
	dice: number[];
	modifier: number;
	total: number;
};

export type Locale = 'en' | 'ru' | 'ua';
export type LocalizedText = Partial<Record<Locale, string>>;

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

// ---------------------------------------------------------------------------
// App tables
// ---------------------------------------------------------------------------

export const games = pgTable('games', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	image: text('image'),
	gmUserId: text('gm_user_id')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const races = pgTable('races', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: jsonb('name').$type<LocalizedText>().notNull(),
	description: jsonb('description').$type<LocalizedText>(),
	baseStats: jsonb('base_stats').$type<Stats>().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const skills = pgTable('skills', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: jsonb('name').$type<LocalizedText>().notNull(),
	description: jsonb('description').$type<LocalizedText>(),
	statModifiers: jsonb('stat_modifiers').$type<Partial<Stats>>(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const raceSkills = pgTable(
	'race_skills',
	{
		raceId: uuid('race_id')
			.notNull()
			.references(() => races.id, { onDelete: 'cascade' }),
		skillId: uuid('skill_id')
			.notNull()
			.references(() => skills.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.raceId, t.skillId] })]
);

export const items = pgTable('items', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: jsonb('name').$type<LocalizedText>().notNull(),
	description: jsonb('description').$type<LocalizedText>(),
	type: varchar('type', { enum: ['usable', 'sellable', 'both'] }).notNull(),
	effect: jsonb('effect').$type<ItemEffect>(),
	value: integer('value').default(0).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const characters = pgTable('characters', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	gameId: uuid('game_id')
		.notNull()
		.references(() => games.id, { onDelete: 'cascade' }),
	raceId: uuid('race_id').references(() => races.id, { onDelete: 'set null' }),
	name: varchar('name', { length: 100 }).notNull(),
	gender: varchar('gender', { enum: ['male', 'female', 'none', 'both'] })
		.default('none')
		.notNull(),
	age: integer('age'),
	image: text('image'),
	bodyDescription: text('body_description'),
	prehistory: text('prehistory'),
	stats: jsonb('stats').$type<Stats>().notNull(),
	status: varchar('status', { enum: ['pending', 'approved', 'rejected'] })
		.default('pending')
		.notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const characterSkills = pgTable(
	'character_skills',
	{
		characterId: uuid('character_id')
			.notNull()
			.references(() => characters.id, { onDelete: 'cascade' }),
		skillId: uuid('skill_id')
			.notNull()
			.references(() => skills.id, { onDelete: 'cascade' }),
		level: integer('level').default(1).notNull()
	},
	(t) => [primaryKey({ columns: [t.characterId, t.skillId] })]
);

export const characterItems = pgTable(
	'character_items',
	{
		characterId: uuid('character_id')
			.notNull()
			.references(() => characters.id, { onDelete: 'cascade' }),
		itemId: uuid('item_id')
			.notNull()
			.references(() => items.id, { onDelete: 'cascade' }),
		quantity: integer('quantity').default(1).notNull()
	},
	(t) => [primaryKey({ columns: [t.characterId, t.itemId] })]
);

export const characterEditProposals = pgTable('character_edit_proposals', {
	id: uuid('id').primaryKey().defaultRandom(),
	characterId: uuid('character_id')
		.notNull()
		.references(() => characters.id, { onDelete: 'cascade' }),
	patch: jsonb('patch').notNull(),
	status: varchar('status', { enum: ['pending', 'approved', 'rejected'] })
		.default('pending')
		.notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Which fields of `characterId` are visible to `visibleToCharacterId`.
// A row only exists when the GM explicitly grants visibility.
// body_description is always visible and never stored here.
export const characterVisibility = pgTable(
	'character_visibility',
	{
		characterId: uuid('character_id')
			.notNull()
			.references(() => characters.id, { onDelete: 'cascade' }),
		visibleToCharacterId: uuid('visible_to_character_id')
			.notNull()
			.references(() => characters.id, { onDelete: 'cascade' }),
		showName: boolean('show_name').default(false).notNull(),
		showAge: boolean('show_age').default(false).notNull(),
		showRace: boolean('show_race').default(false).notNull(),
		showStats: boolean('show_stats').default(false).notNull(),
		showHistory: boolean('show_history').default(false).notNull(),
		showSkills: boolean('show_skills').default(false).notNull(),
		showInventory: boolean('show_inventory').default(false).notNull()
	},
	(t) => [primaryKey({ columns: [t.characterId, t.visibleToCharacterId] })]
);

export const diceRolls = pgTable('dice_rolls', {
	id: uuid('id').primaryKey().defaultRandom(),
	gameId: uuid('game_id')
		.notNull()
		.references(() => games.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expression: varchar('expression', { length: 50 }).notNull(),
	results: jsonb('results').$type<DiceResult>().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const gamesRelations = relations(games, ({ one, many }) => ({
	gm: one(user, { fields: [games.gmUserId], references: [user.id] }),
	characters: many(characters),
	diceRolls: many(diceRolls)
}));

export const racesRelations = relations(races, ({ many }) => ({
	raceSkills: many(raceSkills),
	characters: many(characters)
}));

export const skillsRelations = relations(skills, ({ many }) => ({
	raceSkills: many(raceSkills),
	characterSkills: many(characterSkills)
}));

export const raceSkillsRelations = relations(raceSkills, ({ one }) => ({
	race: one(races, { fields: [raceSkills.raceId], references: [races.id] }),
	skill: one(skills, { fields: [raceSkills.skillId], references: [skills.id] })
}));

export const itemsRelations = relations(items, ({ many }) => ({
	characterItems: many(characterItems)
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
	user: one(user, { fields: [characters.userId], references: [user.id] }),
	game: one(games, { fields: [characters.gameId], references: [games.id] }),
	race: one(races, { fields: [characters.raceId], references: [races.id] }),
	characterSkills: many(characterSkills),
	characterItems: many(characterItems),
	editProposals: many(characterEditProposals),
	// Fields this character exposes to others
	visibilityGranted: many(characterVisibility, { relationName: 'visibilitySource' }),
	// Fields other characters expose to this character
	visibilityReceived: many(characterVisibility, { relationName: 'visibilityTarget' })
}));

export const characterSkillsRelations = relations(characterSkills, ({ one }) => ({
	character: one(characters, {
		fields: [characterSkills.characterId],
		references: [characters.id]
	}),
	skill: one(skills, { fields: [characterSkills.skillId], references: [skills.id] })
}));

export const characterItemsRelations = relations(characterItems, ({ one }) => ({
	character: one(characters, {
		fields: [characterItems.characterId],
		references: [characters.id]
	}),
	item: one(items, { fields: [characterItems.itemId], references: [items.id] })
}));

export const characterEditProposalsRelations = relations(characterEditProposals, ({ one }) => ({
	character: one(characters, {
		fields: [characterEditProposals.characterId],
		references: [characters.id]
	})
}));

export const characterVisibilityRelations = relations(characterVisibility, ({ one }) => ({
	character: one(characters, {
		fields: [characterVisibility.characterId],
		references: [characters.id],
		relationName: 'visibilitySource'
	}),
	visibleTo: one(characters, {
		fields: [characterVisibility.visibleToCharacterId],
		references: [characters.id],
		relationName: 'visibilityTarget'
	})
}));

export const diceRollsRelations = relations(diceRolls, ({ one }) => ({
	game: one(games, { fields: [diceRolls.gameId], references: [games.id] }),
	user: one(user, { fields: [diceRolls.userId], references: [user.id] })
}));
