export function isUndefined(data: any): data is undefined {
	return typeof data === "undefined";
}

export function isNull(data: any): data is null {
	return data === null;
}

export function isDef<T>(data: T | null | undefined | ''): data is T {
	return !isUndefined(data) && !isNull(data) && data !== '';
}
