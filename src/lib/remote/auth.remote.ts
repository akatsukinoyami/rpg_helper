import { command } from '$app/server';
import * as v from 'valibot';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export const resolveLogin = command(
	v.object({ name: v.pipe(v.string(), v.trim(), v.minLength(1)) }),
	async ({ name }: { name: string }) => {
		const [found] = await db
			.select({ email: user.email })
			.from(user)
			.where(eq(user.name, name))
			.limit(1);

		// Always return — don't reveal whether the name exists
		return { email: found?.email ?? null };
	}
);
