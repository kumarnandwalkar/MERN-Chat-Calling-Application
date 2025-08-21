import axios from 'axios';
import { getToken, clearToken } from '../store/auth.js';

const baseURL = import.meta.env.VITE_API_URL || `${location.protocol}//${location.hostname}:5000`;

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(res) => res,
	(err) => {
		if (err?.response?.status === 401) {
			clearToken();
			try { window.location.href = '/login'; } catch {}
		}
		return Promise.reject(err);
	}
);
