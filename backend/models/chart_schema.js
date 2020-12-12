const mongoose = require("mongoose");

const chartSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minlength: 6,
        maxlength: 7,
        match: /^#[A-Fa-f0-9]*$/,
    },
}, { collection: "chart" });

module.exports = mongoose.model("chart", chartSchema);
