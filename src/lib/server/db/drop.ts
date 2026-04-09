import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

async function index() {
	console.log('Dropping schema...');

	await client.unsafe(`
		DROP SCHEMA public CASCADE;
		CREATE SCHEMA public;
		DROP SCHEMA IF EXISTS drizzle CASCADE;
	`);

	console.log('Done!');
}

index();