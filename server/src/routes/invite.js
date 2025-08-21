const express = require('express');
const { verifyHttpAuth } = require('../middleware/auth');
const { sendInviteEmail } = require('../utils/mailer');

const router = express.Router();

router.post('/', verifyHttpAuth, async (req, res) => {
	const { email } = req.body || {};
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
	const base = process.env.APP_BASE_URL || 'http://localhost:8080';
	const link = `${base}/register`;
	try {
		await sendInviteEmail(email, link);
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Failed to send invite' });
	}
});

module.exports = router;
