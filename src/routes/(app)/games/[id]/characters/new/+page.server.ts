import { error, fail, redirect } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { characterSkills, characters, games, races } from '$lib/server/db/schema'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	const userId = locals.user!.id

	const game = await db
		.select({ id: games.id, name: games.name })
		.from(games)
		.where(eq(games.id, params.id))
		.limit(1)
		.then((r) => r[0])

	if (!game) error(404)

	// Redirect if already has a character
	const existing = await db
		.select({ id: characters.id })
		.from(characters)
		.where(and(eq(characters.gameId, params.id), eq(characters.userId, userId)))
		.limit(1)

	if (existing.length > 0) redirect(303, `/games/${params.id}`)

	const allRaces = await db.query.races.findMany({
		with: {
			raceSkills: {
				with: { skill: true }
			}
		}
	})

	return { game, races: allRaces }
}

export const actions: Actions = {
	default: async ({ locals, params, request }) => {
		const userId = locals.user!.id

		// Verify game exists
		const game = await db
			.select({ id: games.id })
			.from(games)
			.where(eq(games.id, params.id))
			.limit(1)
			.then((r) => r[0])

		if (!game) error(404)

		// Prevent duplicate characters
		const existing = await db
			.select({ id: characters.id })
			.from(characters)
			.where(and(eq(characters.gameId, params.id), eq(characters.userId, userId)))
			.limit(1)

		if (existing.length > 0) redirect(303, `/games/${params.id}`)

		const form = await request.formData()
		const name = (form.get('name') as string | null)?.trim() ?? ''
		const gender = (form.get('gender') as string) as 'male' | 'female' | 'none' | 'both'
		const raceId = (form.get('raceId') as string | null) || null
		const ageRaw = form.get('age') as string | null
		const age = ageRaw ? parseInt(ageRaw) : null
		const bodyDescription = (form.get('bodyDescription') as string | null)?.trim() || null
		const prehistory = (form.get('prehistory') as string | null)?.trim() || null

		if (!name) return fail(400, { error: 'name_required' })

		// Resolve race stats and starting skills
		let stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
		let skillIds: string[] = []

		if (raceId) {
			const race = await db.query.races.findFirst({
				where: eq(races.id, raceId),
				with: { raceSkills: true }
			})
			if (race) {
				stats = race.baseStats
				skillIds = race.raceSkills.map((rs) => rs.skillId)
			}
		}

		const [character] = await db
			.insert(characters)
			.values({ userId, gameId: params.id, raceId, name, gender, age, bodyDescription, prehistory, stats })
			.returning({ id: characters.id })

		if (skillIds.length > 0) {
			await db
				.insert(characterSkills)
				.values(skillIds.map((skillId) => ({ characterId: character.id, skillId })))
		}

		redirect(303, `/games/${params.id}`)
	}
}
