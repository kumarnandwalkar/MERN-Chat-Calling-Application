const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const userIdToSockets = new Map();
const socketIdToUserId = new Map();

function addSocket(userId, socketId) {
	let set = userIdToSockets.get(userId);
	if (!set) {
		set = new Set();
		userIdToSockets.set(userId, set);
	}
	set.add(socketId);
	socketIdToUserId.set(socketId, userId);
}

function removeSocket(socketId) {
	const userId = socketIdToUserId.get(socketId);
	if (!userId) return;
	const set = userIdToSockets.get(userId);
	if (set) {
		set.delete(socketId);
		if (set.size === 0) userIdToSockets.delete(userId);
	}
	socketIdToUserId.delete(socketId);
}

function getUserSockets(userId) {
	return Array.from(userIdToSockets.get(userId) || []);
}

function getOnlineUserIds() {
	return new Set(Array.from(userIdToSockets.keys()).map(String));
}

async function ensureConversation(userA, userB) {
	const key = Conversation.keyFor(userA, userB);
	let convo = await Conversation.findOne({ key });
	if (!convo) {
		convo = await Conversation.create({ participants: [userA, userB], key });
	}
	return convo;
}

function registerSocketHandlers(io, socket) {
	const userId = socket.user.id;
	addSocket(userId, socket.id);

	socket.join(`user:${userId}`);
	io.emit('presence:update', { userId, online: true });

	socket.on('message:send', async ({ toUserId, content }) => {
		if (!toUserId || typeof content !== 'string') return;
		const convo = await ensureConversation(userId, toUserId);
		if (!convo.participants.some(p => String(p) === String(userId))) return; // safety
		const message = await Message.create({
			conversation: convo._id,
			sender: userId,
			recipient: toUserId,
			content
		});
		await Conversation.updateOne({ _id: convo._id }, { $set: { lastMessageAt: new Date() } });
		const payload = {
			_id: message._id,
			conversation: convo._id,
			sender: userId,
			recipient: toUserId,
			content,
			createdAt: message.createdAt
		};
		// emit ONLY to sender and recipient
		io.to(`user:${userId}`).emit('message:new', payload);
		io.to(`user:${toUserId}`).emit('message:new', payload);
	});

	socket.on('typing', ({ toUserId, typing }) => {
		io.to(`user:${toUserId}`).emit('typing', { fromUserId: userId, typing: !!typing });
	});

	// WebRTC signaling
	socket.on('call:offer', ({ toUserId, offer }) => {
		io.to(`user:${toUserId}`).emit('call:offer', { fromUserId: userId, offer });
	});
	socket.on('call:answer', ({ toUserId, answer }) => {
		io.to(`user:${toUserId}`).emit('call:answer', { fromUserId: userId, answer });
	});
	socket.on('call:ice-candidate', ({ toUserId, candidate }) => {
		io.to(`user:${toUserId}`).emit('call:ice-candidate', { fromUserId: userId, candidate });
	});
	socket.on('call:end', ({ toUserId }) => {
		io.to(`user:${toUserId}`).emit('call:end', { fromUserId: userId });
	});

	socket.on('disconnect', () => {
		removeSocket(socket.id);
		io.emit('presence:update', { userId, online: getUserSockets(userId).length > 0 });
	});
}

module.exports = { registerSocketHandlers, getOnlineUserIds };
