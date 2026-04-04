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
        const userRole = req.user.role;

        let query = {};

        // Students can only see published exams
        if (userRole === 'student') {
            query.isPublished = true;
        }
        // Teachers and admins can see all exams (both published and drafts)

        const exams = await Exam.find(query).populate("createdBy", "name email");

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

// ================= GET SINGLE EXAM BY ID =================
exports.getExamById = async (req, res) => {
    try {
        const { examId } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        const exam = await Exam.findById(examId).populate("createdBy", "name email");

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // Teachers can only see their own exams, admins can see all
        if (userRole === 'teacher' && exam.createdBy._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to view this exam"
            });
        }

        res.status(200).json({
            success: true,
            exam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch exam"
        });
    }
};

// ================= UPDATE EXAM =================
exports.updateExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const { title, description, questions, duration } = req.body;
        const userId = req.user.id;

        const exam = await Exam.findOne({
            _id: examId,
            createdBy: userId
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found or unauthorized"
            });
        }

        // Prevent editing published exams
        if (exam.isPublished) {
            return res.status(400).json({
                success: false,
                message: "Cannot edit a published exam"
            });
        }

        // Update fields
        if (title) exam.title = title;
        if (description !== undefined) exam.description = description;
        if (questions) exam.questions = questions;
        if (duration) exam.duration = duration;

        await exam.save();

        res.status(200).json({
            success: true,
            message: "Exam updated successfully",
            exam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update exam"
        });
    }
};

// ================= PUBLISH EXAM =================
exports.publishExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const exam = await Exam.findOne({
            _id: examId,
            createdBy: req.user.id
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found or unauthorized"
            });
        }

        if (exam.isPublished) {
            return res.status(400).json({
                success: false,
                message: "Exam is already published"
            });
        }

        exam.isPublished = true;
        await exam.save();

        res.status(200).json({
            success: true,
            message: "Exam published successfully",
            exam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to publish exam"
        });
    }
};

// ================= DELETE EXAM =================
exports.deleteExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const exam = await Exam.findOne({
            _id: examId,
            createdBy: req.user.id
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found or unauthorized"
            });
        }

        // Check if exam has submissions - warn but allow deletion
        const submissions = await Result.find({ exam: examId });
        const submissionCount = submissions.length;

        // Delete all related results/submissions
        if (submissionCount > 0) {
            await Result.deleteMany({ exam: examId });
            console.log(`⚠️ Deleted ${submissionCount} submissions along with exam ${examId}`);
        }

        // Delete the exam
        await Exam.findByIdAndDelete(examId);

        res.status(200).json({
            success: true,
            message: `Exam deleted successfully${submissionCount > 0 ? ` (${submissionCount} submissions also deleted)` : ""}`,
            submissionsDeleted: submissionCount
        });

    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete exam"
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

        // Prevent multiple attempts
        const existingResult = await Result.findOne({
            student: req.user.id,
            exam: examId
        });

        if (existingResult) {
            return res.status(400).json({
                success: false,
                message: "Exam already submitted. Multiple attempts are not allowed."
            });
        }

        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // Check if exam is published
        if (!exam.isPublished) {
            return res.status(400).json({
                success: false,
                message: "Exam is not published yet"
            });
        }

        let score = 0;

        exam.questions.forEach((q, index) => {
            const answer = answers.find(
                (a) => a.questionIndex === index
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
            totalQuestions: exam.questions.length,
            status: "Graded",
            submittedAt: Date.now(),
            gradedAt: Date.now()
        });

        await result.save();

        res.status(200).json({
            success: true,
            message: "Exam submitted successfully",
            score,
            totalQuestions: exam.questions.length,
            status: "Graded"
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
            .sort({ submittedAt: -1 })
            .populate("exam", "title description questions");

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

// ================= GET ALL SUBMISSIONS (TEACHER) =================
exports.getAllSubmissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const submissions = await Result.find()
            .sort({ submittedAt: -1 })
            .populate("student", "name email")
            .populate("exam", "title")
            .skip(skip)
            .limit(limit);

        const totalSubmissions = await Result.countDocuments();

        res.status(200).json({
            success: true,
            count: submissions.length,
            total: totalSubmissions,
            page,
            pages: Math.ceil(totalSubmissions / limit),
            submissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch submissions"
        });
    }
};

// ================= GET SUBMISSION BY ID (TEACHER) =================
exports.getSubmissionById = async (req, res) => {
    try {
        const submissionId = req.params.submissionId;

        const submission = await Result.findById(submissionId)
            .populate("student", "name email")
            .populate("exam", "title description questions");

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        res.status(200).json({
            success: true,
            submission
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch submission"
        });
    }
};

// ================= EVALUATE SUBMISSION (TEACHER - VIEW ONLY) =================
exports.evaluateSubmission = async (req, res) => {
    try {
        const submissionId = req.params.submissionId;

        const submission = await Result.findById(submissionId)
            .populate("student", "name email")
            .populate("exam", "title description questions");

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        // Auto-evaluated result - just return for viewing
        res.status(200).json({
            success: true,
            message: "Submission retrieved successfully (Auto-evaluated)",
            submission: {
                ...submission.toObject(),
                autoEvaluated: true,
                score: submission.score,
                totalQuestions: submission.totalQuestions,
                status: submission.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve submission"
        });
    }
};