// /home/ubuntu/traittune_backend/src/services/scoring_service/scoring_service.js

const supabase = require("../../config/supabaseClient");
// const openai = require("../../config/openaiClient"); // For LLM-based scoring contributions
// const { TraitTune2PLIRTModelImplementation } = require("../../models/knowledge_base_models"); // Placeholder for IRT logic access

/**
 * @description Updates the user's score for a given dimension after an answer.
 * This is a placeholder and will need to implement actual IRT 2PL calculations.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension to score.
 * @param {number} questionId - The ID of the question answered.
 * @param {any} answerValue - The value of the answer provided by the user.
 * @returns {Promise<object>} An object containing the updated scoring information.
 */
async function updateScore(sessionId, userId, dimensionId, questionId, answerValue) {
  if (!sessionId || !userId || !dimensionId || !questionId || answerValue === undefined) {
    throw new Error("Missing required parameters for updating score.");
  }

  console.log(`ScoringService: Received request to update score for session ${sessionId}, user ${userId}, dimension ${dimensionId}, question ${questionId}.`);

  // 1. Fetch current user_results for the dimension
  const { data: currentResult, error: fetchError } = await supabase
    .from("user_results")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("dimension_id", dimensionId)
    .single();

  if (fetchError || !currentResult) {
    console.error("Error fetching current user result for scoring:", fetchError);
    throw new Error(`Failed to fetch current result for dimension ${dimensionId}: ${fetchError ? fetchError.message : "Not found"}`);
  }

  // 2. Fetch question IRT parameters (a, b)
  const { data: questionIrtParams, error: irtError } = await supabase
    .from("questions")
    .select("irt_difficulty, irt_discriminativeness, is_reverse") // b, a
    .eq("id", questionId)
    .single();

  if (irtError || !questionIrtParams) {
    console.error("Error fetching IRT parameters for question:", irtError);
    throw new Error(`Failed to fetch IRT parameters for question ${questionId}: ${irtError ? irtError.message : "Not found"}`);
  }

  // 3. Convert answerValue to a format usable by IRT model (e.g., 0 or 1 for dichotomous)
  // This logic will depend on question_type and answer_options.score_value
  // For simplicity, let's assume answerValue is already a pre-processed score (e.g., 0 or 1)
  // and handle is_reverse.
  let processedAnswer = answerValue; // Placeholder - this needs proper conversion logic
  // if (questionIrtParams.is_reverse) { processedAnswer = 1 - processedAnswer; // Example for dichotomous }

  // 4. Calculate new theta using 2PL IRT model (Bayesian updating or EAP)
  // This is a complex psychometric calculation.
  // Placeholder: Increment theta by a small amount based on the answer for now.
  let newTheta = currentResult.estimated_theta || 0;
  const difficulty = questionIrtParams.irt_difficulty || 0;
  const discriminativeness = questionIrtParams.irt_discriminativeness || 1;
  
  // Simplified placeholder for IRT probability and theta update
  // P(correct | theta) = 1 / (1 + exp(-discriminativeness * (theta - difficulty)))
  // A real implementation would use EAP or similar Bayesian method.
  if (processedAnswer > 0.5) { // Assuming processedAnswer is 0 or 1
    newTheta += 0.1 * discriminativeness; // Crude positive update
  } else {
    newTheta -= 0.1 * discriminativeness; // Crude negative update
  }
  newTheta = Math.max(-3, Math.min(3, newTheta)); // Clamp theta to typical range

  // 5. Normalize score (e.g., 0-100)
  const normalizedScore = ((newTheta + 3) / 6) * 100;

  // 6. Map to segment (1-5)
  let segment = 3; // Neutral by default
  if (newTheta < -1.5) segment = 1;
  else if (newTheta < -0.5) segment = 2;
  else if (newTheta > 0.5) segment = 4;
  else if (newTheta > 1.5) segment = 5;
  
  // 7. Update user_results table
  const { data: updatedResult, error: updateError } = await supabase
    .from("user_results")
    .update({
      estimated_theta: newTheta,
      normalized_score: normalizedScore,
      segment: segment,
      question_count: (currentResult.question_count || 0) + 1,
      updated_at: new Date().toISOString(),
      status: "in_progress", // Or based on confidence
    })
    .eq("id", currentResult.id) // Assuming user_results has its own primary key `id`
    .select()
    .single();

  if (updateError) {
    console.error("Error updating user result after scoring:", updateError);
    throw new Error(`Failed to update result for dimension ${dimensionId}: ${updateError.message}`);
  }

  console.log(`ScoringService: Score updated for session ${sessionId}, dimension ${dimensionId}. New Theta: ${newTheta}`);

  return { 
    updatedResult,
    message: `Score updated successfully for dimension ${dimensionId}.`
  };
}

/**
 * @description Placeholder for calculating final scores and segments upon assessment completion.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 */
async function finalizeScores(sessionId, userId) {
  // Logic to review all dimension scores, ensure consistency, and mark session as completed.
  console.log(`ScoringService: Finalizing scores for session ${sessionId}, user ${userId}.`);
  // This might involve updating the overall session status in `user_sessions` table.
  return { success: true, message: "Scores finalized (placeholder)." };
}

module.exports = {
  updateScore,
  finalizeScores,
};
