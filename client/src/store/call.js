export const CALL_EVENT = 'call-changed';

let incomingCall = null; // { fromUserId, offer, fromUser }

function emitChange() {
	try { window.dispatchEvent(new Event(CALL_EVENT)); } catch {}
}

export function setIncomingCall(call) {
	incomingCall = call;
	emitChange();
}

export function getIncomingCall() {
	return incomingCall;
}

export function clearIncomingCall() {
	incomingCall = null;
	emitChange();
}
