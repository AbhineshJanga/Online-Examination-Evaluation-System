// models/Exam.js

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: [
        {
            type: String,
            required: true
        }
    ],
    correctAnswer: {
        type: Number, // index of correct option
        required: true
    }
});

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    questions: [questionSchema],

    duration: {
        type: Number, // minutes
        required: true
    },

    examDate: {
        type: Date,
        required: true
    },

    isPublished: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Exam", examSchema);