import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ fetch }) => {
		await fetch('/api/auth/sign-out', { method: 'POST' })
		redirect(303, '/login')
	}
}
