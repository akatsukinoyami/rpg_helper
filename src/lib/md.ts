import { marked, type MarkedExtension } from 'marked';
import hljs from 'highlight.js/lib/common';

// ── Custom inline extensions ────────────────────────────────────────────────

const inlineExt: MarkedExtension = {
	extensions: [
		{
			name: 'spoiler',
			level: 'inline',
			start(src) {
				return src.indexOf('||');
			},
			tokenizer(src) {
				const match = /^\|\|([^|\n]+)\|\|/.exec(src);
				if (match) return { type: 'spoiler', raw: match[0], text: match[1] };
			},
			renderer(token) {
				return `<span class="md-spoiler">${token.text}</span>`;
			}
		},
		{
			name: 'underline',
			level: 'inline',
			start(src) {
				return src.indexOf('++');
			},
			tokenizer(src) {
				const match = /^\+\+([^+\n]+)\+\+/.exec(src);
				if (match) return { type: 'underline', raw: match[0], text: match[1] };
			},
			renderer(token) {
				return `<u>${token.text}</u>`;
			}
		}
	]
};

// ── Block / element renderers ────────────────────────────────────────────────

const rendererExt: MarkedExtension = {
	renderer: {
		code({ text, lang }) {
			const language = lang && hljs.getLanguage(lang) ? lang : null;
			const highlighted = language
				? hljs.highlight(text, { language, ignoreIllegals: true }).value
				: text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			const cls = language ? `hljs language-${language}` : 'hljs';
			return `<pre><code class="${cls}">${highlighted}</code></pre>`;
		},
		link({ href, title, text }) {
			const t = title ? ` title="${title}"` : '';
			return `<a href="${href}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`;
		},
		image({ href, title, text }) {
			const t = title ? ` title="${title}"` : '';
			return `<img src="${href}" alt="${text}"${t} class="md-img" loading="lazy" />`;
		}
	}
};

marked.use({ gfm: true, breaks: true });
marked.use(inlineExt);
marked.use(rendererExt);

export function renderMarkdown(content: string): string {
	return marked.parse(content) as string;
}
