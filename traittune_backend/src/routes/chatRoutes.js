// /home/ubuntu/traittune_backend/src/routes/chatRoutes.js

const express = require("express");
const router = express.Router();
const engineService = require("../services/engine_service/engine_service");
const llmService = require("../services/llm_service/llm_service");
const userService = require("../services/user_service/user_service");
const scoringService = require("../services/scoring_service/scoring_service");
const confidenceService = require("../services/confidence_service/confidence_service");

// Middleware to ensure session and user IDs are present
// This is a basic example; more robust validation would be needed
const ensureSessionUser = (req, res, next) => {
  const { userId, sessionId } = req.body;
  if (!userId || !sessionId) {
    return res.status(400).json({ message: "User ID and Session ID are required." });
  }
  req.userId = userId;
  req.sessionId = sessionId;
  next();
};

/**
 * @route POST /api/v1/chat/initiate
 * @description Initiates a new chat session or retrieves the current state.
 *              This could involve creating a user session and fetching the first question(s).
 */
router.post("/initiate", async (req, res) => {
  const { userId, language } = req.body; // language can be 'en' or 'ru'
  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required to initiate chat." });
    }
    // Create or get user context metadata (e.g., for language preference)
    await userService.updateOrCreateUserContextMetadata(userId, null, { language_preference: language || "en" });

    const sessionData = await engineService.startOrResumeSession(userId, language || "en");
    // The first message/question would come from sessionData
    res.status(200).json({
      sessionId: sessionData.sessionId,
      message: {
        text: sessionData.currentQuestion ? sessionData.currentQuestion.text_en : "Welcome to TraitTune! Let's begin.", // Adjust based on language
        sender: "ai",
      }
    });
  } catch (error) {
    console.error("Error initiating chat session:", error);
    res.status(500).json({ message: error.message || "Failed to initiate chat session." });
  }
});

/**
 * @route POST /api/v1/chat/message
 * @description Handles a user's message, processes it, and returns the AI's response (next question or info).
 */
router.post("/message", ensureSessionUser, async (req, res) => {
  const { message, context } = req.body; // context might include currentDimensionId, etc.
  const { userId, sessionId } = req;

  try {
    // 1. Process the user's answer
    const answerResult = await engineService.processAnswer(sessionId, userId, context.currentQuestionId, message, context.language || "en");

    // answerResult should contain the next question or an indication that the assessment/dimension is complete.
    let aiResponseText = "Thank you for your response.";
    let nextQuestionDetails = null;

    if (answerResult.status === "completed" || answerResult.status === "dimension_completed") {
      // Potentially fetch a summary or report preview if a dimension or assessment is complete
      aiResponseText = answerResult.message || "Dimension completed. Moving to the next or finalizing.";
      if(answerResult.nextQuestion) {
        nextQuestionDetails = answerResult.nextQuestion;
        aiResponseText = nextQuestionDetails.text_en; // Or based on language
      }
    } else if (answerResult.nextQuestion) {
      nextQuestionDetails = answerResult.nextQuestion;
      aiResponseText = nextQuestionDetails.text_en; // Or based on language
    } else if (answerResult.clarificationQuestion) {
      nextQuestionDetails = answerResult.clarificationQuestion; // This might be an open-ended or consistency prompt
      aiResponseText = nextQuestionDetails.text_en; // Or based on language
    }

    res.status(200).json({
      text: aiResponseText,
      sender: "ai",
      nextQuestion: nextQuestionDetails, // Send full next question object if available
      sessionStatus: answerResult.status,
      // Include other relevant data like updated scores, confidence, etc., if needed by frontend immediately
    });

  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ message: error.message || "Failed to process message." });
  }
});

module.exports = router;

