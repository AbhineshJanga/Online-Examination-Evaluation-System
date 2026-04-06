const User = require("../models/User");
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const ActivityLog = require("../models/ActivityLog");

// ================= GET ALL USERS =================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= DELETE USER =================
exports.deleteUser = async (req, res) => {
    try {
        // Prevent admin deleting themselves
        if (req.user.id === req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Admin cannot delete themselves"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= GET ALL EXAMS =================
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find();

        res.status(200).json({
            success: true,
            count: exams.length,
            exams
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= DELETE EXAM =================
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        await exam.deleteOne();

        res.status(200).json({
            success: true,
            message: "Exam deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= GET ADMIN STATS =================
exports.getAdminStats = async (req, res) => {
    try {
        // Total Students
        const totalStudents = await User.countDocuments({ role: "student" });

        // Total Teachers
        const totalTeachers = await User.countDocuments({ role: "teacher" });

        // Total Exams
        const totalExams = await Exam.countDocuments();

        // Active Exams (for now same as total or you can improve later)
        const activeExams = totalExams;

        res.status(200).json({
            success: true,
            totalStudents,
            totalTeachers,
            totalExams,
            activeExams
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ================= GET RECENT ACTIVITY =================
exports.getRecentActivity = async (req, res) => {
    try {
        const activities = await ActivityLog.find()
            .populate("userId", "name email")
            .sort({ timestamp: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            activities
        });
    } catch (error) {
        console.error("Error fetching activity:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ================= GET MONITORING SESSIONS (Real-time) =================
exports.getMonitoringSessions = (req, res) => {
    try {
        // Get active sessions from app.locals (stored in Socket.IO)
        const activeSessions = req.app.locals.activeSessions || {};
        
        // Convert to array and return
        const sessions = Object.values(activeSessions);

        res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error("Error fetching monitoring sessions:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ================= GET SINGLE SESSION BY ID =================
exports.getSessionById = (req, res) => {
    try {
        const { id } = req.params;
        const activeSessions = req.app.locals.activeSessions || {};

        const session = activeSessions[id];

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        res.status(200).json({
            success: true,
            session
        });
    } catch (error) {
        console.error("Error fetching session:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ================= GET RESULTS SUMMARY =================
exports.getResultsSummary = async (req, res) => {
    try {
        // Correct field names: exam and student (not examId/studentId)
        const results = await Result.find()
            .populate("exam", "title")
            .populate("student", "name email");

        let totalAppeared = results.length;
        let totalPassed = 0;
        let totalFailed = 0;

        // Group by exam for exam-wise performance
        const examResults = {};

        results.forEach(r => {
            // Pass/fail logic: score >= 50% of total questions
            const passingScore = (r.totalQuestions || 0) * 0.5;
            const isPassed = r.score >= passingScore;

            if (isPassed) {
                totalPassed++;
            } else {
                totalFailed++;
            }

            // Group by exam
            const examId = r.exam?._id;
            if (!examResults[examId]) {
                examResults[examId] = {
                    examId: examId,
                    examName: r.exam?.title || "Unknown Exam",
                    appeared: 0,
                    passed: 0,
                    failed: 0
                };
            }

            examResults[examId].appeared++;
            if (isPassed) {
                examResults[examId].passed++;
            } else {
                examResults[examId].failed++;
            }
        });

        const passPercentage = totalAppeared ? Math.round((totalPassed / totalAppeared) * 100) : 0;

        // Calculate pass percentage for each exam
        const examResultsWithPercent = Object.values(examResults).map(exam => ({
            ...exam,
            passPercentage: exam.appeared ? Math.round((exam.passed / exam.appeared) * 100) : 0
        }));

        res.status(200).json({
            success: true,
            summary: {
                totalAppeared,
                totalPassed,
                totalFailed,
                passPercentage
            },
            examResults: examResultsWithPercent
        });
    } catch (error) {
        console.error("🔥 RESULT ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching results: " + error.message
        });
    }
};