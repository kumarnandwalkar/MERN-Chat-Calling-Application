import React from 'react';

export default function ChatList({ conversations = [], onSelect }) {
	return (
		<div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8 }}>
			{conversations.length === 0 ? (
				<p>No conversations yet.</p>
			) : (
				<ul>
					{conversations.map(c => (
						<li key={c._id}><button onClick={() => onSelect(c)}>{c.participants?.join(', ')}</button></li>
					))}
				</ul>
			)}
		</div>
	);
}
