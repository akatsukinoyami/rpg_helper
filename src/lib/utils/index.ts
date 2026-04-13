export function keys<T extends object>(obj: T): (keyof T)[] {
	return Object.keys(obj) as (keyof T)[];
}

export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
	return Object.entries(obj) as [keyof T, T[keyof T]][];
}

export * from '$lib/utils/md';
export * from '$lib/utils/stats';
export * from '$lib/utils/theme';