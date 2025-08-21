import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, getSocket } from '../services/socket.js';
import { api } from '../services/api.js';
import IncomingCallModal from './IncomingCallModal.jsx';
import { setIncomingCall, clearIncomingCall } from '../store/call.js';

export default function CallToaster() {
	const [visible, setVisible] = useState(false);
	const [fromUser, setFromUser] = useState(null);
	const [fromUserId, setFromUserId] = useState(null);
	const [offer, setOffer] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const socket = connectSocket();
		function onOffer({ fromUserId: uid, offer }) {
			(async () => {
				try {
					const { data } = await api.get(`/api/users/${uid}`);
					setFromUser(data);
					setFromUserId(uid);
					setOffer(offer);
					setIncomingCall({ fromUserId: uid, offer, fromUser: data });
					setVisible(true);
				} catch {}
			})();
		}
		socket.on('call:offer', onOffer);
		return () => { getSocket().off('call:offer', onOffer); };
	}, []);

	function accept() {
		setVisible(false);
		navigate('/call');
	}

	function decline() {
		getSocket().emit('call:end', { toUserId: fromUserId });
		setVisible(false);
		setFromUser(null);
		setFromUserId(null);
		setOffer(null);
		clearIncomingCall();
	}

	return (
		<IncomingCallModal visible={visible} fromUser={fromUser} onAccept={accept} onDecline={decline} />
	);
}
