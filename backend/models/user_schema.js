const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    token: {
        type: String,
        required: true,
    },
}, { collection: "users" });

module.exports = mongoose.model("users", userSchema);
