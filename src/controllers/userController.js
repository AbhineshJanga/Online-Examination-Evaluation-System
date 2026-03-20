// controllers/userController.js

const User = require("../models/User");

// Allowed roles
const allowedRoles = ["admin", "teacher", "student"];

// @desc Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

// @desc Get single user
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user"
        });
    }
};

// @desc Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        // ✅ Check if role provided
        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Role is required"
            });
        }

        // ✅ Validate role
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await User.findById(req.params.id);

        // ✅ Check user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: "User role updated",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update role"
        });
    }
};

// @desc Delete user
exports.deleteUser = async (req, res) => {
    try {
        // ✅ Prevent admin deleting themselves
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
            message: "User deleted"
        }); 

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
};