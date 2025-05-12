// /home/ubuntu/traittune_backend/src/services/engine_service/engine_service.js

const supabase = require("../../config/supabaseClient");
// const openai = require("../../config/openaiClient"); // May be needed for some advanced logic or if open-ended questions are handled here
// const { TraitTuneAdaptiveQuestioningAlgorithmSpecification } = require("../../models/knowledge_base_models"); // Assuming knowledge base models are structured this way

/**
 * @description Initializes a new assessment session for a user.
 * @param {string} userId - The ID of the user (can be anonymous or registered).
 * @param {object} userContext - Contextual information about the user (e.g., role, industry, goals).
 * @returns {Promise<object>} An object containing the session ID and initial questions.
 */
async function startAssessment(userId, userContext) {
  if (!userId) {
    throw new Error("User ID is required to start an assessment.");
  }
  console.log(`Attempting to insert into user_sessions with userId: ${userId}, userContext: ${JSON.stringify(userContext)}`);

  // 1. Create a new session in the user_sessions table
  const { data: insertedData, error: insertError } = await supabase
    .from("user_sessions") // Corrected from user_session
    .insert([{ 
      user_id: userId, 
      started_at: new Date().toISOString()
      // status: "started", // Not in user_sessions schema
      // user_context_data: userContext // Not in user_sessions schema, handled by user_context_metadata table
    }])
    .select("id, user_id, started_at") // Select relevant fields
    .single();

  if (insertError) {
    console.error("Raw insertError object from Supabase:", insertError);
    console.error("Stringified insertError object:", JSON.stringify(insertError, null, 2));
    console.error("Insert Error Code:", insertError.code);
    console.error("Insert Error Message:", insertError.message);
    console.error("Insert Error Details:", insertError.details);
    const errorMessage = insertError.message || `Database operation failed (code: ${insertError.code || 'N/A'}, details: ${insertError.details || 'N/A'})`;
    throw new Error(`Failed to start assessment session: ${errorMessage}`);
  }

  if (!insertedData) {
    console.error("Session data (insertedData) is null after insert/select, and no insertError was reported. This is highly unexpected.");
    throw new Error("Failed to start assessment session: No data returned after insert operation, though no explicit error was thrown by Supabase.");
  }

  const sessionData = insertedData; // Assign to original variable name for downstream consistency
  const sessionId = sessionData.id; // This ID will be used for user_context_metadata and user_results

  // 2. Store user context metadata if provided
  if (userContext && Object.keys(userContext).length > 0) {
    const { error: contextError } = await supabase
      .from("user_context_metadata") // This table is noted as missing in schema_verification_notes.md
      .insert([{ user_id: userId, session_id: sessionId, ...userContext }]); // Spread context directly if columns match
    if (contextError) {
      console.warn("Error saving user context metadata:", contextError);
      // Non-critical error, proceed with assessment
    }
  }

  // 3. Fetch initial anchor questions (e.g., 1-2 per dimension)
  // This logic will be based on TraitTuneAdaptiveQuestioningAlgorithmSpecification
  // For MVP, let's assume a simple fetch of a few starting questions.
  // A more sophisticated approach would involve IRT parameters.

  const { data: initialQuestions, error: questionsError } = await supabase
    .from("questions") // Assuming 'questions' table contains all question types
    .select("id, dimension_id, segment_level, question_type, text_en, text_ru, usecase_tag, irt_difficulty, irt_discriminativeness, answer_options(id, text_en, text_ru, score_value)")
    // .eq("segment_level", 3) // Example: Anchor questions from neutral segment
    // .order("irt_discriminativeness", { ascending: false })
    .limit(5); // Fetching 5 initial questions as a placeholder

  if (questionsError) {
    console.error("Error fetching initial questions:", questionsError);
    // Attempt to clean up the created session if questions can't be fetched?
    // For now, throw an error.
    await supabase.from("assessment_sessions").delete().eq("id", sessionId); // Rollback session
    throw new Error(`Failed to fetch initial questions: ${questionsError.message}`);
  }

  // 4. Initialize user_results for each dimension for this session
  const { data: dimensions, error: dimensionsError } = await supabase
    .from("dimensions")
    .select("id");

  if (dimensionsError) {
    console.error("Error fetching dimensions:", dimensionsError);
    await supabase.from("assessment_sessions").delete().eq("id", sessionId); // Rollback session
    throw new Error(`Failed to fetch dimensions for results initialization: ${dimensionsError.message}`);
  }

  const initialResults = dimensions.map(dim => ({
    session_id: sessionId,
    user_id: userId,
    dimension_id: dim.id,
    // Initialize scores - these will be updated by the scoring service
    normalized_score: 0,
    estimated_theta: 0,
    confidence_score: 0,
    reliability_score: 0,
    question_count: 0
    // status: "pending" // Removed as it's not in the user_results schema
  }));

  const { error: resultsError } = await supabase
    .from("user_results")
    .insert(initialResults);

  if (resultsError) {
    console.error("Error initializing user results:", resultsError);
    await supabase.from("assessment_sessions").delete().eq("id", sessionId); // Rollback session
    throw new Error(`Failed to initialize user results: ${resultsError.message}`);
  }

  return {
    sessionId,
    initialQuestions,
    message: "Assessment session started successfully."
  };
}

/**
 * @description Fetches the next question for the user based on their current state.
 * @param {string} sessionId - The ID of the current assessment session.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} An object containing the next question or completion status.
 */
async function getNextQuestion(sessionId, userId) {
  // This function will implement the core adaptive logic based on:
  // - Current theta estimates for each dimension (from user_results)
  // - Confidence scores for each dimension (from user_results)
  // - IRT parameters of available questions (from questions table)
  // - Session constraints (time, max questions per dimension)
  // - TraitTuneAdaptiveQuestioningAlgorithmSpecification

  // Placeholder logic:
  // 1. Fetch current user_results for the session to understand progress.
  // 2. Identify dimensions needing more questions (low confidence, not yet met question count).
  // 3. Select the best question based on IRT parameters and current theta.
  // 4. Handle Check questions and Open-ended questions triggers.

  // For now, return a placeholder or a random unanswered question
  const { data: nextQuestion, error } = await supabase
    .from("questions")
    .select("id, dimension_id, segment_level, question_type, text_en, text_ru, answer_options(id, text_en, text_ru, score_value)")
    // Add logic to avoid already answered questions for this session
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching next question:", error);
    throw new Error("Failed to fetch next question.");
  }
  if (!nextQuestion) {
    return { status: "completed", message: "Assessment complete. No more questions." };
  }

  return { nextQuestion };
}

/**
 * @description Processes a user's answer to a question.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} questionId - The ID of the question answered.
 * @param {number|string|object} answer - The user's answer (could be option ID, text, etc.).
 * @param {number} responseDurationMs - Time taken to answer in milliseconds.
 * @returns {Promise<object>} An object indicating the result of processing the answer.
 */
async function processAnswerSubmission(sessionId, userId, questionId, answer, responseDurationMs) {
  // 1. Validate inputs
  if (!sessionId || !userId || !questionId || answer === undefined) {
    throw new Error("Missing required parameters for answer submission.");
  }

  // 2. Fetch question details to determine type and dimension
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select("id, dimension_id, question_type")
    .eq("id", questionId)
    .single();

  if (questionError || !question) {
    console.error("Error fetching question details for answer processing:", questionError);
    throw new Error("Invalid question ID or failed to fetch question details.");
  }

  // 3. Store the response
  let responsePayload = {
    session_id: sessionId,
    user_id: userId,
    question_id: questionId,
    response_duration_ms: responseDurationMs,
    // device_type, browser_type, country_code can be added from request headers or client-side info
  };

  let tableName = "user_responses"; // Default for closed-ended

  if (question.question_type === "Open") {
    tableName = "open_responses";
    responsePayload.open_question_id = questionId; // Assuming open_questions table has its own ID space linked from questions
    responsePayload.answer_text_en = typeof answer === 'string' ? answer : JSON.stringify(answer); // Store raw text
    // responsePayload.answer_text_ru = ...; // if applicable
    responsePayload.answer_word_count = typeof answer === 'string' ? answer.split(" ").length : 0;
  } else {
    // Assuming answer is selected_option_id for closed questions
    responsePayload.selected_option_id = answer;
    responsePayload.dimension_id = question.dimension_id;
    // responsePayload.segment_level = question.segment_level; // If needed directly in responses table
  }

  const { error: saveError } = await supabase.from(tableName).insert([responsePayload]);

  if (saveError) {
    console.error(`Error saving user response to ${tableName}:`, saveError);
    throw new Error(`Failed to save response: ${saveError.message}`);
  }

  // 4. Trigger Scoring Service to update theta and other metrics for the dimension
  // This would typically be an async call or a message queue event
  // await scoringService.updateScore(sessionId, userId, question.dimension_id, questionId, answer);
  console.log(`Answer processed for Q${questionId}. Scoring update for Dim${question.dimension_id} should be triggered.`);

  // 5. Trigger Confidence & Reliability Service
  // await confidenceService.updateConfidence(sessionId, userId, question.dimension_id);
  console.log(`Confidence/Reliability update for Dim${question.dimension_id} should be triggered.`);

  // 6. Update session status if needed (e.g., 'in_progress')
  await supabase
    .from("assessment_sessions")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  return { success: true, message: "Answer processed successfully." };
}

module.exports = {
  startAssessment,
  getNextQuestion,
  processAnswerSubmission,
};

