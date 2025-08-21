export const AUTH_EVENT = 'auth-changed';

function emitAuthChanged() {
	try { window.dispatchEvent(new Event(AUTH_EVENT)); } catch {}
}

export function getToken() {
	return localStorage.getItem('token');
}

export function setToken(token) {
	localStorage.setItem('token', token);
	emitAuthChanged();
}

export function clearToken() {
	localStorage.removeItem('token');
	emitAuthChanged();
}
