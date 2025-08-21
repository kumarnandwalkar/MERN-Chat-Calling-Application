import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPeerConnection } from '../services/webrtc.js';
import { connectSocket, getSocket } from '../services/socket.js';
import { api } from '../services/api.js';
import IncomingCallModal from '../components/IncomingCallModal.jsx';

export default function Call() {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const toUserId = params.get('to');
	const [status, setStatus] = useState('Initializing...');
	const [incoming, setIncoming] = useState(null); // { fromUserId, offer, fromUser }
	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);
	const pcRef = useRef(null);
	const localStreamRef = useRef(null);
	const isInitiatorRef = useRef(!!toUserId);

	useEffect(() => {
		async function init() {
			await api.get('/api/auth/me');
			const socket = connectSocket();
			const pc = createPeerConnection();
			pcRef.current = pc;

			pc.onicecandidate = (event) => {
				if (event.candidate) {
					getSocket().emit('call:ice-candidate', { toUserId: toUserId || incoming?.fromUserId, candidate: event.candidate });
				}
			};
			pc.ontrack = (event) => {
				remoteVideoRef.current.srcObject = event.streams[0];
			};

			localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
			localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
			localVideoRef.current.srcObject = localStreamRef.current;

			socket.on('call:offer', async ({ fromUserId, offer }) => {
				if (isInitiatorRef.current) return; // ignore if we're the caller
				try {
					const { data: fromUser } = await api.get(`/api/users/${fromUserId}`);
					setIncoming({ fromUserId, offer, fromUser });
					setStatus('Incoming call...');
				} catch {}
			});

			socket.on('call:answer', async ({ fromUserId, answer }) => {
				if (fromUserId === toUserId && isInitiatorRef.current) {
					await pc.setRemoteDescription(new RTCSessionDescription(answer));
					setStatus('In call');
				}
			});

			socket.on('call:ice-candidate', async ({ fromUserId, candidate }) => {
				if ((fromUserId === toUserId && isInitiatorRef.current) || (incoming && fromUserId === incoming.fromUserId)) {
					try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
				}
			});

			socket.on('call:end', ({ fromUserId }) => {
				if ((toUserId && fromUserId === toUserId) || (incoming && fromUserId === incoming.fromUserId)) endCall();
			});

			if (isInitiatorRef.current) {
				setStatus('Calling...');
				const offer = await pc.createOffer();
				await pc.setLocalDescription(offer);
				getSocket().emit('call:offer', { toUserId, offer });
			}
		}
		init();
		return () => cleanup();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toUserId]);

	async function acceptCall() {
		if (!incoming) return;
		const pc = pcRef.current;
		await pc.setRemoteDescription(new RTCSessionDescription(incoming.offer));
		const answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);
		getSocket().emit('call:answer', { toUserId: incoming.fromUserId, answer });
		setStatus('In call');
		setIncoming(null);
	}

	function declineCall() {
		setIncoming(null);
		setStatus('Ready');
	}

	function endCall() {
		getSocket().emit('call:end', { toUserId: toUserId || incoming?.fromUserId });
		cleanup();
	}

	function cleanup() {
		setStatus('Call ended');
		try { pcRef.current?.close(); } catch {}
		pcRef.current = null;
		localStreamRef.current?.getTracks().forEach(t => t.stop());
	}

	return (
		<div>
			<h2 className="text-2xl font-semibold mb-4">Call</h2>
			<p className="text-slate-600 mb-3">{status}</p>
			<div className="grid md:grid-cols-2 gap-4">
				<video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded-xl bg-black aspect-video" />
				<video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-xl bg-black aspect-video" />
			</div>
			<div className="mt-4 flex gap-2">
				<button className="btn-primary" onClick={endCall}>End Call</button>
				<button className="btn-primary" onClick={() => navigate('/chat')}>Back</button>
			</div>

			<IncomingCallModal visible={!!incoming} fromUser={incoming?.fromUser} onAccept={acceptCall} onDecline={declineCall} />
		</div>
	);
}
