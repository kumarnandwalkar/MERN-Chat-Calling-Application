const express = require('express');
const { verifyHttpAuth } = require('../middleware/auth');
const User = require('../models/User');
const { getOnlineUserIds } = require('../socket');

const router = express.Router();

router.get('/', verifyHttpAuth, async (req, res) => {
	const users = await User.find({}, { username: 1 }).lean();
	const onlineSet = getOnlineUserIds();
	const list = users.map(u => ({ id: u._id, username: u.username, online: onlineSet.has(String(u._id)) }));
	return res.json(list);
});

router.get('/search', verifyHttpAuth, async (req, res) => {
	const q = (req.query.q || '').trim();
	if (!q) return res.json([]);
	const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
	const users = await User.find({ username: re }, { username: 1 }).limit(20).lean();
	const onlineSet = getOnlineUserIds();
	const list = users
		.filter(u => String(u._id) !== req.user.id)
		.map(u => ({ id: u._id, username: u.username, online: onlineSet.has(String(u._id)) }));
	return res.json(list);
});

router.get('/:id', verifyHttpAuth, async (req, res) => {
	const u = await User.findById(req.params.id, { username: 1 }).lean();
	if (!u) return res.status(404).json({ error: 'Not found' });
	const online = getOnlineUserIds().has(String(u._id));
	return res.json({ id: u._id, username: u.username, online });
});

module.exports = router;
