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
            questionIndex: Number,
            selectedOption: Number
        }
    ],

    score: {
        type: Number,
        default: 0
    },

    totalQuestions: Number,

    status: {
        type: String,
        enum: ["Submitted", "Graded", "Auto-Submitted", "Cheating Detected"],
        default: "Submitted"
    },

    violations: {
        type: Number,
        default: 0
    },

    evaluatedScore: {
        type: Number,
        default: null
    },

    timeTaken: {
        type: String,
        default: null
    },

    gradedAt: {
        type: Date,
        default: null
    },

    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Result", resultSchema);