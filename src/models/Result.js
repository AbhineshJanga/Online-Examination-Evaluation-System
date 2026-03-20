// models/Result.js

const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },

    answers: [
        {
            questionId: String,
            selectedOption: Number
        }
    ],

    score: {
        type: Number,
        default: 0
    },

    totalQuestions: Number,

    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Result", resultSchema);