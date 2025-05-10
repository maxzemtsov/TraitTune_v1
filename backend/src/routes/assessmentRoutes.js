const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const dataService = require("../services/assessmentDataService");
const logicService = require("../services/assessmentLogicService");

// Constants
const MAX_QUESTIONS_PER_DIMENSION = 10; // As per PRD, can be adjusted
const INITIAL_THETA = 0;
const INITIAL_CONFIDENCE = 0.5; // Starting confidence, will be updated by SE
const MIN_QUESTIONS_FOR_CONFIDENCE_CHECK = 3; // Minimum questions before checking confidence-based completion

// All assessment routes should be protected (except debug routes)
// router.use(authenticateToken); // Apply selectively or mock for tests

// In-memory store for user assessment states
// Structure: { userId: { dimensionId: { currentTheta: 0, standardError: 1.0, questionsAnswered: [], responses: [], confidenceScore: 0.5, completed: false, currentQuestion: null, finalSegment: null } } }
let userStates = {}; // Changed to let to allow reassignment for reset

// --- DEBUG ROUTE FOR TEST STATE RESET ---
// This route should ideally be protected or only available in test environments.
router.post("/debug/reset-state", (req, res) => {
    const { userId } = req.body;
    if (userId) {
        if (userStates[userId]) {
            delete userStates[userId];
            return res.status(200).json({ message: `State for user ${userId} reset.` });
        }
        return res.status(404).json({ message: `No state found for user ${userId} to reset.` });
    }
    userStates = {}; // Reset all states if no userId is provided
    res.status(200).json({ message: "All user states reset." });
});
// --- END DEBUG ROUTE ---


/**
 * @swagger
 * /api/assessment/questions:
 *   get:
 *     summary: Get all assessment questions (for debugging/dev)
 *     description: Retrieves a list of all available assessment questions. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of questions.
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/questions", authenticateToken, (req, res) => {
    try {
        const questions = dataService.getQuestions();
        res.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/assessment/start/{dimensionId}:
 *   get:
 *     summary: Start or continue an assessment for a specific dimension
 *     description: Retrieves initial anchor questions or the current state for the given dimension ID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dimensionId
 *         required: true
 *         description: The ID of the dimension to start/continue the assessment for.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved anchor questions or current state.
 *       400:
 *         description: Invalid dimension ID or no anchor questions found.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get("/start/:dimensionId", authenticateToken, (req, res) => {
    const { dimensionId } = req.params;
    const userId = req.user.userId; 

    if (!dimensionId || isNaN(parseInt(dimensionId))) {
        return res.status(400).json({ message: "Invalid dimension ID provided." });
    }

    const dimId = parseInt(dimensionId);

    if (!userStates[userId]) {
        userStates[userId] = {};
    }
    if (!userStates[userId][dimId] || userStates[userId][dimId].completed) { // Reset if completed for a fresh start
        userStates[userId][dimId] = {
            currentTheta: INITIAL_THETA,
            standardError: 1.0, // Initial high SE
            questionsAnswered: [],
            responses: [],
            confidenceScore: INITIAL_CONFIDENCE,
            completed: false,
            currentQuestion: null,
            finalSegment: null
        };
    }

    const userDimensionState = userStates[userId][dimId];

    // This condition was causing issues with restarting a completed dimension for tests.
    // if (userDimensionState.completed) {
    //     return res.json({
    //         message: `Assessment for dimension ID ${dimId} is already completed.`,
    //         state: userDimensionState,
    //         nextQuestion: null
    //     });
    // }

    if (userDimensionState.currentQuestion && !userDimensionState.completed) { // Only return current if not completed
        return res.json({
            message: `Continuing assessment for dimension ID ${dimId}.`,
            nextQuestion: userDimensionState.currentQuestion,
            state: userDimensionState
        });
    }

    try {
        const anchorQuestions = dataService.getAnchorQuestions(dimId);
        if (!anchorQuestions || anchorQuestions.length === 0) {
            return res.status(400).json({ message: `No anchor questions found for dimension ID ${dimId}.` });
        }
        
        const nextQuestion = anchorQuestions[0];
        userDimensionState.currentQuestion = nextQuestion;
        userDimensionState.completed = false; // Ensure it is not marked completed at start

        res.json({
            message: `Assessment started for dimension ID ${dimId}. User: ${userId}`,
            nextQuestion: nextQuestion,
            state: userDimensionState
        });
    } catch (error) {
        console.error(`Error starting assessment for dimension ID ${dimId}:`, error);
        res.status(500).json({ message: "Internal server error while starting assessment." });
    }
});

/**
 * @swagger
 * /api/assessment/response:
 *   post:
 *     summary: Submit a response to an assessment question
 *     description: Processes the userresponse, updates their trait estimate (theta) for the dimension, and returns the next question or completion status. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dimensionId
 *               - questionId
 *               - answerCode
 *             properties:
 *               dimensionId:
 *                 type: integer
 *               questionId:
 *                 type: integer
 *               answerCode:
 *                 type: string 
 *     responses:
 *       200:
 *         description: Response processed successfully. Returns next question or completion status.
 *       400:
 *         description: Invalid input or assessment not started for this dimension.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.post("/response", authenticateToken, (req, res) => {
    const { dimensionId, questionId, answerCode } = req.body;
    const userId = req.user.userId;

    if (dimensionId === undefined || questionId === undefined || answerCode === undefined || answerCode === null) {
        return res.status(400).json({ message: "Missing dimensionId, questionId, or answerCode." });
    }

    const dimId = parseInt(dimensionId);
    const qId = parseInt(questionId);

    if (!userStates[userId] || !userStates[userId][dimId]) {
        return res.status(400).json({ message: `Assessment not started for dimension ID ${dimId}. Please call /start/:dimensionId first.` });
    }

    const userDimensionState = userStates[userId][dimId];

    if (userDimensionState.completed) {
        // This was causing the "unexpected question" test to fail because the state was already completed.
        // Now, if it is completed, we should not process further responses for this dimension.
        return res.status(400).json({ message: `Assessment for dimension ID ${dimId} is already completed.` });
    }

    const question = dataService.getQuestionById(qId);
    if (!question) {
        return res.status(400).json({ message: `Question with ID ${qId} not found.` });
    }

    // Check if the submitted questionId is the one we expect
    if (!userDimensionState.currentQuestion || qId !== userDimensionState.currentQuestion.id) {
        return res.status(400).json({ message: `Response submitted for question ID ${qId}, but current expected question is ID ${userDimensionState.currentQuestion?.id}.` });
    }

    const answerOptions = dataService.getAnswerOptionsForQuestion(qId);
    const dichotomousResponse = logicService.getDichotomousResponse(question, answerCode, answerOptions);

    if (dichotomousResponse === null && (question.question_type === "likert" || question.question_type === "forced" || question.question_type === "scenario")) {
        return res.status(400).json({ message: `Invalid answerCode '${answerCode}' for question ID ${qId} of type ${question.question_type}.` });
    }

    if (dichotomousResponse !== null) {
        userDimensionState.responses.push({
            questionId: qId,
            dichotomousResponse: dichotomousResponse,
            item_a: question.irt_discriminativeness,
            item_b: question.irt_difficulty,
            item_c: question.irt_guessing || 0 
        });
    }

    if (!userDimensionState.questionsAnswered.includes(qId)) {
        userDimensionState.questionsAnswered.push(qId);
    }

    const { newTheta, standardError } = logicService.estimateTheta(userDimensionState.responses, userDimensionState.currentTheta);
    userDimensionState.currentTheta = newTheta;
    userDimensionState.standardError = standardError;
    userDimensionState.confidenceScore = logicService.calculateConfidenceScore(standardError);

    let completionMessage = `Dim ${dimId} for user ${userId} completed: Max questions reached.`;
    let assessmentCompleted = false;
    if (userDimensionState.questionsAnswered.length >= MAX_QUESTIONS_PER_DIMENSION) {
        assessmentCompleted = true;
    }
    if (!assessmentCompleted && userDimensionState.questionsAnswered.length >= MIN_QUESTIONS_FOR_CONFIDENCE_CHECK && userDimensionState.confidenceScore >= logicService.TARGET_CONFIDENCE_SCORE) {
        assessmentCompleted = true;
        completionMessage = `Dim ${dimId} for user ${userId} completed: Target confidence reached.`;
    }

    console.log(`User ${userId}, Dim ${dimId}, Q ${qId}, Answer ${answerCode}, Dichotomous ${dichotomousResponse}. Theta: ${newTheta.toFixed(3)}, SE: ${standardError.toFixed(3)}, Conf: ${userDimensionState.confidenceScore.toFixed(2)}, Answered: ${userDimensionState.questionsAnswered.length}`);

    let nextQuestionToAssign = null;
    if (assessmentCompleted) {
        userDimensionState.completed = true;
        userDimensionState.currentQuestion = null;
        const finalSegment = logicService.getSegmentForTheta(userDimensionState.currentTheta, dimId);
        userDimensionState.finalSegment = finalSegment;
        console.log(`Persisting results for User ${userId}, Dim ${dimId}: Theta ${userDimensionState.currentTheta}, Segment ${finalSegment?.name_en || 'N/A'}. Reason: ${completionMessage}`);
        
        return res.json({
            message: completionMessage.replace(`Dim ${dimId} for user ${userId} completed: `, `Assessment for dimension ID ${dimId} completed: `).trim(),
            nextQuestion: null,
            finalTheta: userDimensionState.currentTheta,
            finalSegment: finalSegment,
            confidenceScore: userDimensionState.confidenceScore,
            state: userDimensionState
        });
    } else {
        const allQuestionsForDimension = dataService.getQuestions().filter(q => 
            q.dimension_id === dimId && 
            (q.question_type === 'likert' || q.question_type === 'forced' || q.question_type === 'scenario') &&
            q.irt_discriminativeness !== null && q.irt_difficulty !== null
        );
        const availableQuestions = allQuestionsForDimension.filter(q => !userDimensionState.questionsAnswered.includes(q.id));

        if (availableQuestions.length > 0) {
            availableQuestions.sort((a, b) => {
                const diffA = Math.abs(parseFloat(a.irt_difficulty) - userDimensionState.currentTheta);
                const diffB = Math.abs(parseFloat(b.irt_difficulty) - userDimensionState.currentTheta);
                if (diffA === diffB) {
                    return parseFloat(b.irt_discriminativeness) - parseFloat(a.irt_discriminativeness);
                }
                return diffA - diffB;
            });
            nextQuestionToAssign = availableQuestions[0];
        } else {
            userDimensionState.completed = true;
            userDimensionState.currentQuestion = null;
            const finalSegment = logicService.getSegmentForTheta(userDimensionState.currentTheta, dimId);
            userDimensionState.finalSegment = finalSegment;
            completionMessage = `Assessment for dimension ID ${dimId} completed (no more suitable questions).`;
            console.log(`Persisting results (no more questions) for User ${userId}, Dim ${dimId}: Theta ${userDimensionState.currentTheta}, Segment ${finalSegment?.name_en || 'N/A'}`);

            return res.json({
                message: completionMessage,
                nextQuestion: null,
                finalTheta: userDimensionState.currentTheta,
                finalSegment: finalSegment,
                confidenceScore: userDimensionState.confidenceScore,
                state: userDimensionState
            });
        }
    }

    userDimensionState.currentQuestion = nextQuestionToAssign;
    res.json({
        message: "Response processed.",
        nextQuestion: userDimensionState.currentQuestion,
        state: userDimensionState
    });
});

router.get("/state/:dimensionId", authenticateToken, (req, res) => {
    const { dimensionId } = req.params;
    const userId = req.user.userId;
    const dimId = parseInt(dimensionId);

    if (!userStates[userId] || !userStates[userId][dimId]) {
        return res.status(400).json({ message: `No assessment state found for user ${userId} and dimension ${dimId}.` });
    }
    res.json(userStates[userId][dimId]);
});

router.get("/test-auth", authenticateToken, (req, res) => {
    res.json({ message: "Assessment routes are working and user is authenticated", user: req.user });
});

module.exports = router;

