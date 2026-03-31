export const SCHEMES = ['github', 'catppuccin', 'gruvbox'] as const;
export const MODES = ['system', 'light', 'dark'] as const;

export type Scheme = (typeof SCHEMES)[number];
export type Mode = (typeof MODES)[number];

export interface ThemePrefs {
	scheme: Scheme;
	mode: Mode;
}

export const DEFAULT_THEME = 'github-light';
export const COOKIE_NAME = 'rph_theme';

/** Build the data-theme attribute value from prefs, e.g. "catppuccin-dark" */
export function buildTheme(prefs: ThemePrefs): string {
	return `${prefs.scheme}-${prefs.mode}`;
}

/** Parse a theme string back into prefs, falling back to defaults */
export function parseTheme(value: string): ThemePrefs {
	const idx = value.lastIndexOf('-');
	if (idx === -1) return { scheme: 'github', mode: 'light' };
	const scheme = value.slice(0, idx) as Scheme;
	const mode = value.slice(idx + 1) as Mode;
	if (!SCHEMES.includes(scheme) || !MODES.includes(mode)) {
		return { scheme: 'github', mode: 'system' };
	}
	return { scheme, mode };
}
