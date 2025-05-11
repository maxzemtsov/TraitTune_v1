const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const dataService = require("../services/assessmentDataService");
const logicService = require("../services/assessmentLogicService");

// Constants
const MAX_QUESTIONS_PER_DIMENSION = 10;
const INITIAL_THETA = 0;
const INITIAL_CONFIDENCE = 0.5;
const MIN_QUESTIONS_FOR_CONFIDENCE_CHECK = 3;

let userStates = {};

router.post("/debug/reset-state", (req, res) => {
    const { userId } = req.body;
    if (userId) {
        if (userStates[userId]) {
            delete userStates[userId];
            return res.status(200).json({ message: `State for user ${userId} reset.` });
        }
        return res.status(404).json({ message: `No state found for user ${userId} to reset.` });
    }
    userStates = {};
    res.status(200).json({ message: "All user states reset." });
});

router.get("/questions", authenticateToken, async (req, res) => {
    try {
        const questions = await dataService.getQuestions();
        res.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error.message, error.stack);
        res.status(500).json({ message: "Internal server error fetching questions", error: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined });
    }
});

router.get("/start/:dimensionId", authenticateToken, async (req, res) => {
    const { dimensionId } = req.params;
    const userId = req.user.userId;
    const sessionId = req.user.sessionId || `session_${userId}_${Date.now()}`;

    if (!dimensionId || isNaN(parseInt(dimensionId))) {
        return res.status(400).json({ message: "Invalid dimension ID provided." });
    }

    const dimId = parseInt(dimensionId);

    if (!userStates[userId]) {
        userStates[userId] = {};
    }
    userStates[userId][dimId] = {
        currentTheta: INITIAL_THETA,
        standardError: 1.0,
        questionsAnswered: [],
        responses: [],
        confidenceScore: INITIAL_CONFIDENCE,
        completed: false,
        currentQuestion: null,
        finalSegment: null,
        sessionId: sessionId
    };
    
    const userDimensionState = userStates[userId][dimId];

    try {
        const anchorQuestions = await dataService.getAnchorQuestions(dimId);
        if (!anchorQuestions || anchorQuestions.length === 0) {
            return res.status(400).json({ message: `No anchor questions found for dimension ID ${dimId}. Assessment cannot start.` });
        }
        
        const nextQuestion = anchorQuestions[0];
        userDimensionState.currentQuestion = nextQuestion;
        userDimensionState.completed = false;
        console.log(`[ASSESSMENT_LOG] GET /start - User: ${userId}, DimID: ${dimId}, Started. Next Q ID: ${nextQuestion?.id}`);

        res.json({
            message: `Assessment started for dimension ID ${dimId}. User: ${userId}`,
            nextQuestion: nextQuestion,
            state: userDimensionState
        });
    } catch (error) {
        console.error(`Start Route: Error starting assessment for dimension ID ${dimId}:`, error.message, error.stack);
        res.status(500).json({ message: "Internal server error while starting assessment.", error: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined });
    }
});

router.post("/response", authenticateToken, async (req, res) => {
    const { dimensionId, questionId, answerCode } = req.body;
    const userId = req.user.userId;
    console.log(`[ASSESSMENT_LOG] POST /response - User: ${userId}, DimID: ${dimensionId}, QID: ${questionId}, Ans: ${answerCode}`);

    if (dimensionId === undefined || questionId === undefined || answerCode === undefined || answerCode === null) {
        return res.status(400).json({ message: "Missing dimensionId, questionId, or answerCode." });
    }

    const dimId = parseInt(dimensionId);
    const qId = parseInt(questionId);

    if (!userStates[userId] || !userStates[userId][dimId]) {
        return res.status(400).json({ message: `Assessment not started for dimension ID ${dimId}. Please call /start/:dimensionId first.` });
    }

    const userDimensionState = userStates[userId][dimId];
    const currentSessionId = userDimensionState.sessionId;
    console.log(`[ASSESSMENT_LOG] POST /response - Server state currentQ ID: ${userDimensionState.currentQuestion?.id}, Received qId: ${qId}, Completed: ${userDimensionState.completed}`);

    if (userDimensionState.completed) {
        console.log(`[ASSESSMENT_LOG] POST /response - Assessment already completed for DimID: ${dimId}`);
        return res.status(400).json({ 
            message: `Assessment for dimension ID ${dimId} is already completed.`, 
            finalTheta: userDimensionState.currentTheta,
            finalSegment: userDimensionState.finalSegment,
            confidenceScore: userDimensionState.confidenceScore,
            state: userDimensionState
        });
    }
    
    if (!userDimensionState.currentQuestion || qId !== userDimensionState.currentQuestion.id) {
        console.error(`[ASSESSMENT_LOG] POST /response - ERROR: Question ID mismatch. Expected server currentQ ID: ${userDimensionState.currentQuestion?.id}, Received qId: ${qId}`);
        return res.status(400).json({ message: `Response submitted for question ID ${qId}, but current expected question is ID ${userDimensionState.currentQuestion?.id}.` });
    }
    console.log(`[ASSESSMENT_LOG] POST /response - Question ID match OK. Expected: ${userDimensionState.currentQuestion?.id}, Received: ${qId}`);

    try {
        const question = await dataService.getQuestionById(qId);
        if (!question) {
            return res.status(400).json({ message: `Question with ID ${qId} not found.` });
        }

        const answerOptions = await dataService.getAnswerOptionsForQuestion(qId);
        const dichotomousResponse = logicService.getDichotomousResponse(question, answerCode, answerOptions);

        if (dichotomousResponse === null && (question.question_type === "likert" || question.question_type === "forced" || question.question_type === "scenario")) {
            return res.status(400).json({ message: `Invalid answerCode '${answerCode}' for question ID ${qId} of type ${question.question_type}.` });
        }

        if (dichotomousResponse !== null) {
            await dataService.saveUserResponse({
                userId,
                sessionId: currentSessionId,
                questionId: qId,
                answerCode,
                dichotomousResponse,
            });
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
        console.log(`[ASSESSMENT_LOG] POST /response - Updated theta: ${newTheta}, SE: ${standardError}, Confidence: ${userDimensionState.confidenceScore}, QsAnswered: ${userDimensionState.questionsAnswered.length}`);

        let assessmentCompleted = false;
        let completionReason = "";

        if (userDimensionState.questionsAnswered.length >= MAX_QUESTIONS_PER_DIMENSION) {
            assessmentCompleted = true;
            completionReason = "Max questions reached.";
        }
        
        if (!assessmentCompleted && userDimensionState.questionsAnswered.length >= MIN_QUESTIONS_FOR_CONFIDENCE_CHECK && userDimensionState.confidenceScore >= logicService.TARGET_CONFIDENCE_SCORE) {
            assessmentCompleted = true;
            completionReason = "Target confidence reached.";
        }
        console.log(`[ASSESSMENT_LOG] POST /response - AssessmentCompleted: ${assessmentCompleted}, Reason: '${completionReason}'`);

        if (assessmentCompleted) {
            userDimensionState.completed = true;
            userDimensionState.currentQuestion = null;
            const finalSegment = await logicService.getSegmentForTheta(userDimensionState.currentTheta, dimId);
            userDimensionState.finalSegment = finalSegment;
            
            try {
                await dataService.saveUserDimensionResult({
                    userId,
                    sessionId: currentSessionId,
                    dimensionId: dimId,
                    theta: userDimensionState.currentTheta,
                    segmentId: finalSegment?.id,
                    confidenceScore: userDimensionState.confidenceScore,
                    completed: true
                });
            } catch (dbError) {
                console.error("Response Route: CRITICAL - Error persisting dimension result:", dbError.message, dbError.stack);
                return res.status(500).json({ message: "Critical error saving assessment result.", error: dbError.message, stack: process.env.NODE_ENV === "development" ? dbError.stack : undefined });
            }
            
            console.log(`[ASSESSMENT_LOG] POST /response - Assessment COMPLETED. Returning 200. Reason: ${completionReason}`);
            return res.status(200).json({ 
                message: `Assessment for dimension ID ${dimId} completed: ${completionReason}`,
                nextQuestion: null,
                finalTheta: userDimensionState.currentTheta,
                finalSegment: finalSegment,
                confidenceScore: userDimensionState.confidenceScore,
                state: userDimensionState
            });
        } else {
            const allQuestionsForDimension = (await dataService.getQuestions()).filter(q => 
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
                userDimensionState.currentQuestion = availableQuestions[0];
                console.log(`[ASSESSMENT_LOG] POST /response - Next question selected: ID ${userDimensionState.currentQuestion?.id}. Returning 200.`);
                return res.status(200).json({
                    message: "Response processed.", 
                    nextQuestion: userDimensionState.currentQuestion,
                    state: userDimensionState
                });
            } else {
                userDimensionState.completed = true;
                userDimensionState.currentQuestion = null;
                completionReason = "No more suitable questions available.";
                const finalSegment = await logicService.getSegmentForTheta(userDimensionState.currentTheta, dimId);
                userDimensionState.finalSegment = finalSegment;
                try {
                    await dataService.saveUserDimensionResult({
                        userId,
                        sessionId: currentSessionId,
                        dimensionId: dimId,
                        theta: userDimensionState.currentTheta,
                        segmentId: finalSegment?.id,
                        confidenceScore: userDimensionState.confidenceScore,
                        completed: true
                    });
                } catch (dbError) {
                    console.error("Response Route: CRITICAL - Error persisting dimension result (no more questions):", dbError.message, dbError.stack);
                    return res.status(500).json({ message: "Critical error saving assessment result.", error: dbError.message, stack: process.env.NODE_ENV === "development" ? dbError.stack : undefined });
                }
                console.log(`[ASSESSMENT_LOG] POST /response - Assessment COMPLETED (no more questions). Returning 200. Reason: ${completionReason}`);
                return res.status(200).json({ 
                    message: `Assessment for dimension ID ${dimId} completed: ${completionReason}`,
                    nextQuestion: null,
                    finalTheta: userDimensionState.currentTheta,
                    finalSegment: finalSegment,
                    confidenceScore: userDimensionState.confidenceScore,
                    state: userDimensionState
                });
            }
        }
    } catch (error) {
        console.error("Response Route: General error processing response or in subsequent logic:", error.message, error.stack);
        if (error.message.startsWith("Database operation failed")) {
             return res.status(500).json({ message: "Error during database operation.", error: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined });
        }
        return res.status(500).json({ message: "Error processing assessment operation.", error: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined });
    }
});

router.get("/state/:dimensionId", authenticateToken, (req, res) => {
    const { dimensionId } = req.params;
    const userId = req.user.userId;
    const dimId = parseInt(dimensionId);

    if (!userStates[userId] || !userStates[userId][dimId]) {
        return res.status(400).json({ message: `No assessment state found for user ${userId} and dimension ${dimId}.` });
    }
    console.log(`[ASSESSMENT_LOG] GET /state - User: ${userId}, DimID: ${dimId}, Returning currentQ ID: ${userStates[userId][dimId].currentQuestion?.id}`);
    res.json(userStates[userId][dimId]);
});

router.get("/test-auth", authenticateToken, (req, res) => {
    res.json({ message: "Assessment routes are working and user is authenticated", user: req.user });
});

module.exports = router;

