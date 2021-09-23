const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
	accessToken: String,
	accessTokenExpiresAt: Date,
	client: Object,
	user: Object
});

module.exports = mongoose.model('token', tokenSchema);