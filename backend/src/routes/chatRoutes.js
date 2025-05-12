const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

// Placeholder for chat routes
// Example: POST /api/chat/send
// Example: GET /api/chat/history

// All chat routes should be protected
router.use(authenticateToken);

router.get("/test", (req, res) => {
    res.json({ message: "Chat routes are working", user: req.user });
});

module.exports = router;

