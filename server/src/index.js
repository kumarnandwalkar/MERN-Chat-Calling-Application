const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDb = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');
const inviteRoutes = require('./routes/invite');
const { verifySocketAuth } = require('./middleware/auth');
const { registerSocketHandlers } = require('./socket');

dotenv.config();

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8080';

const io = new Server(server, {
	cors: {
		origin: corsOrigin,
		methods: ['GET', 'POST'],
		credentials: true
	}
});

connectDb();

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
	res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/invite', inviteRoutes);

io.use(verifySocketAuth);

io.on('connection', (socket) => {
	registerSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});
