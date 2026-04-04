const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  deleteUser,
  getAllExams,
  deleteExam,
} = require("../controllers/adminController");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Users
router.get("/users", verifyToken, authorizeRoles("admin"), getAllUsers);
router.delete("/user/:id", verifyToken, authorizeRoles("admin"), deleteUser);

// Exams
router.get("/exams", verifyToken, authorizeRoles("admin"), getAllExams);
router.delete("/exam/:id", verifyToken, authorizeRoles("admin"), deleteExam);

module.exports = router;