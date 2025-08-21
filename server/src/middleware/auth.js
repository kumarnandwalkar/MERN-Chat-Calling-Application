const jwt = require('jsonwebtoken');

function createToken(user) {
	const payload = { sub: user._id.toString(), username: user.username };
	const secret = process.env.JWT_SECRET || 'dev_secret';
	return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function verifyHttpAuth(req, res, next) {
	const auth = req.headers.authorization;
	const token = auth && auth.startsWith('Bearer ') ? auth.substring(7) : null;
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const secret = process.env.JWT_SECRET || 'dev_secret';
		const decoded = jwt.verify(token, secret);
		req.user = { id: decoded.sub, username: decoded.username };
		next();
	} catch (e) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

function verifySocketAuth(socket, next) {
	const header = socket.handshake.headers['authorization'];
	const fromHeader = header && header.startsWith('Bearer ') ? header.substring(7) : null;
	const token = socket.handshake.auth?.token || fromHeader;
	if (!token) return next(new Error('Unauthorized'));
	try {
		const secret = process.env.JWT_SECRET || 'dev_secret';
		const decoded = jwt.verify(token, secret);
		socket.user = { id: decoded.sub, username: decoded.username };
		next();
	} catch (e) {
		next(new Error('Unauthorized'));
	}
}

module.exports = { createToken, verifyHttpAuth, verifySocketAuth };
