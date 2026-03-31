import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData()
		const email = form.get('email') as string
		const password = form.get('password') as string

		const response = await fetch('/api/auth/sign-in/email', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email, password })
		})

		if (!response.ok) {
			return fail(400, { error: 'invalid_credentials' })
		}

		redirect(303, '/games')
	}
}
