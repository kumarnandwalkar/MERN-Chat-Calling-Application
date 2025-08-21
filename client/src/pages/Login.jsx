import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { setToken } from '../store/auth.js';

export default function Login() {
	const [usernameOrEmail, setUsernameOrEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || '/chat';

	async function handleSubmit(e) {
		e.preventDefault();
		setError('');
		try {
			const { data } = await api.post('/api/auth/login', { usernameOrEmail, password });
			setToken(data.token);
			navigate(from, { replace: true });
		} catch (e) {
			setError(e.response?.data?.error || 'Login failed');
		}
	}

	return (
		<div className="grid place-items-center py-10">
			<div className="card w-full max-w-md p-6">
				<h2 className="text-2xl font-semibold mb-1">Welcome back</h2>
				<p className="text-slate-600 mb-6">Login to continue</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="label">Username or Email</label>
						<input className="input" placeholder="you@example.com" value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)} required />
					</div>
					<div>
						<label className="label">Password</label>
						<input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
					</div>
					<button type="submit" className="btn-primary w-full">Login</button>
				</form>
				{error && <p className="text-red-600 mt-3">{error}</p>}
				<p className="text-sm text-slate-600 mt-6">Don't have an account? <Link className="text-brand-700 hover:underline" to="/register">Register</Link></p>
			</div>
		</div>
	);
}
