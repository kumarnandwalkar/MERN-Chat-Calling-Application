import React, { useEffect, useRef } from 'react';

export default function MessageList({ messages, selfId }) {
	const endRef = useRef(null);
	useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
	return (
		<div className="card p-3 h-80 overflow-y-auto">
			{messages.map(m => {
				const mine = m.sender === selfId;
				return (
					<div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-2`}>
						<div className={`${mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'} px-3 py-2 rounded-2xl max-w-[70%] shadow-sm`}>
							<div className="whitespace-pre-wrap break-words">{m.content}</div>
						</div>
					</div>
				);
			})}
			<div ref={endRef} />
		</div>
	);
}
