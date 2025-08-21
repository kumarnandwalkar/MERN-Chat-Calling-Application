export function createPeerConnection() {
	const iceServers = [
		{ urls: ['stun:stun.l.google.com:19302'] }
	];
	if (import.meta.env.VITE_TURN_URL) {
		iceServers.push({
			urls: import.meta.env.VITE_TURN_URL,
			username: import.meta.env.VITE_TURN_USERNAME,
			credential: import.meta.env.VITE_TURN_CREDENTIAL
		});
	}
	const pc = new RTCPeerConnection({ iceServers });
	return pc;
}
