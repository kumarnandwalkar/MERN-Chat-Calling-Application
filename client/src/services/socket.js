import { io } from 'socket.io-client';
import { getToken } from '../store/auth.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `${location.protocol}//${location.hostname}:5000`;

let socket;

export function getSocket() {
	if (!socket) {
		socket = io(SOCKET_URL, {
			autoConnect: false
		});
	}
	return socket;
}

export function connectSocket() {
	const s = getSocket();
	s.auth = { token: getToken() };
	s.connect();
	return s;
}

export function disconnectSocket() {
	const s = getSocket();
	s.disconnect();
}
