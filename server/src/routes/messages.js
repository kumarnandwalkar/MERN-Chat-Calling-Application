const express = require('express');
const { verifyHttpAuth } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router = express.Router();

router.get('/conversations', verifyHttpAuth, async (req, res) => {
	const userId = req.user.id;
	const convos = await Conversation.find({ participants: userId })
		.sort({ updatedAt: -1 })
		.lean();
	return res.json(convos);
});

router.get('/with/:userId', verifyHttpAuth, async (req, res) => {
	const userA = req.user.id;
	const userB = req.params.userId;
	const key = Conversation.keyFor(userA, userB);
	let convo = await Conversation.findOne({ key });
	if (!convo) {
		convo = await Conversation.create({ participants: [userA, userB], key });
	}
	if (!convo.participants.some(p => String(p) === String(userA))) {
		return res.status(403).json({ error: 'Forbidden' });
	}
	const messages = await Message.find({ conversation: convo._id }).sort({ createdAt: 1 }).lean();
	return res.json({ conversationId: convo._id, messages });
});

router.get('/:conversationId', verifyHttpAuth, async (req, res) => {
	const { conversationId } = req.params;
	const convo = await Conversation.findById(conversationId).lean();
	if (!convo) return res.status(404).json({ error: 'Not found' });
	if (!convo.participants.some(p => String(p) === String(req.user.id))) {
		return res.status(403).json({ error: 'Forbidden' });
	}
	const messages = await Message.find({ conversation: conversationId })
		.sort({ createdAt: 1 })
		.lean();
	return res.json(messages);
});

module.exports = router;
