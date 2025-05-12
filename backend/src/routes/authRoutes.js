const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

// @route   GET /api/auth/me
// @desc    Get current user details from JWT
// @access  Private (requires token)
router.get("/me", authenticateToken, (req, res) => {
    // The authenticateToken middleware has already validated the token
    // and attached the user payload to req.user.
    // We can choose to send back the entire req.user object or a curated version.
    // For an MVP, sending the whole object is often fine for the frontend to use.
    if (req.user) {
        res.json(req.user);
    } else {
        // This case should ideally not be reached if authenticateToken is working correctly
        // and sending 401/403 for invalid/missing tokens.
        res.status(500).json({ message: "Error retrieving user information after authentication." });
    }
});

module.exports = router;

