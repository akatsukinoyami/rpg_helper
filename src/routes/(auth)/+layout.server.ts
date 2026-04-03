import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		oauthProviders: {
			google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
			discord: !!(env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET),
			telegram: !!(env.TELEGRAM_CLIENT_ID && env.TELEGRAM_CLIENT_SECRET)
		}
	};
};
