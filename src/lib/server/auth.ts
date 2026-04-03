import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { genericOAuth } from 'better-auth/plugins';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$env/static/private';
import { env } from '$env/dynamic/private';
import { db } from './db';
import { account, session, user, verification } from './db/schema';

interface StandardSocialProvider {
	clientId: string;
	clientSecret: string;
}

const socialProviders: Record<string, StandardSocialProvider> = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
	socialProviders.google = { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
}

if (env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET) {
	socialProviders.discord = { clientId: env.DISCORD_CLIENT_ID, clientSecret: env.DISCORD_CLIENT_SECRET };
}

const plugins: any[] = [username()];

if (env.TELEGRAM_CLIENT_ID && env.TELEGRAM_CLIENT_SECRET) {
	plugins.push(genericOAuth({ config: [
		{
			providerId: 'telegram',
			clientId: env.TELEGRAM_CLIENT_ID,
			clientSecret: env.TELEGRAM_CLIENT_SECRET,
			discoveryUrl: 'https://oauth.telegram.org/.well-known/openid-configuration',
			scopes: ['openid', 'profile'],
			pkce: true
		}
	]}));
}

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	trustedOrigins: [BETTER_AUTH_URL, BETTER_AUTH_URL.replace('localhost', '127.0.0.1')],
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: { user, session, account, verification }
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	},
	plugins,
	socialProviders
});
