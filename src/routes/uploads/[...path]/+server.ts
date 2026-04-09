import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import type { RequestHandler } from './$types';

const MIME: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.avif': 'image/avif'
};

export const GET: RequestHandler = async ({ params }) => {
	const uploadsRoot = join(process.cwd(), 'uploads');
	const filePath = resolve(uploadsRoot, params.path);

	// Prevent path traversal
	if (!filePath.startsWith(uploadsRoot + '/')) error(403, 'Forbidden');

	const ext = extname(filePath).toLowerCase();
	const contentType = MIME[ext];
	if (!contentType) error(400, 'Unsupported file type');

	let data: Buffer;
	try {
		data = await readFile(filePath);
	} catch {
		error(404, 'Not found');
	}

	return new Response(data.buffer as ArrayBuffer, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
