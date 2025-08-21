import React, { useEffect, useRef } from 'react';

export default function IncomingCallModal({ visible, fromUser, onAccept, onDecline }) {
	const audioRef = useRef(null);
	useEffect(() => {
		if (visible) {
			try { audioRef.current?.play?.(); } catch {}
		} else {
			try { audioRef.current?.pause?.(); audioRef.current.currentTime = 0; } catch {}
		}
	}, [visible]);

	if (!visible) return null;
	return (
		<div className="fixed inset-0 bg-black/40 grid place-items-center">
			<div className="card p-6 max-w-sm w-full text-center">
				<div className="mx-auto h-14 w-14 rounded-full bg-brand-600 text-white grid place-items-center text-xl mb-3">
					{fromUser?.username?.slice(0,1)?.toUpperCase() || 'U'}
				</div>
				<h3 className="text-lg font-semibold mb-1">Incoming call</h3>
				<p className="text-slate-600 mb-4">{fromUser?.username || 'Unknown'} is calling you</p>
				<div className="flex gap-2 justify-center">
					<button className="btn-primary" onClick={onAccept}>Accept</button>
					<button className="btn-primary" onClick={onDecline}>Decline</button>
				</div>
			</div>
			<audio ref={audioRef} src="/ringtone.mp3" loop />
		</div>
	);
}
