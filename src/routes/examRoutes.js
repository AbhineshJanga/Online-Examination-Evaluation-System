const express = require("express");
const router = express.Router();

const {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    publishExam,
    deleteExam,
    submitExam,
    getMyResults,
    getExamAnalytics,
    getAllSubmissions,
    getSubmissionById,
    evaluateSubmission
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

// ✅ Get exam analytics (Teacher only) - SPECIFIC BEFORE GENERIC
router.get(
    "/analytics/:examId",
    authMiddleware,
    authorizeRoles("teacher"),
    getExamAnalytics
);

// ✅ Get all submissions (Teacher only) - SPECIFIC BEFORE GENERIC
router.get(
    "/submissions",
    authMiddleware,
    authorizeRoles("teacher"),
    getAllSubmissions
);

// ✅ Get single submission by ID (Teacher only)
router.get(
    "/submissions/:submissionId",
    authMiddleware,
    authorizeRoles("teacher"),
    getSubmissionById
);

// ✅ Evaluate a submission (Teacher only)
router.put(
    "/submissions/:submissionId/grade",
    authMiddleware,
    authorizeRoles("teacher"),
    evaluateSubmission
);

// ✅ Publish Exam (Teacher only) - SPECIFIC BEFORE GENERIC
router.put(
    "/:examId/publish",
    authMiddleware,
    authorizeRoles("teacher"),
    publishExam
);

// ✅ Get Single Exam by ID (Teacher, Admin) - GENERIC ROUTES LAST
router.get(
    "/:examId",
    authMiddleware,
    authorizeRoles("teacher", "admin"),
    getExamById
);

// ✅ Update Exam (Teacher only)
router.put(
    "/:examId",
    authMiddleware,
    authorizeRoles("teacher"),
    updateExam
);

// ✅ Delete Exam (Teacher only)
router.delete(
    "/:examId",
    authMiddleware,
    authorizeRoles("teacher"),
    deleteExam
);

module.exports = router;