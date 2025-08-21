const mongoose = require('mongoose');

async function connectDb() {
	const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_chat';
	mongoose.set('strictQuery', true);
	await mongoose.connect(uri);
	console.log('MongoDB connected');
}

module.exports = connectDb;
