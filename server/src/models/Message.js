const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
	conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
	sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	content: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
