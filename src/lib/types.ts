export type OptionLabel = string | (() => string);
export type OptionsObject = Record<string, OptionLabel>;
export type OptionsArray = [string, OptionLabel][];
export type Options = OptionsObject | OptionsArray;
