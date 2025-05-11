const { query } = require("../config/db"); // Assuming db.js exports a query function for Supabase

// Helper to ensure consistent error handling for DB operations
async function executeQuery(sql, params) {
    try {
        const { rows } = await query(sql, params);
        return rows;
    } catch (error) {
        console.error("Database query error:", error.message);
        console.error("SQL:", sql);
        console.error("Params:", params);
        throw new Error(`Database operation failed: ${error.message}`); // Re-throw to be caught by service method
    }
}

// --- Data Retrieval Functions (Direct DB Access) ---

async function getQuestions() {
    return executeQuery("SELECT * FROM questions ORDER BY id ASC");
}

async function getOpenQuestions() {
    return executeQuery("SELECT * FROM open_questions ORDER BY id ASC");
}

async function getAnswerOptions() {
    return executeQuery("SELECT * FROM answer_options ORDER BY id ASC");
}

async function getAnswerOptionsForQuestion(questionId) {
    const qId = parseInt(questionId);
    if (isNaN(qId)) throw new Error("Invalid questionId provided to getAnswerOptionsForQuestion");
    return executeQuery("SELECT * FROM answer_options WHERE question_id = $1 ORDER BY id ASC", [qId]);
}

async function getSegments() {
    return executeQuery("SELECT * FROM segments ORDER BY dimension_id ASC, segment_level ASC");
}

async function getInterpretationTemplates() {
    return executeQuery("SELECT * FROM interpretation_templates ORDER BY id ASC");
}

async function getQuestionById(id) {
    const questionId = parseInt(id);
    if (isNaN(questionId)) throw new Error("Invalid id provided to getQuestionById");
    const results = await executeQuery("SELECT * FROM questions WHERE id = $1", [questionId]);
    return results[0] || null; // Return the first row or null if not found
}

async function getOpenQuestionById(id) {
    const openQuestionId = parseInt(id);
    if (isNaN(openQuestionId)) throw new Error("Invalid id provided to getOpenQuestionById");
    const results = await executeQuery("SELECT * FROM open_questions WHERE id = $1", [openQuestionId]);
    return results[0] || null;
}

async function getAnchorQuestions(dimensionId) {
    const dimId = parseInt(dimensionId);
    if (isNaN(dimId)) throw new Error("Invalid dimensionId provided to getAnchorQuestions");
    const sql = `
        SELECT *
        FROM questions
        WHERE dimension_id = $1
          AND question_type = 'likert'
          AND segment_level = 3
          AND irt_discriminativeness IS NOT NULL
        ORDER BY irt_discriminativeness DESC
        LIMIT 2;
    `;
    return executeQuery(sql, [dimId]);
}

// --- Data Persistence Functions ---

async function saveUserResponse(responseData) {
    const {
        userId,
        sessionId,
        questionId,
        answerCode,
        dichotomousResponse,
    } = responseData;

    if (!userId || !sessionId || questionId === undefined || answerCode === undefined) {
        throw new Error("Missing required fields for saving user response (userId, sessionId, questionId, answerCode).");
    }

    const sql = `
        INSERT INTO user_responses 
        (user_id, session_id, question_id, answer_code, dichotomous_response, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *;
    `;
    const dr = (dichotomousResponse === null || dichotomousResponse === undefined) ? null : parseInt(dichotomousResponse);

    const params = [userId, sessionId, parseInt(questionId), answerCode, dr];
    const result = await executeQuery(sql, params);
    console.log("User response saved:", result[0]);
    return result[0];
}

async function saveUserDimensionResult(resultData) {
    const {
        userId,
        sessionId,
        dimensionId,
        theta,
        segmentId, // This can be null or undefined if no segment is found
        confidenceScore,
        completed
    } = resultData;

    if (!userId || !sessionId || dimensionId === undefined || theta === undefined || confidenceScore === undefined || completed === undefined) {
        // segmentId is allowed to be null/undefined here, will be handled before DB insert
        throw new Error("Missing required fields for saving user dimension result (userId, sessionId, dimensionId, theta, confidenceScore, completed).");
    }

    const parsedSegmentId = parseInt(segmentId);
    const dbSegmentId = isNaN(parsedSegmentId) ? null : parsedSegmentId;

    const sql = `
        INSERT INTO user_results 
        (user_id, session_id, dimension_id, theta, segment_id, confidence_score, completed, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (user_id, session_id, dimension_id) 
        DO UPDATE SET
            theta = EXCLUDED.theta,
            segment_id = EXCLUDED.segment_id,
            confidence_score = EXCLUDED.confidence_score,
            completed = EXCLUDED.completed,
            updated_at = NOW()
        RETURNING *;
    `;
    const params = [
        userId, 
        sessionId, 
        parseInt(dimensionId), 
        parseFloat(theta),
        dbSegmentId, // Use the handled segmentId (null if NaN)
        parseFloat(confidenceScore),
        Boolean(completed)
    ];
    const result = await executeQuery(sql, params);
    console.log("User dimension result saved/updated:", result[0]);
    return result[0];
}

module.exports = {
    getQuestions,
    getOpenQuestions,
    getAnswerOptions,
    getAnswerOptionsForQuestion,
    getSegments,
    getInterpretationTemplates,
    getQuestionById,
    getOpenQuestionById,
    getAnchorQuestions,
    saveUserResponse,
    saveUserDimensionResult,
};

