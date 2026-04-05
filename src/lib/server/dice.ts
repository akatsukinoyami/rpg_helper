/**
 * Dice roller — processes dice notation (e.g. 2d6+3) in message text,
 * skipping anything inside code fences (``` ```) or inline code (` `).
 *
 * Replacement format: [2d6+3: 4, 2 (+3) = 9]
 * Limits: 1–100 dice, 1–1000 sides.
 */

function roll(count: number, sides: number, modStr: string | undefined): string | null {
	if (count < 1 || count > 100 || sides < 1 || sides > 1000) return null;

	const dice = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
	const modifier = modStr ? parseInt(modStr, 10) : 0;
	const total = dice.reduce((a, b) => a + b, 0) + modifier;

	const diceList = dice.join(', ');
	const modDisplay = modifier > 0 ? ` (+${modifier})` : modifier < 0 ? ` (${modifier})` : '';

	return `[${count}d${sides}${modStr ?? ''}: ${diceList}${modDisplay} = ${total}]`;
}

function processSegment(text: string): string {
	return text.replace(/\b(\d+)[dD](\d+)([+-]\d+)?\b/g, (match, c, s, mod) => {
		return roll(parseInt(c, 10), parseInt(s, 10), mod) ?? match;
	});
}

export function processDice(text: string): string {
	// Split into code and non-code segments, process only non-code
	const codeRe = /(`{3}[\s\S]*?`{3}|`[^`\n]+`)/g;
	const result: string[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = codeRe.exec(text)) !== null) {
		if (match.index > lastIndex) {
			result.push(processSegment(text.slice(lastIndex, match.index)));
		}
		result.push(match[0]); // code segment — untouched
		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < text.length) {
		result.push(processSegment(text.slice(lastIndex)));
	}

	return result.join('');
}
