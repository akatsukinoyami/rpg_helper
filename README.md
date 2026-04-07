# RPG Helper

## Setup

Before running the project, you need to prepare the environment and database.

### 1. Install dependencies

```bash
bun install
```

### 2. Start the database

The project uses PostgreSQL via Docker:

```bash
docker compose up -d
```

After startup, the database will be available locally.

---

### 3. Configure environment variables

Copy the example `.env` file:

```bash
mv .env.example .env
```

Open `.env` and fill in the values:

```env
DATABASE_URL=postgres://user:password@localhost:5432/rpg_helper
BETTER_AUTH_SECRET=change-me-to-a-random-secret-32-chars-min
BETTER_AUTH_URL=https://localhost:5173
```

#### Environment variables

* **DATABASE_URL** — PostgreSQL connection string
* **BETTER_AUTH_SECRET** — Better Auth secret (minimum 32 characters)
* **BETTER_AUTH_URL** — Application URL

---

### 4. Run migrations

After configuring the database, run:

```bash
bun db:migrate
```

This will create all required tables.

---

## Developing

Once setup is complete, start the development server:

```bash
bun run dev
```

Or open automatically in a browser:

```bash
bun run dev -- --open
```

By default, the app will be available at:

```url
http://localhost:5173
```

---

## Building

Create a production build:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

---

## Database

Useful commands:

```bash
# Start database
docker compose up -d

# Stop database
docker compose down

# Recreate database
docker compose down -v
docker compose up -d

# Open Drizzle DB Studio
bun db:studio

# Install seeds (test games, accounts etc)
bun db:seed
```

---

## Requirements

* Bun
* Docker
* Docker Compose
* Node 18+ (optional, if required by tooling)

---

## Quick Start

After cloning the repository:

```bash
bun install
docker compose up -d
mv .env.example .env
bun db:migrate
bun run dev
```

Technologies Used

* Svelte / SvelteKit — Frontend framework and full-stack application framework
* Drizzle ORM — Type-safe ORM for working with PostgreSQL
* PostgreSQL — Primary relational database
* Tailwind CSS — Utility-first CSS framework for styling
* Biome — Linter and formatter for consistent code quality
* Paraglide — Internationalization (i18n) and localization
* BetterAuth — Authentication and session management
* Sharp — High-performance image processing
