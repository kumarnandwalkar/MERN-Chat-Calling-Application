const express = require('express');
const User = require('../models/User');
const { createToken, verifyHttpAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
		const { username, email, password } = req.body;
		if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
		const existing = await User.findOne({ $or: [{ username }, { email }] });
		if (existing) return res.status(409).json({ error: 'User already exists' });
		const passwordHash = await User.hashPassword(password);
		const user = await User.create({ username, email, passwordHash });
		const token = createToken(user);
		return res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { usernameOrEmail, password } = req.body;
		const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const valid = await user.comparePassword(password);
		if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
		const token = createToken(user);
		return res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

router.get('/me', verifyHttpAuth, async (req, res) => {
	return res.json({ id: req.user.id, username: req.user.username });
});

router.get('/user/:username', verifyHttpAuth, async (req, res) => {
	const user = await User.findOne({ username: req.params.username }).lean();
	if (!user) return res.status(404).json({ error: 'Not found' });
	return res.json({ id: user._id, username: user.username });
});

module.exports = router;
