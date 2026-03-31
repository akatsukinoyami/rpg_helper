import { json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { user } from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	const { name } = await request.json()
	const [found] = await db
		.select({ email: user.email })
		.from(user)
		.where(eq(user.name, name))
		.limit(1)

	// Always return 200 — don't reveal whether the name exists
	return json({ email: found?.email ?? null })
}
