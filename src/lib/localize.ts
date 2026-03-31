import type { LocalizedText } from './server/db/schema';

/**
 * Returns the best available translation for the current locale,
 * falling back to English, then whatever is available.
 */
export function localize(text: LocalizedText | null | undefined, locale: string): string {
	if (!text) return '';
	return text[locale as keyof LocalizedText] ?? text.en ?? Object.values(text)[0] ?? '';
}
