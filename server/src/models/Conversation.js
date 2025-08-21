const mongoose = require('mongoose');

function makeConversationKey(a, b) {
	const [x, y] = [String(a), String(b)].sort();
	return `${x}:${y}`;
}

const ConversationSchema = new mongoose.Schema({
	participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
	key: { type: String, unique: true, index: true },
	lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

ConversationSchema.pre('validate', function (next) {
	if (this.participants && this.participants.length === 2) {
		this.key = makeConversationKey(this.participants[0], this.participants[1]);
	}
	next();
});

ConversationSchema.statics.keyFor = makeConversationKey;

module.exports = mongoose.model('Conversation', ConversationSchema);
