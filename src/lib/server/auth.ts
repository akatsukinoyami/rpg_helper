import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$env/static/private';
import { db } from './db';
import { account, session, user, verification } from './db/schema';

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: { user, session, account, verification }
	}),
	plugins: [username()],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	}
	// socialProviders: {
	//   google: {
	//     clientId: GOOGLE_CLIENT_ID,
	//     clientSecret: GOOGLE_CLIENT_SECRET,
	//   },
	// },
});
