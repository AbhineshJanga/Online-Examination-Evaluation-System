const express = require("express");
const router = express.Router();

const {
    createExam,
    getAllExams,
    submitExam,
    getMyResults,
    getExamAnalytics   
} = require("../controllers/examController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ✅ Create Exam (Teacher only)
router.post(
    "/",
    authMiddleware,
    authorizeRoles("teacher"),
    createExam
);

// ✅ Get All Exams (Student, Teacher, Admin)
router.get(
    "/",
    authMiddleware,
    authorizeRoles("student", "teacher", "admin"),
    getAllExams
);

// ✅ Student submits exam
router.post(
    "/submit",
    authMiddleware,
    authorizeRoles("student"),
    submitExam
);

// ✅ Student views their results
router.get(
    "/my-results",
    authMiddleware,
    authorizeRoles("student"),
    getMyResults
);

// ✅ Get exam analytics (Teacher only)
router.get(
    "/analytics/:examId",
    authMiddleware,
    authorizeRoles("teacher"),
    getExamAnalytics
);


module.exports = router;