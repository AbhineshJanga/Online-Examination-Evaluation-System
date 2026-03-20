// routes/userRoutes.js

const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// All routes below are Admin only

router.get("/", authMiddleware, authorizeRoles("admin"), getAllUsers);

router.get("/:id", authMiddleware, authorizeRoles("admin"), getUserById);

router.put("/:id", authMiddleware, authorizeRoles("admin"), updateUserRole);

router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteUser);

module.exports = router;