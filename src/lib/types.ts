import type { LocalizedString } from '@inlang/paraglide-js';

export type OptionLabel = string | (() => string);
export type OptionsObject = Record<string, OptionLabel>;
export type OptionsArray = [string, OptionLabel][];
export type Options = OptionsObject | OptionsArray;
export type Values<T> = T[keyof T];
