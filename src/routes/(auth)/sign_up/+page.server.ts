import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData()
		const name = form.get('name') as string
		const email = form.get('email') as string
		const password = form.get('password') as string

		const response = await fetch('/api/auth/sign-up/email', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name, email, password })
		})

		if (!response.ok) {
			const body = await response.json().catch(() => null)
			const code = body?.code

			if (code === 'USER_ALREADY_EXISTS') {
				return fail(400, { error: 'email_taken' })
			}

			return fail(400, { error: 'generic' })
		}

		redirect(303, '/games')
	}
}
