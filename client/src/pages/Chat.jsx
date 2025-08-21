import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';
import { connectSocket, getSocket } from '../services/socket.js';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';
import { useNavigate } from 'react-router-dom';

function Avatar({ name, online }) {
	const letter = (name || 'U').slice(0,1).toUpperCase();
	return (
		<div className="relative">
			<div className="h-9 w-9 rounded-full bg-fuchsia-600 text-white grid place-items-center text-sm mr-2">
				{letter}
			</div>
			<span className={`absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-neutral-900 ${online ? 'bg-green-500' : 'bg-neutral-500'}`}></span>
		</div>
	);
}

export default function Chat() {
	const [self, setSelf] = useState(null);
	const [contacts, setContacts] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviteOk, setInviteOk] = useState(false);
	const [recipient, setRecipient] = useState(null);
	const [messages, setMessages] = useState([]);
	const [typing, setTyping] = useState(false);
	const [presence, setPresence] = useState({});
	const navigate = useNavigate();
	const typingTimeout = useRef(null);
	const inviteTimeout = useRef(null);

	useEffect(() => {
		async function init() {
			const { data: me } = await api.get('/api/auth/me');
			setSelf(me);
			await refreshContacts();
			const socket = connectSocket();
			socket.on('message:new', (m) => {
				if (!recipient) return;
				const isBetweenUs = (m.sender === recipient.id && m.recipient === me.id) || (m.sender === me.id && m.recipient === recipient.id);
				if (isBetweenUs) setMessages((prev) => [...prev, m]);
			});
			socket.on('typing', ({ fromUserId, typing }) => {
				if (recipient && fromUserId === recipient.id) setTyping(typing);
			});
			socket.on('presence:update', ({ userId, online }) => {
				setPresence((p) => ({ ...p, [userId]: online }));
				setContacts((list) => list.map(u => u.id === userId ? { ...u, online } : u));
			});
		}
		init();
		return () => { getSocket().off(); };
	}, [recipient?.id]);

	async function refreshContacts() {
		const { data } = await api.get('/api/contacts');
		setContacts(data);
		const pres = {};
		data.forEach(u => { pres[u.id] = u.online; });
		setPresence(pres);
	}

	useEffect(() => {
		if (!recipient) return;
		async function loadHistory() {
			const { data } = await api.get(`/api/messages/with/${recipient.id}`);
			setMessages(data.messages);
		}
		loadHistory();
	}, [recipient?.id]);

	function handleTyping() {
		if (!recipient) return;
		const socket = getSocket();
		socket.emit('typing', { toUserId: recipient.id, typing: true });
		if (typingTimeout.current) clearTimeout(typingTimeout.current);
		typingTimeout.current = setTimeout(() => {
			socket.emit('typing', { toUserId: recipient.id, typing: false });
		}, 1200);
	}

	function handleSend(text) {
		const socket = getSocket();
		socket.emit('message:send', { toUserId: recipient.id, content: text });
	}

	function startCall() {
		navigate(`/call?to=${recipient.id}`);
	}

	async function searchUsers(q) {
		setSearchQuery(q);
		if (!q.trim()) { setSearchResults([]); return; }
		const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(q)}`);
		setSearchResults(data);
	}

	async function addContact(u) {
		await api.post('/api/contacts', { userId: u.id });
		await refreshContacts();
		setSearchQuery('');
		setSearchResults([]);
		setRecipient(u);
	}

	async function sendInvite() {
		if (!inviteEmail.trim()) return;
		await api.post('/api/invite', { email: inviteEmail.trim() });
		setInviteEmail('');
		setInviteOk(true);
		if (inviteTimeout.current) clearTimeout(inviteTimeout.current);
		inviteTimeout.current = setTimeout(() => setInviteOk(false), 2500);
	}

	return (
		<div>
			<h2 className="text-2xl font-semibold mb-4">Chat</h2>
			<div className="grid md:grid-cols-3 gap-4">
				<div className="md:col-span-1 card p-4 space-y-4 h-[75vh] overflow-y-auto">
					<div className="sticky top-0 bg-neutral-900/90">
						<div className="text-sm text-neutral-400 mb-2">Contacts</div>
						{self && (
							<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 mb-3">
								<Avatar name={self.username} online={true} />
								<div>
									<div className="text-xs text-neutral-400">You</div>
									<div className="font-medium">{self.username}</div>
								</div>
							</div>
						)}
						<div className="mb-3 relative">
							<input className="input" placeholder="Search people" value={searchQuery} onChange={e => searchUsers(e.target.value)} />
							{searchResults.length > 0 && (
								<div className="absolute mt-2 w-full z-10 border border-neutral-800 rounded-lg divide-y max-h-60 overflow-y-auto bg-neutral-900">
									{searchResults.map(u => (
										<button key={u.id} className="w-full text-left px-3 py-2 hover:bg-neutral-800 flex items-center justify-between" onClick={() => addContact(u)}>
											<span className="flex items-center"><Avatar name={u.username} online={u.online} /><span className="ml-1">{u.username}</span></span>
											<span className={`text-xs ${u.online ? 'text-green-500' : 'text-neutral-500'}`}>{u.online ? 'Online' : 'Offline'}</span>
										</button>
									))}
								</div>
							)}
						</div>
						<div className="flex gap-2 items-center">
							<input className="input" type="email" placeholder="Invite by email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
							<button className="btn-primary" onClick={sendInvite}>Invite</button>
						</div>
						{inviteOk && <div className="text-xs text-green-500">Invite sent</div>}
					</div>
					<ul className="space-y-1">
						{contacts.filter(u => u.id !== self?.id).map(u => (
							<li key={u.id}>
								<button className={`w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 flex items-center justify-between ${recipient?.id === u.id ? 'bg-neutral-800' : ''}`} onClick={() => setRecipient(u)}>
									<span className="flex items-center"><Avatar name={u.username} online={u.online} /><span className="ml-1 font-medium">{u.username}</span></span>
									<span className={`text-xs ${u.online ? 'text-green-500' : 'text-neutral-500'}`}>{u.online ? 'Online' : 'Offline'}</span>
								</button>
							</li>
						))}
					</ul>
				</div>
				<div className="md:col-span-2">
					{recipient ? (
						<>
							<div className="card p-3 mb-3 flex items-center justify-between">
								<div>
									<div className="font-semibold">{recipient.username}</div>
									<div className="text-xs text-neutral-400">{presence[recipient.id] ? 'Online' : 'Offline'}</div>
								</div>
								<button className="btn-primary" onClick={startCall}>Start Call</button>
							</div>
							<MessageList messages={messages} selfId={self?.id} />
							{typing && <div className="mt-2 text-sm text-neutral-400">Typing...</div>}
							<MessageInput onSend={handleSend} onTyping={handleTyping} />
						</>
					) : (
						<div className="card p-6 text-neutral-400">Select a contact or search to add someone and start chatting.</div>
					)}
				</div>
			</div>
		</div>
	);
}
