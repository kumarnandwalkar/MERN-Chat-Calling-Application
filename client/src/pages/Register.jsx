import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { setToken } from '../store/auth.js';

export default function Register() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	async function handleSubmit(e) {
		e.preventDefault();
		setError('');
		try {
			const { data } = await api.post('/api/auth/register', { username, email, password });
			setToken(data.token);
			navigate('/chat');
		} catch (e) {
			setError(e.response?.data?.error || 'Register failed');
		}
	}

	return (
		<div className="grid place-items-center py-10">
			<div className="card w-full max-w-md p-6">
				<h2 className="text-2xl font-semibold mb-1">Create your account</h2>
				<p className="text-slate-600 mb-6">It only takes a minute</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="label">Username</label>
						<input className="input" placeholder="johndoe" value={username} onChange={e => setUsername(e.target.value)} required />
					</div>
					<div>
						<label className="label">Email</label>
						<input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
					</div>
					<div>
						<label className="label">Password</label>
						<input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
					</div>
					<button type="submit" className="btn-primary w-full">Create Account</button>
				</form>
				{error && <p className="text-red-600 mt-3">{error}</p>}
				<p className="text-sm text-slate-600 mt-6">Already have an account? <Link className="text-brand-700 hover:underline" to="/login">Login</Link></p>
			</div>
		</div>
	);
}
