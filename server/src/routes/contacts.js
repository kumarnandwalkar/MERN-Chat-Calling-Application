const express = require('express');
const { verifyHttpAuth } = require('../middleware/auth');
const User = require('../models/User');
const { getOnlineUserIds } = require('../socket');

const router = express.Router();

router.get('/', verifyHttpAuth, async (req, res) => {
	const me = await User.findById(req.user.id).populate('contacts', 'username').lean();
	const online = getOnlineUserIds();
	const list = (me.contacts || []).map(u => ({ id: u._id, username: u.username, online: online.has(String(u._id)) }));
	return res.json(list);
});

router.post('/', verifyHttpAuth, async (req, res) => {
	const { username, userId } = req.body || {};
	let contact = null;
	if (userId) contact = await User.findById(userId).select('_id username');
	if (!contact && username) contact = await User.findOne({ username }).select('_id username');
	if (!contact) return res.status(404).json({ error: 'User not found' });
	if (String(contact._id) === req.user.id) return res.status(400).json({ error: 'Cannot add yourself' });
	await User.updateOne({ _id: req.user.id }, { $addToSet: { contacts: contact._id } });
	return res.json({ ok: true, contact: { id: contact._id, username: contact.username } });
});

router.delete('/:id', verifyHttpAuth, async (req, res) => {
	await User.updateOne({ _id: req.user.id }, { $pull: { contacts: req.params.id } });
	return res.json({ ok: true });
});

module.exports = router;
