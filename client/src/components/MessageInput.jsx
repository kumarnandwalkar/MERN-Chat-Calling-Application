import React, { useState } from 'react';

export default function MessageInput({ onSend, onTyping }) {
	const [text, setText] = useState('');
	return (
		<form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onSend(text); setText(''); } }} className="flex gap-2 mt-3">
			<input
				className="input"
				placeholder="Type a message"
				value={text}
				onChange={(e) => { setText(e.target.value); onTyping?.(); }}
			/>
			<button type="submit" className="btn-primary">Send</button>
		</form>
	);
}
