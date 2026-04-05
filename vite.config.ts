import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import mkcert from 'vite-plugin-mkcert';
import { wsPlugin } from './ws-dev.ts';

export default defineConfig({
	plugins: [
		mkcert(),
		tailwindcss(),
		sveltekit(),
		wsPlugin(),
		devtoolsJson(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	server: {
		host: '127.0.0.1'
		// port: 5173 (optional: specify a port)
	}
});
