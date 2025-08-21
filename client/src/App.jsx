import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Chat from './pages/Chat.jsx';
import Call from './pages/Call.jsx';
import { getToken, clearToken, AUTH_EVENT } from './store/auth.js';
import { api } from './services/api.js';
import CallToaster from './components/CallToaster.jsx';

function RequireAuth({ children }) {
	const token = getToken();
	const location = useLocation();
	if (!token) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	return children;
}

export default function App() {
	const [token, setTokenState] = useState(getToken());
	const [me, setMe] = useState(null);

	useEffect(() => {
		function sync() { setTokenState(getToken()); }
		window.addEventListener(AUTH_EVENT, sync);
		return () => window.removeEventListener(AUTH_EVENT, sync);
	}, []);

	useEffect(() => {
		let cancelled = false;
		async function fetchMe() {
			if (!token) { setMe(null); return; }
			try {
				const { data } = await api.get('/api/auth/me');
				if (!cancelled) setMe(data);
			} catch {
				if (!cancelled) setMe(null);
			}
		}
		fetchMe();
		return () => { cancelled = true; };
	}, [token]);

	return (
		<div className="min-h-screen">
			<header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
				<div className="container flex items-center justify-between h-14">
					<Link to="/" className="font-semibold text-brand-700">MERN Chat & Calls</Link>
					<nav className="flex items-center gap-3">
						{token ? (
							<>
								{me && (
									<div className="flex items-center gap-2 pr-2">
										<div className="h-8 w-8 rounded-full bg-brand-600 text-white grid place-items-center text-sm">
											{(me.username || 'U').slice(0,1).toUpperCase()}
										</div>
										<span className="text-sm text-slate-700">{me.username}</span>
									</div>
								)}
								<button className="btn-primary" onClick={() => { clearToken(); window.location.href = '/login'; }}>Logout</button>
							</>
						) : (
							<>
								<Link className="btn-primary" to="/login">Login</Link>
								<Link className="btn-primary" to="/register">Register</Link>
							</>
						)}
					</nav>
				</div>
			</header>
			<main className="container py-6">
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
					<Route path="/call" element={<RequireAuth><Call /></RequireAuth>} />
					<Route path="*" element={<Navigate to="/chat" />} />
				</Routes>
			</main>
			<CallToaster />
		</div>
	);
}
