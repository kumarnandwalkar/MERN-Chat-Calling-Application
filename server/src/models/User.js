const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true, index: true },
	email: { type: String, required: true, unique: true, index: true },
	passwordHash: { type: String, required: true },
	contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.comparePassword = function (password) {
	return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = async function (password) {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
};

module.exports = mongoose.model('User', UserSchema);
