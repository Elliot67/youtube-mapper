export function isUndefined(data: any): data is undefined {
	return typeof data === "undefined";
}

export function isNull(data: any): data is null {
	return data === null;
}

export function isDef<T>(data: T | null | undefined | ''): data is T {
	return !isUndefined(data) && !isNull(data) && data !== '';
}

export function formatTime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.round(seconds % 60);
	return [
		h,
		m > 9 ? m : (h ? '0' + m : m || '0'),
		s > 9 ? s : '0' + s
	].filter(Boolean).join(':');
}

export function generateUniqueId(): string {
	return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}

export function clearChildrenNodes(parent: HTMLElement) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}
