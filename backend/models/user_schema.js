const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		passwordHash: {
			type: String,
			required: true,
		},
		salt: {
			type: String,
			required: true,
		},
		validTime: {
			// Any tokens created before this time are considered invalid.
			type: String,
			required: true,
		},
		budgetData: {
			type: Array,
			required: true,
		},
		income: {
			type: Number,
			required: false,
		},
		savings: {
			type: Number,
			required: false,
		},
	},
	{ collection: "users" }
);

module.exports = mongoose.model("users", userSchema);
