import { relations } from 'drizzle-orm';
import {
	boolean,
	integer,
	jsonb,
	numeric,
	pgEnum,
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

export interface Stats {
	str: number;
	dex: number;
	con: number;
	int: number;
	wis: number;
	cha: number;
};

export interface ItemEffect {
	stat?: keyof Stats;
	modifier?: number;
	description?: string;
};

export interface DiceResult {
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
	hpLabel: varchar('hp_label', { length: 50 }).default('HP').notNull(),
	mpLabel: varchar('mp_label', { length: 50 }).default('MP').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const races = pgTable('races', {
	id: uuid('id').primaryKey().defaultRandom(),
	gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	image: text('image'),
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
	hp: integer('hp').default(0).notNull(),
	maxHp: integer('max_hp').default(0).notNull(),
	mp: integer('mp').default(0).notNull(),
	maxMp: integer('max_mp').default(0).notNull(),
	currentLocationId: uuid('current_location_id').references(() => locations.id, {
		onDelete: 'set null'
	}),
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
	messageId: uuid('message_id')
		.notNull()
		.references(() => messages.id, { onDelete: 'cascade' }),
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
// Locations
// ---------------------------------------------------------------------------

export const locations = pgTable('locations', {
	id: uuid('id').primaryKey().defaultRandom(),
	gameId: uuid('game_id')
		.notNull()
		.references(() => games.id, { onDelete: 'cascade' }),
	parentId: uuid('parent_id'), // self-ref FK added in migration SQL
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	image: text('image'),
	hidden: boolean('hidden').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export const moves = pgTable('moves', {
	id: uuid('id').primaryKey().defaultRandom(),
	characterId: uuid('character_id')
		.notNull()
		.references(() => characters.id, { onDelete: 'cascade' }),
	fromLocationId: uuid('from_location_id')
		.notNull()
		.references(() => locations.id, { onDelete: 'cascade' }),
	toLocationId: uuid('to_location_id')
		.notNull()
		.references(() => locations.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const messages = pgTable('messages', {
	id: uuid('id').primaryKey().defaultRandom(),
	locationId: uuid('location_id')
		.notNull()
		.references(() => locations.id, { onDelete: 'cascade' }),
	moveId: uuid('move_id').references(() => moves.id, { onDelete: 'cascade' }),
	characterId: uuid('character_id').references(() => characters.id, { onDelete: 'set null' }),
	content: text('content'),
	replyToId: uuid('reply_to_id'), // self-ref FK added in migration SQL
	referencedCharIds: uuid('referenced_char_ids').array(),
	gmAnnotation: text('gm_annotation'),
	editedAt: timestamp('edited_at'),
	deletedAt: timestamp('deleted_at'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Stat change proposals
// ---------------------------------------------------------------------------

export const statFieldEnum = pgEnum('stat_field', ['hp', 'mp', 'maxHp', 'maxMp', 'str', 'dex', 'con', 'int', 'wis', 'cha']);
export const proposalStatusEnum = pgEnum('proposal_status', ['pending', 'approved', 'rejected']);

export const statProposals = pgTable('stat_proposals', {
	id: uuid('id').primaryKey().defaultRandom(),
	messageId: uuid('message_id')
		.notNull()
		.references(() => messages.id, { onDelete: 'cascade' }),
	characterId: uuid('character_id')
		.notNull()
		.references(() => characters.id, { onDelete: 'cascade' }),
	proposedBy: text('proposed_by')
		.notNull()
		.references(() => user.id),
	field: statFieldEnum('field').notNull(),
	delta: integer('delta').notNull(),
	reason: text('reason'),
	status: proposalStatusEnum('status').default('pending').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Item types + character inventory (game library)
// ---------------------------------------------------------------------------

export const trackingModeEnum = pgEnum('tracking_mode', ['durability', 'quantity']);

export const itemTypes = pgTable('item_types', {
	id: uuid('id').primaryKey().defaultRandom(),
	gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	image: text('image'),
	weight: numeric('weight', { precision: 10, scale: 3 }).default('0').notNull(),
	trackingMode: trackingModeEnum('tracking_mode').notNull(),
	maxDurability: integer('max_durability'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const charItems = pgTable('char_items', {
	id: uuid('id').primaryKey().defaultRandom(),
	characterId: uuid('character_id')
		.notNull()
		.references(() => characters.id, { onDelete: 'cascade' }),
	itemTypeId: uuid('item_type_id')
		.notNull()
		.references(() => itemTypes.id, { onDelete: 'cascade' }),
	durability: integer('durability'),
	quantity: integer('quantity'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Item change proposals
// ---------------------------------------------------------------------------

export const itemProposals = pgTable('item_proposals', {
	id: uuid('id').primaryKey().defaultRandom(),
	messageId: uuid('message_id')
		.notNull()
		.references(() => messages.id, { onDelete: 'cascade' }),
	characterId: uuid('character_id')
		.notNull()
		.references(() => characters.id, { onDelete: 'cascade' }),
	proposedBy: text('proposed_by')
		.notNull()
		.references(() => user.id),
	charItemId: uuid('char_item_id').references(() => charItems.id, { onDelete: 'set null' }),
	itemTypeId: uuid('item_type_id')
		.notNull()
		.references(() => itemTypes.id, { onDelete: 'cascade' }),
	deltaQty: integer('delta_qty'),
	deltaDur: integer('delta_dur'),
	reason: text('reason'),
	status: proposalStatusEnum('status').default('pending').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Skill types + character skills (game library)
// ---------------------------------------------------------------------------

export const skillTypes = pgTable('skill_types', {
	id: uuid('id').primaryKey().defaultRandom(),
	gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	image: text('image'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const charSkills = pgTable(
	'char_skills',
	{
		characterId: uuid('character_id')
			.notNull()
			.references(() => characters.id, { onDelete: 'cascade' }),
		skillTypeId: uuid('skill_type_id')
			.notNull()
			.references(() => skillTypes.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.characterId, t.skillTypeId] })]
);

// ---------------------------------------------------------------------------
// Skill proposals
// ---------------------------------------------------------------------------

export const skillActionEnum = pgEnum('skill_action', ['add', 'remove']);

export const skillProposals = pgTable('skill_proposals', {
	id: uuid('id').primaryKey().defaultRandom(),
	messageId: uuid('message_id')
		.notNull()
		.references(() => messages.id, { onDelete: 'cascade' }),
	characterId: uuid('character_id')
		.notNull()
		.references(() => characters.id, { onDelete: 'cascade' }),
	proposedBy: text('proposed_by')
		.notNull()
		.references(() => user.id),
	skillTypeId: uuid('skill_type_id')
		.notNull()
		.references(() => skillTypes.id, { onDelete: 'cascade' }),
	action: skillActionEnum('action').notNull(),
	reason: text('reason'),
	status: proposalStatusEnum('status').default('pending').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const gamesRelations = relations(games, ({ one, many }) => ({
	gm: one(user, { fields: [games.gmUserId], references: [user.id] }),
	characters: many(characters),
	locations: many(locations),
	itemTypes: many(itemTypes),
	skillTypes: many(skillTypes),
	diceRolls: many(diceRolls)
}));

export const racesRelations = relations(races, ({ one, many }) => ({
	game: one(games, { fields: [races.gameId], references: [games.id] }),
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
	currentLocation: one(locations, {
		fields: [characters.currentLocationId],
		references: [locations.id]
	}),
	characterSkills: many(characterSkills),
	characterItems: many(characterItems),
	charItems: many(charItems),
	charSkills: many(charSkills),
	moves: many(moves),
	statProposals: many(statProposals),
	itemProposals: many(itemProposals),
	skillProposals: many(skillProposals),
	messages: many(messages),
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
	message: one(messages, { fields: [diceRolls.messageId], references: [messages.id] }),
	game: one(games, { fields: [diceRolls.gameId], references: [games.id] }),
	user: one(user, { fields: [diceRolls.userId], references: [user.id] })
}));

export const movesRelations = relations(moves, ({ one, many }) => ({
	character: one(characters, { fields: [moves.characterId], references: [characters.id] }),
	fromLocation: one(locations, { fields: [moves.fromLocationId], references: [locations.id], relationName: 'moveFrom' }),
	toLocation: one(locations, { fields: [moves.toLocationId], references: [locations.id], relationName: 'moveTo' }),
	messages: many(messages)
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
	game: one(games, { fields: [locations.gameId], references: [games.id] }),
	parent: one(locations, {
		fields: [locations.parentId],
		references: [locations.id],
		relationName: 'locationTree'
	}),
	children: many(locations, { relationName: 'locationTree' }),
	messages: many(messages),
	characters: many(characters),
	movesFrom: many(moves, { relationName: 'moveFrom' }),
	movesTo: many(moves, { relationName: 'moveTo' })
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
	location: one(locations, { fields: [messages.locationId], references: [locations.id] }),
	character: one(characters, { fields: [messages.characterId], references: [characters.id] }),
	move: one(moves, { fields: [messages.moveId], references: [moves.id] }),
	replyTo: one(messages, {
		fields: [messages.replyToId],
		references: [messages.id],
		relationName: 'messageReplies'
	}),
	replies: many(messages, { relationName: 'messageReplies' }),
	statProposals: many(statProposals),
	itemProposals: many(itemProposals),
	skillProposals: many(skillProposals),
	diceRolls: many(diceRolls)
}));

export const statProposalsRelations = relations(statProposals, ({ one }) => ({
	message: one(messages, { fields: [statProposals.messageId], references: [messages.id] }),
	character: one(characters, { fields: [statProposals.characterId], references: [characters.id] }),
	proposedBy: one(user, { fields: [statProposals.proposedBy], references: [user.id] })
}));

export const itemTypesRelations = relations(itemTypes, ({ one, many }) => ({
	game: one(games, { fields: [itemTypes.gameId], references: [games.id] }),
	charItems: many(charItems),
	itemProposals: many(itemProposals)
}));

export const charItemsRelations = relations(charItems, ({ one }) => ({
	character: one(characters, { fields: [charItems.characterId], references: [characters.id] }),
	itemType: one(itemTypes, { fields: [charItems.itemTypeId], references: [itemTypes.id] })
}));

export const itemProposalsRelations = relations(itemProposals, ({ one }) => ({
	message: one(messages, { fields: [itemProposals.messageId], references: [messages.id] }),
	character: one(characters, { fields: [itemProposals.characterId], references: [characters.id] }),
	proposedBy: one(user, { fields: [itemProposals.proposedBy], references: [user.id] }),
	charItem: one(charItems, { fields: [itemProposals.charItemId], references: [charItems.id] }),
	itemType: one(itemTypes, { fields: [itemProposals.itemTypeId], references: [itemTypes.id] })
}));

export const skillProposalsRelations = relations(skillProposals, ({ one }) => ({
	message: one(messages, { fields: [skillProposals.messageId], references: [messages.id] }),
	character: one(characters, { fields: [skillProposals.characterId], references: [characters.id] }),
	proposedBy: one(user, { fields: [skillProposals.proposedBy], references: [user.id] }),
	skillType: one(skillTypes, { fields: [skillProposals.skillTypeId], references: [skillTypes.id] })
}));

export const skillTypesRelations = relations(skillTypes, ({ one, many }) => ({
	game: one(games, { fields: [skillTypes.gameId], references: [games.id] }),
	charSkills: many(charSkills),
	skillProposals: many(skillProposals)
}));

export const charSkillsRelations = relations(charSkills, ({ one }) => ({
	character: one(characters, { fields: [charSkills.characterId], references: [characters.id] }),
	skillType: one(skillTypes, { fields: [charSkills.skillTypeId], references: [skillTypes.id] })
}));
