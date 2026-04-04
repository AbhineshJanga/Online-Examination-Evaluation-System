const User = require("../models/User");
const Exam = require("../models/Exam");

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