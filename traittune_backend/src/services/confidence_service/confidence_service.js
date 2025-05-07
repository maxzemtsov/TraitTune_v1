// /home/ubuntu/traittune_backend/src/services/confidence_service/confidence_service.js

const supabase = require("../../config/supabaseClient");
// const engineService = require("../engine_service/engine_service"); // May be needed to trigger clarification questions

/**
 * @description Calculates or updates the reliability score for a given dimension in a session.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension.
 * @returns {Promise<object>} An object containing the updated reliability score.
 */
async function updateReliabilityScore(sessionId, userId, dimensionId) {
  if (!sessionId || !userId || !dimensionId) {
    throw new Error("Missing required parameters for updating reliability score.");
  }

  console.log(`ConfidenceService: Updating reliability score for session ${sessionId}, user ${userId}, dimension ${dimensionId}.`);

  // Placeholder logic for reliability calculation:
  // 1. Fetch user_responses for the dimension (consistency checks, social desirability flags, response times).
  // 2. Fetch check_consistency and check_social question responses.
  // 3. Analyze metadata (response times, word counts for open_responses).
  // 4. Compute a reliability score (0-100 or 0-1).

  // For now, let's assume a placeholder update.
  const placeholderReliabilityScore = Math.random() * 30 + 70; // Random score between 70-100

  const { data: updatedResult, error: updateError } = await supabase
    .from("user_results")
    .update({
      reliability_score: placeholderReliabilityScore,
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("dimension_id", dimensionId)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating reliability score in user_results:", updateError);
    throw new Error(`Failed to update reliability score for dimension ${dimensionId}: ${updateError.message}`);
  }

  console.log(`ConfidenceService: Reliability score for Dim${dimensionId} updated to ${placeholderReliabilityScore}.`);
  return { updatedResult, reliabilityScore: placeholderReliabilityScore };
}

/**
 * @description Calculates or updates the confidence score for a given dimension in a session.
 * Confidence score is often derived from the Standard Error of the Theta estimate in IRT.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension.
 * @param {number} thetaSE - The Standard Error of the Theta estimate from the scoring service.
 * @returns {Promise<object>} An object containing the updated confidence score.
 */
async function updateConfidenceScore(sessionId, userId, dimensionId, thetaSE) {
  if (!sessionId || !userId || !dimensionId || thetaSE === undefined) {
    throw new Error("Missing required parameters for updating confidence score.");
  }

  console.log(`ConfidenceService: Updating confidence score for session ${sessionId}, user ${userId}, dimension ${dimensionId} with SE ${thetaSE}.`);

  // Placeholder logic for confidence score calculation:
  // Confidence is often 1 - (Normalized SE). Lower SE means higher confidence.
  // For example, if SE ranges from 0.1 (high confidence) to 1.0 (low confidence)
  // A simple mapping: confidence = 1 - (clamped_SE / max_expected_SE)
  // Let's assume SE is already somewhat normalized or we use a placeholder.
  const placeholderConfidenceScore = Math.max(0, Math.min(1, 1 - (thetaSE / 1.5))); // Example: if max SE considered is 1.5

  const { data: updatedResult, error: updateError } = await supabase
    .from("user_results")
    .update({
      confidence_score: placeholderConfidenceScore,
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("dimension_id", dimensionId)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating confidence score in user_results:", updateError);
    throw new Error(`Failed to update confidence score for dimension ${dimensionId}: ${updateError.message}`);
  }

  console.log(`ConfidenceService: Confidence score for Dim${dimensionId} updated to ${placeholderConfidenceScore}.`);
  return { updatedResult, confidenceScore: placeholderConfidenceScore };
}

/**
 * @description Triggers a clarification process if confidence or reliability is low.
 * This might involve fetching a consistency prompt or an open-ended question.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension requiring clarification.
 * @param {string} reason - The reason for clarification (e.g., "low_consistency", "low_confidence").
 * @returns {Promise<object>} An object with details of the clarification needed, or null if not applicable.
 */
async function triggerClarification(sessionId, userId, dimensionId, reason) {
  console.log(`ConfidenceService: Clarification triggered for session ${sessionId}, dim ${dimensionId}, reason: ${reason}.`);
  
  // Placeholder logic:
  // 1. Check if clarification is warranted based on current scores and reason.
  // 2. Fetch a relevant consistency_prompt or an open_question from the database.
  // 3. This function might return the question to be asked, or signal the EngineService.

  let clarificationQuestion = null;

  if (reason === "low_consistency") {
    const { data: prompt, error } = await supabase
      .from("consistency_prompts")
      .select("id, text_en, text_ru, prompt_type") // Assuming these columns exist
      .eq("dimension_id", dimensionId)
      // .eq("prompt_type", "some_specific_type_for_consistency") // Add more filters if needed
      .limit(1)
      .single();
    if (error) console.warn("Error fetching consistency prompt:", error);
    if (prompt) clarificationQuestion = { type: "consistency_prompt", ...prompt };
  }
  // Add logic for fetching open-ended questions if reason is "low_confidence" and other criteria met.

  if (clarificationQuestion) {
    console.log("Clarification question identified:", clarificationQuestion);
    // The EngineService would then present this question.
    return { clarificationNeeded: true, question: clarificationQuestion };
  } else {
    return { clarificationNeeded: false };
  }
}

module.exports = {
  updateReliabilityScore,
  updateConfidenceScore,
  triggerClarification,
};
