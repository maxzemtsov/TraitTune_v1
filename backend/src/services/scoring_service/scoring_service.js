// /home/ubuntu/traittune_backend/src/services/scoring_service/scoring_service.js

const supabase = require("../../config/supabaseClient");

/**
 * @description Updates the user's score for a given dimension after a closed-ended question answer.
 * This needs to implement actual IRT 2PL calculations.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension to score.
 * @param {number} questionId - The ID of the question answered.
 * @param {any} answerValue - The value of the answer provided by the user (e.g., pre-processed score from answer_options).
 * @returns {Promise<object>} An object containing the updated scoring information.
 */
async function updateScoreFromClosedQuestion(sessionId, userId, dimensionId, questionId, answerValue) {
  if (!sessionId || !userId || !dimensionId || !questionId || answerValue === undefined) {
    throw new Error("Missing required parameters for updating score from closed question.");
  }

  console.log(`ScoringService: Updating score from closed question for session ${sessionId}, user ${userId}, dimension ${dimensionId}, question ${questionId}.`);

  const { data: currentResult, error: fetchError } = await supabase
    .from("user_results")
    .select("id, estimated_theta, question_count, normalized_score, segment, status")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("dimension_id", dimensionId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") { // PGRST116: single row not found, which is ok for first question
    console.error("Error fetching current user result for scoring:", fetchError);
    throw new Error(`Failed to fetch current result for dimension ${dimensionId}: ${fetchError.message}`);
  }

  let currentTheta = currentResult ? currentResult.estimated_theta : 0;
  let currentQuestionCount = currentResult ? currentResult.question_count : 0;

  const { data: questionIrtParams, error: irtError } = await supabase
    .from("questions")
    .select("irt_difficulty, irt_discriminativeness, is_reverse_scored") // b, a, reverse scoring flag
    .eq("id", questionId)
    .single();

  if (irtError || !questionIrtParams) {
    console.error("Error fetching IRT parameters for question:", irtError);
    throw new Error(`Failed to fetch IRT parameters for question ${questionId}: ${irtError ? irtError.message : "Not found"}`);
  }

  let processedAnswer = answerValue; // This should be the actual score value (e.g. 0,1 for dichotomous, or from Likert mapping)
  if (questionIrtParams.is_reverse_scored) {
    // Assuming a 0-1 scale for dichotomous after processing Likert/ForcedChoice
    // This reverse logic needs to be robust based on actual scale and score_value meaning
    // For example, if score_value is 1 for agree, and it's reverse, it becomes 0 (disagree with trait)
    // This is a placeholder and needs to align with how answerValue is derived and what it represents.
    // processedAnswer = 1 - processedAnswer; 
  }

  // Placeholder for actual IRT 2PL model calculation (e.g., EAP or similar Bayesian update)
  const difficulty = questionIrtParams.irt_difficulty || 0;
  const discriminativeness = questionIrtParams.irt_discriminativeness || 1;
  let newTheta = currentTheta;

  // Simplified placeholder for IRT probability and theta update
  // P(correct | theta) = 1 / (1 + exp(-discriminativeness * (theta - difficulty)))
  // A real implementation would use EAP or similar Bayesian method.
  // This is a very crude approximation and needs to be replaced with proper IRT logic.
  if (processedAnswer > 0.5) { // Assuming processedAnswer is 0 or 1, or a value indicating agreement with keyed direction
    newTheta += 0.15 * discriminativeness * (1 / (currentQuestionCount + 1)); // Diminishing returns, crude positive update
  } else {
    newTheta -= 0.15 * discriminativeness * (1 / (currentQuestionCount + 1)); // Diminishing returns, crude negative update
  }
  newTheta = Math.max(-3.0, Math.min(3.0, parseFloat(newTheta.toFixed(2))));

  const normalizedScore = parseFloat((((newTheta + 3) / 6) * 100).toFixed(2));
  let segment = 3;
  if (newTheta < -1.5) segment = 1;
  else if (newTheta < -0.5) segment = 2;
  else if (newTheta > 0.5) segment = 4;
  else if (newTheta > 1.5) segment = 5;

  const updatedQuestionCount = currentQuestionCount + 1;

  const upsertData = {
    session_id: sessionId,
    user_id: userId,
    dimension_id: dimensionId,
    estimated_theta: newTheta,
    normalized_score: normalizedScore,
    segment: segment,
    question_count: updatedQuestionCount,
    status: "in_progress",
    updated_at: new Date().toISOString(),
  };

  if (currentResult && currentResult.id) {
    upsertData.id = currentResult.id;
  }

  const { data: updatedResult, error: upsertError } = await supabase
    .from("user_results")
    .upsert(upsertData, { onConflict: "session_id, user_id, dimension_id", ignoreDuplicates: false })
    .select()
    .single();

  if (upsertError) {
    console.error("Error upserting user result after scoring:", upsertError);
    throw new Error(`Failed to upsert result for dimension ${dimensionId}: ${upsertError.message}`);
  }

  console.log(`ScoringService: Score from closed question updated for session ${sessionId}, dimension ${dimensionId}. New Theta: ${newTheta}`);
  return updatedResult;
}

/**
 * @description Applies theta adjustment based on LLM analysis of an open-ended response.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension to adjust.
 * @param {number} llmInferredTheta - The theta inferred by the LLM.
 * @param {number} llmConfidence - The confidence of the LLM in its inference (0.0 to 1.0).
 * @returns {Promise<object>} An object containing the updated scoring information.
 */
async function applyLlmThetaAdjustment(sessionId, userId, dimensionId, llmInferredTheta, llmConfidence) {
  if (!sessionId || !userId || !dimensionId || llmInferredTheta === undefined || llmConfidence === undefined) {
    throw new Error("Missing required parameters for LLM theta adjustment.");
  }
  console.log(`ScoringService: Applying LLM theta adjustment for session ${sessionId}, dim ${dimensionId}. LLM Theta: ${llmInferredTheta}, LLM Confidence: ${llmConfidence}`);

  const { data: currentResult, error: fetchError } = await supabase
    .from("user_results")
    .select("id, estimated_theta, question_count, llm_adjustment_count") // Added llm_adjustment_count
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("dimension_id", dimensionId)
    .single();

  if (fetchError || !currentResult) {
    console.error("Error fetching current user result for LLM adjustment:", fetchError);
    throw new Error(`Failed to fetch current result for dimension ${dimensionId} for LLM adjustment. Ensure initial scoring has occurred.`);
  }

  let currentTheta = currentResult.estimated_theta || 0;
  let llmAdjustmentCount = currentResult.llm_adjustment_count || 0;

  // Weight for current theta (e.g., based on number of closed questions answered)
  const weightCurrentTheta = currentResult.question_count || 5; // Default to a weight if no questions answered yet (should not happen if LLM is triggered by low confidence)
  
  // Weight for LLM's theta, scaled by its confidence. Max weight for LLM could be e.g., 2-3 'question equivalents'.
  // This weight can be adjusted based on psychometric calibration.
  const baseLlmWeight = 2.5; 
  const weightLlmTheta = llmConfidence * baseLlmWeight * Math.pow(0.8, llmAdjustmentCount); // Diminishing impact for multiple LLM adjustments

  let newEstimatedTheta = ((currentTheta * weightCurrentTheta) + (llmInferredTheta * weightLlmTheta)) / (weightCurrentTheta + weightLlmTheta);
  newEstimatedTheta = Math.max(-3.0, Math.min(3.0, parseFloat(newEstimatedTheta.toFixed(2))));

  const normalizedScore = parseFloat((((newEstimatedTheta + 3) / 6) * 100).toFixed(2));
  let segment = 3;
  if (newEstimatedTheta < -1.5) segment = 1;
  else if (newEstimatedTheta < -0.5) segment = 2;
  else if (newEstimatedTheta > 0.5) segment = 4;
  else if (newEstimatedTheta > 1.5) segment = 5;

  const { data: updatedResult, error: updateError } = await supabase
    .from("user_results")
    .update({
      estimated_theta: newEstimatedTheta,
      normalized_score: normalizedScore,
      segment: segment,
      llm_adjustment_count: llmAdjustmentCount + 1,
      last_llm_inferred_theta: llmInferredTheta, // Store for audit/reference
      last_llm_confidence: llmConfidence, // Store for audit/reference
      updated_at: new Date().toISOString(),
    })
    .eq("id", currentResult.id)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating user result after LLM theta adjustment:", updateError);
    throw new Error(`Failed to update result for dimension ${dimensionId} after LLM adjustment: ${updateError.message}`);
  }
  console.log(`ScoringService: LLM Theta adjustment applied for Dim${dimensionId}. New Theta: ${newEstimatedTheta}`);
  return updatedResult;
}


/**
 * @description Placeholder for calculating final scores and segments upon assessment completion.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 */
async function finalizeScores(sessionId, userId) {
  console.log(`ScoringService: Finalizing scores for session ${sessionId}, user ${userId}.`);
  // This might involve updating the overall session status in `user_sessions` table and all user_results to 'completed'.
  const { error } = await supabase
    .from("user_results")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("session_id", sessionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error finalizing scores in user_results:", error);
    // Decide if this should throw or just log
  }
  return { success: true, message: "Scores finalized (placeholder)." };
}

module.exports = {
  updateScoreFromClosedQuestion, // Renamed from updateScore
  applyLlmThetaAdjustment,
  finalizeScores,
};

