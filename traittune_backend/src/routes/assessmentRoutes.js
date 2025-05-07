const express = require("express");
const router = express.Router();
const engineService = require("../services/engine_service/engine_service");

// POST /api/v1/assessment/start
router.post("/start", async (req, res, next) => {
  try {
    const { userId, userContext } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    // userContext can be optional or have defaults handled by the service
    const result = await engineService.startAssessment(userId, userContext || {});
    res.status(201).json(result); // 201 Created for successful resource creation
  } catch (error) {
    console.error("Error in /assessment/start route:", error);
    // Pass to global error handler, or handle more specifically
    next(error); 
  }
});

// TODO: Add other assessment-related routes here if needed, e.g.,
// router.post("/answer", async (req, res, next) => { ... });
// router.get("/:sessionId/next-question", async (req, res, next) => { ... });

module.exports = router;

