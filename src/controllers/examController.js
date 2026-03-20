// controllers/examController.js

const Exam = require("../models/Exam");
const Result = require("../models/Result");

// ================= CREATE EXAM =================
exports.createExam = async (req, res) => {
    try {
        const { title, description, questions, duration } = req.body;

        if (!title || !questions || !duration) {
            return res.status(400).json({
                success: false,
                message: "Title, questions, and duration are required"
            });
        }

        const exam = new Exam({
            title,
            description,
            questions,
            duration,
            createdBy: req.user.id
        });

        await exam.save();

        res.status(201).json({
            success: true,
            message: "Exam created successfully",
            exam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create exam"
        });
    }
};

// ================= GET ALL EXAMS =================
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate("createdBy", "name email");

        res.status(200).json({
            success: true,
            count: exams.length,
            exams
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch exams"
        });
    }
};

// ================= SUBMIT EXAM =================
exports.submitExam = async (req, res) => {
    try {
        const { examId, answers } = req.body;

        if (!examId || !answers) {
            return res.status(400).json({
                success: false,
                message: "Exam ID and answers are required"
            });
        }

        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        let score = 0;

        exam.questions.forEach((q) => {
            const answer = answers.find(
                (a) => a.questionId == q._id.toString()
            );

            if (answer && answer.selectedOption === q.correctAnswer) {
                score++;
            }
        });

        const result = new Result({
            student: req.user.id,
            exam: examId,
            answers,
            score,
            totalQuestions: exam.questions.length
        });

        await result.save();

        res.status(200).json({
            success: true,
            message: "Exam submitted successfully",
            score,
            totalQuestions: exam.questions.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Submission failed"
        });
    }
};

// ================= GET MY RESULTS =================
exports.getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user.id })
            .populate("exam", "title description");

        res.status(200).json({
            success: true,
            count: results.length,
            results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch results"
        });
    }
};
// ================= TEACHER ANALYTICS =================
exports.getExamAnalytics = async (req, res) => {
    try {
        const examId = req.params.examId;

        const results = await Result.find({ exam: examId });

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No submissions yet"
            });
        }

        const scores = results.map(r => r.score);

        const totalStudents = results.length;
        const averageScore =
            scores.reduce((a, b) => a + b, 0) / totalStudents;
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);

        res.status(200).json({
            success: true,
            totalStudents,
            averageScore,
            highestScore,
            lowestScore
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch analytics"
        });
    }
};