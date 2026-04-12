CREATE TYPE "public"."proposal_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."skill_action" AS ENUM('add', 'remove');--> statement-breakpoint
CREATE TYPE "public"."tracking_mode" AS ENUM('durability', 'quantity');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "char_items" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"item_type_id" text NOT NULL,
	"durability" integer,
	"quantity" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "char_skills" (
	"character_id" text NOT NULL,
	"skill_type_id" text NOT NULL,
	CONSTRAINT "char_skills_character_id_skill_type_id_pk" PRIMARY KEY("character_id","skill_type_id")
);
--> statement-breakpoint
CREATE TABLE "character_edit_proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"patch" jsonb NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_items" (
	"character_id" text NOT NULL,
	"item_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "character_items_character_id_item_id_pk" PRIMARY KEY("character_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "character_skills" (
	"character_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "character_skills_character_id_skill_id_pk" PRIMARY KEY("character_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "character_visibility" (
	"character_id" text NOT NULL,
	"visible_to_character_id" text NOT NULL,
	"show_name" boolean DEFAULT false NOT NULL,
	"show_age" boolean DEFAULT false NOT NULL,
	"show_race" boolean DEFAULT false NOT NULL,
	"show_stats" boolean DEFAULT false NOT NULL,
	"show_history" boolean DEFAULT false NOT NULL,
	"show_skills" boolean DEFAULT false NOT NULL,
	"show_inventory" boolean DEFAULT false NOT NULL,
	CONSTRAINT "character_visibility_character_id_visible_to_character_id_pk" PRIMARY KEY("character_id","visible_to_character_id")
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"game_id" text NOT NULL,
	"race_id" text,
	"name" varchar(100) NOT NULL,
	"gender" varchar DEFAULT 'none' NOT NULL,
	"age" integer,
	"image" text,
	"body_description" text,
	"prehistory" text,
	"vitals" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"current_location_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dice_rolls" (
	"id" text PRIMARY KEY NOT NULL,
	"message_location_id" text NOT NULL,
	"message_id" integer NOT NULL,
	"message_ref" text GENERATED ALWAYS AS (message_location_id || '#' || message_id::text) STORED,
	"game_id" text NOT NULL,
	"user_id" text NOT NULL,
	"expression" varchar(50) NOT NULL,
	"results" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image" text,
	"gm_user_id" text NOT NULL,
	"stat_defs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"message_location_id" text NOT NULL,
	"message_id" integer NOT NULL,
	"message_ref" text GENERATED ALWAYS AS (message_location_id || '#' || message_id::text) STORED,
	"character_id" text NOT NULL,
	"proposed_by" text NOT NULL,
	"char_item_id" text,
	"item_type_id" text NOT NULL,
	"delta_qty" integer,
	"delta_dur" integer,
	"reason" text,
	"status" "proposal_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_types" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image" text,
	"weight" numeric(10, 3) DEFAULT '0' NOT NULL,
	"tracking_mode" "tracking_mode" NOT NULL,
	"max_durability" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"type" varchar NOT NULL,
	"effect" jsonb,
	"value" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"parent_id" text,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"location_id" text NOT NULL,
	"id" integer NOT NULL,
	"ref" text GENERATED ALWAYS AS (location_id || '#' || id::text) STORED,
	"move_id" text,
	"character_id" text,
	"content" text,
	"reply_to_id" integer,
	"reply_ref" text GENERATED ALWAYS AS (CASE WHEN reply_to_id IS NOT NULL THEN location_id || '#' || reply_to_id::text ELSE NULL END) STORED,
	"referenced_char_ids" text[],
	"gm_annotation" text,
	"edited_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "messages_location_id_id_pk" PRIMARY KEY("location_id","id")
);
--> statement-breakpoint
CREATE TABLE "moves" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"from_location_id" text NOT NULL,
	"to_location_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_skills" (
	"race_id" text NOT NULL,
	"skill_id" text NOT NULL,
	CONSTRAINT "race_skills_race_id_skill_id_pk" PRIMARY KEY("race_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image" text,
	"base_stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "skill_proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"message_location_id" text NOT NULL,
	"message_id" integer NOT NULL,
	"message_ref" text GENERATED ALWAYS AS (message_location_id || '#' || message_id::text) STORED,
	"character_id" text NOT NULL,
	"proposed_by" text NOT NULL,
	"skill_type_id" text NOT NULL,
	"action" "skill_action" NOT NULL,
	"reason" text,
	"status" "proposal_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_types" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" text PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"stat_modifiers" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stat_proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"message_location_id" text NOT NULL,
	"message_id" integer NOT NULL,
	"message_ref" text GENERATED ALWAYS AS (message_location_id || '#' || message_id::text) STORED,
	"character_id" text NOT NULL,
	"proposed_by" text NOT NULL,
	"field" varchar(50) NOT NULL,
	"delta" integer NOT NULL,
	"reason" text,
	"status" "proposal_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "char_items" ADD CONSTRAINT "char_items_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "char_items" ADD CONSTRAINT "char_items_item_type_id_item_types_id_fk" FOREIGN KEY ("item_type_id") REFERENCES "public"."item_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "char_skills" ADD CONSTRAINT "char_skills_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "char_skills" ADD CONSTRAINT "char_skills_skill_type_id_skill_types_id_fk" FOREIGN KEY ("skill_type_id") REFERENCES "public"."skill_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_edit_proposals" ADD CONSTRAINT "character_edit_proposals_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_items" ADD CONSTRAINT "character_items_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_items" ADD CONSTRAINT "character_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_visibility" ADD CONSTRAINT "character_visibility_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_visibility" ADD CONSTRAINT "character_visibility_visible_to_character_id_characters_id_fk" FOREIGN KEY ("visible_to_character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_current_location_id_locations_id_fk" FOREIGN KEY ("current_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_message_location_id_message_id_messages_location_id_id_fk" FOREIGN KEY ("message_location_id","message_id") REFERENCES "public"."messages"("location_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_gm_user_id_user_id_fk" FOREIGN KEY ("gm_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_proposals" ADD CONSTRAINT "item_proposals_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_proposals" ADD CONSTRAINT "item_proposals_proposed_by_user_id_fk" FOREIGN KEY ("proposed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_proposals" ADD CONSTRAINT "item_proposals_char_item_id_char_items_id_fk" FOREIGN KEY ("char_item_id") REFERENCES "public"."char_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_proposals" ADD CONSTRAINT "item_proposals_item_type_id_item_types_id_fk" FOREIGN KEY ("item_type_id") REFERENCES "public"."item_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_proposals" ADD CONSTRAINT "item_proposals_message_location_id_message_id_messages_location_id_id_fk" FOREIGN KEY ("message_location_id","message_id") REFERENCES "public"."messages"("location_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_types" ADD CONSTRAINT "item_types_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_location_id_reply_to_id_messages_location_id_id_fk" FOREIGN KEY ("location_id","reply_to_id") REFERENCES "public"."messages"("location_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moves" ADD CONSTRAINT "moves_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moves" ADD CONSTRAINT "moves_from_location_id_locations_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moves" ADD CONSTRAINT "moves_to_location_id_locations_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_skills" ADD CONSTRAINT "race_skills_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_skills" ADD CONSTRAINT "race_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_proposals" ADD CONSTRAINT "skill_proposals_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_proposals" ADD CONSTRAINT "skill_proposals_proposed_by_user_id_fk" FOREIGN KEY ("proposed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_proposals" ADD CONSTRAINT "skill_proposals_skill_type_id_skill_types_id_fk" FOREIGN KEY ("skill_type_id") REFERENCES "public"."skill_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_proposals" ADD CONSTRAINT "skill_proposals_message_location_id_message_id_messages_location_id_id_fk" FOREIGN KEY ("message_location_id","message_id") REFERENCES "public"."messages"("location_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_types" ADD CONSTRAINT "skill_types_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stat_proposals" ADD CONSTRAINT "stat_proposals_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stat_proposals" ADD CONSTRAINT "stat_proposals_proposed_by_user_id_fk" FOREIGN KEY ("proposed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stat_proposals" ADD CONSTRAINT "stat_proposals_message_location_id_message_id_messages_location_id_id_fk" FOREIGN KEY ("message_location_id","message_id") REFERENCES "public"."messages"("location_id","id") ON DELETE cascade ON UPDATE no action;