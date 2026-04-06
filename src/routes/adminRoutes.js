const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  deleteUser,
  getAllExams,
  deleteExam,
  getAdminStats,
  getRecentActivity,
  getMonitoringSessions,
  getSessionById,
  getResultsSummary,
} = require("../controllers/adminController");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Admin Stats
router.get("/stats", verifyToken, authorizeRoles("admin"), getAdminStats);

// Activity
router.get("/activity", verifyToken, authorizeRoles("admin"), getRecentActivity);

// Monitoring Sessions (Real-time)
router.get("/monitoring/sessions", verifyToken, authorizeRoles("admin"), getMonitoringSessions);
router.get("/monitoring/:id", verifyToken, authorizeRoles("admin"), getSessionById);

// Results
router.get("/results", verifyToken, authorizeRoles("admin"), getResultsSummary);

// Users
router.get("/users", verifyToken, authorizeRoles("admin"), getAllUsers);
router.delete("/user/:id", verifyToken, authorizeRoles("admin"), deleteUser);

// Exams
router.get("/exams", verifyToken, authorizeRoles("admin"), getAllExams);
router.delete("/exam/:id", verifyToken, authorizeRoles("admin"), deleteExam);

module.exports = router;