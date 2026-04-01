import { error, json } from '@sveltejs/kit';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';

const ALLOWED_TYPES: Record<string, string> = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp',
	'image/gif': '.gif',
	'image/avif': '.avif'
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const VALID_UPLOAD_TYPES = new Set(['user', 'game', 'character']);

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const form = await request.formData();
	const file = form.get('file');
	const uploadType = form.get('type');

	if (!(file instanceof File)) error(400, 'No file provided');
	if (!uploadType || typeof uploadType !== 'string' || !VALID_UPLOAD_TYPES.has(uploadType))
		error(400, 'Invalid type');

	const ext = ALLOWED_TYPES[file.type];
	if (!ext) error(400, 'Invalid file type — only JPEG, PNG, WebP, GIF, AVIF allowed');
	if (file.size > MAX_SIZE) error(400, 'File too large — maximum 5 MB');

	const filename = `${randomUUID()}${ext}`;
	const uploadDir = join(process.cwd(), 'uploads', uploadType);

	await mkdir(uploadDir, { recursive: true });
	await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

	return json({ url: `/uploads/${uploadType}/${filename}` });
};
