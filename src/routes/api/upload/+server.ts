import { error, json } from '@sveltejs/kit';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { RequestHandler } from './$types';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const VALID_UPLOAD_TYPES = new Set(['user', 'game', 'character', 'race', 'skill', 'item']);

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const form = await request.formData();
	const file = form.get('file');
	const uploadType = form.get('type');

	if (!(file instanceof File)) error(400, 'No file provided');
	if (!uploadType || typeof uploadType !== 'string' || !VALID_UPLOAD_TYPES.has(uploadType))
		error(400, 'Invalid type');
	if (!ALLOWED_TYPES.has(file.type))
		error(400, 'Invalid file type — only JPEG, PNG, WebP, GIF, AVIF allowed');
	if (file.size > MAX_SIZE) error(400, 'File too large — maximum 10 MB');

	const raw = Buffer.from(await file.arrayBuffer());

	// Resize: scale so the smallest dimension = 512, then centre-crop to 512×512
	const processed = await sharp(raw)
		.resize(512, 512, { fit: 'cover', position: 'centre' })
		.webp({ quality: 85 })
		.toBuffer();

	const filename = `${randomUUID()}.webp`;
	const uploadDir = join(process.cwd(), 'uploads', uploadType);

	await mkdir(uploadDir, { recursive: true });
	await writeFile(join(uploadDir, filename), processed);

	return json({ url: `/uploads/${uploadType}/${filename}` });
};
