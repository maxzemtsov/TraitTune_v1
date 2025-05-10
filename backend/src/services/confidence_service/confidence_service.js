// /home/ubuntu/traittune_backend/src/services/confidence_service/confidence_service.js

const supabase = require("../../config/supabaseClient");

/**
 * @description Calculates or updates the reliability score for a given dimension in a session.
 * This remains a placeholder for more sophisticated reliability logic.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension.
 * @returns {Promise<object>} An object containing the updated reliability score information.
 */
async function updateReliabilityScore(sessionId, userId, dimensionId) {
  if (!sessionId || !userId || !dimensionId) {
    throw new Error("Missing required parameters for updating reliability score.");
  }
  console.log(`ConfidenceService: Updating reliability score for session ${sessionId}, user ${userId}, dimension ${dimensionId}.`);

  // Placeholder: Fetch existing or initialize
  const { data: currentResultData, error: fetchError } = await supabase
    .from("user_results")
    .select("id, reliability_score")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("dimension_id", dimensionId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching current user result for reliability update:", fetchError);
    throw new Error(`Failed to fetch current result for dimension ${dimensionId}: ${fetchError.message}`);
  }

  // More sophisticated logic needed here based on consistency, social desirability, response times etc.
  const placeholderReliabilityScore = parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)); // Random score between 0.7-1.0

  const upsertData = {
    session_id: sessionId,
    user_id: userId,
    dimension_id: dimensionId,
    reliability_score: placeholderReliabilityScore,
    updated_at: new Date().toISOString(),
  };
  if (currentResultData && currentResultData.id) {
    upsertData.id = currentResultData.id;
  }

  const { data: updatedResult, error: upsertError } = await supabase
    .from("user_results")
    .upsert(upsertData, { onConflict: "session_id, user_id, dimension_id", ignoreDuplicates: false })
    .select("id, reliability_score")
    .single();

  if (upsertError) {
    console.error("Error upserting reliability score in user_results:", upsertError);
    throw new Error(`Failed to upsert reliability score for dimension ${dimensionId}: ${upsertError.message}`);
  }

  console.log(`ConfidenceService: Reliability score for Dim${dimensionId} updated to ${placeholderReliabilityScore}.`);
  return updatedResult;
}

/**
 * @description Calculates or updates the confidence score for a given dimension based on IRT Standard Error.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension.
 * @param {number} thetaSE - The Standard Error of the Theta estimate from the scoring service (after a closed question).
 * @returns {Promise<object>} An object containing the updated confidence score information.
 */
async function updateConfidenceFromIRT(sessionId, userId, dimensionId, thetaSE) {
  if (!sessionId || !userId || !dimensionId || thetaSE === undefined) {
    throw new Error("Missing required parameters for updating confidence score from IRT.");
  }
  console.log(`ConfidenceService: Updating confidence from IRT for session ${sessionId}, dim ${dimensionId} with SE ${thetaSE}.`);

  const { data: currentResultData, error: fetchError } = await supabase
    .from("user_results")
    .select("id, confidence_score, question_count")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("dimension_id", dimensionId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching current user result for IRT confidence update:", fetchError);
    throw new Error(`Failed to fetch current result for dimension ${dimensionId}: ${fetchError.message}`);
  }
  
  let currentConfidence = currentResultData ? currentResultData.confidence_score : 0.5; // Default if no confidence yet
  const questionCount = currentResultData ? currentResultData.question_count : 0;

  // Confidence is often 1 - (Normalized SE). Lower SE means higher confidence.
  // This is a placeholder. Max_expected_SE needs calibration.
  const maxExpectedSE = 1.5; 
  const confidenceFromSE = Math.max(0, Math.min(1, 1 - (thetaSE / maxExpectedSE)));

  // Weight current confidence by number of questions, new confidence from SE gets a fixed weight
  const weightCurrentConfidence = questionCount;
  const weightNewConfidenceFromSE = 1; // Each IRT update contributes

  let newConfidenceScore = currentConfidence; // Default to current if no questions yet
  if (questionCount > 0) {
     newConfidenceScore = ((currentConfidence * weightCurrentConfidence) + (confidenceFromSE * weightNewConfidenceFromSE)) / (weightCurrentConfidence + weightNewConfidenceFromSE);
  } else if (questionCount === 0 && thetaSE !== undefined) {
    // First question, confidence is primarily from this SE
    newConfidenceScore = confidenceFromSE;
  }
  
  newConfidenceScore = parseFloat(newConfidenceScore.toFixed(2));

  const upsertData = {
    session_id: sessionId,
    user_id: userId,
    dimension_id: dimensionId,
    confidence_score: newConfidenceScore,
    updated_at: new Date().toISOString(),
  };
   if (currentResultData && currentResultData.id) {
    upsertData.id = currentResultData.id;
  }

  const { data: updatedResult, error: upsertError } = await supabase
    .from("user_results")
    .upsert(upsertData, { onConflict: "session_id, user_id, dimension_id", ignoreDuplicates: false })
    .select("id, confidence_score")
    .single();

  if (upsertError) {
    console.error("Error upserting confidence score in user_results:", upsertError);
    throw new Error(`Failed to upsert confidence score for dimension ${dimensionId}: ${upsertError.message}`);
  }

  console.log(`ConfidenceService: Confidence score from IRT for Dim${dimensionId} updated to ${newConfidenceScore}.`);
  return updatedResult;
}

/**
 * @description Applies confidence update based on LLM analysis of an open-ended response.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension to adjust.
 * @param {number} llmConfidence - The confidence of the LLM in its inference (0.0 to 1.0).
 * @returns {Promise<object>} An object containing the updated confidence score information.
 */
async function applyLlmConfidenceUpdate(sessionId, userId, dimensionId, llmConfidence) {
  if (!sessionId || !userId || !dimensionId || llmConfidence === undefined) {
    throw new Error("Missing required parameters for LLM confidence update.");
  }
  console.log(`ConfidenceService: Applying LLM confidence update for session ${sessionId}, dim ${dimensionId}. LLM Confidence: ${llmConfidence}`);

  const { data: currentResult, error: fetchError } = await supabase
    .from("user_results")
    .select("id, confidence_score, question_count, llm_adjustment_count") // question_count refers to closed questions
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("dimension_id", dimensionId)
    .single();

  if (fetchError || !currentResult) {
    console.error("Error fetching current user result for LLM confidence update:", fetchError);
    throw new Error(`Failed to fetch current result for dimension ${dimensionId} for LLM confidence update. Ensure initial scoring has occurred.`);
  }

  let currentConfidence = currentResult.confidence_score || 0.5; // Default if no confidence yet
  const closedQuestionCount = currentResult.question_count || 0;
  const llmAdjustmentCount = currentResult.llm_adjustment_count || 0; // Number of times LLM has already influenced this dimension

  // Weight for current confidence (based on number of closed questions contributing to it)
  const weightCurrentConfidence = closedQuestionCount + (llmAdjustmentCount * 2); // Give prior LLM adjustments some weight too
  
  // Weight for LLM's confidence. This can be a fixed value or dynamic.
  // Let's make it significant, e.g., equivalent to 2-3 questions, but diminishing if LLM is repeatedly used for same dim.
  const baseLlmConfidenceWeight = 2.5;
  const weightLlm = baseLlmConfidenceWeight * Math.pow(0.85, llmAdjustmentCount); // Diminishing returns for multiple LLM calls on same dimension

  let newConfidenceScore = ((currentConfidence * weightCurrentConfidence) + (llmConfidence * weightLlm)) / (weightCurrentConfidence + weightLlm);
  newConfidenceScore = Math.max(0.0, Math.min(1.0, parseFloat(newConfidenceScore.toFixed(2))));

  const { data: updatedResult, error: updateError } = await supabase
    .from("user_results")
    .update({
      confidence_score: newConfidenceScore,
      // llm_adjustment_count is updated in scoring_service, no need to update here again if it's the same LLM call event
      updated_at: new Date().toISOString(),
    })
    .eq("id", currentResult.id)
    .select("id, confidence_score")
    .single();

  if (updateError) {
    console.error("Error updating user result after LLM confidence update:", updateError);
    throw new Error(`Failed to update result for dimension ${dimensionId} after LLM confidence update: ${updateError.message}`);
  }
  console.log(`ConfidenceService: LLM Confidence update applied for Dim${dimensionId}. New Confidence: ${newConfidenceScore}`);
  return updatedResult;
}


/**
 * @description Triggers a clarification process if confidence or reliability is low.
 * This might involve fetching a consistency prompt or an open-ended question.
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} dimensionId - The ID of the dimension requiring clarification.
 * @param {string} reason - The reason for clarification (e.g., "low_consistency", "low_confidence_irt", "low_confidence_llm").
 * @param {object} currentScores - Current scores object for the dimension (theta, confidence, reliability).
 * @returns {Promise<object>} An object with details of the clarification needed, or null if not applicable.
 */
async function triggerClarification(sessionId, userId, dimensionId, reason, currentScores) {
  console.log(`ConfidenceService: Clarification trigger check for session ${sessionId}, dim ${dimensionId}, reason: ${reason}. Current Scores:`, currentScores);
  
  // Decision logic for clarification (e.g., confidence < 0.80, reliability < 0.70)
  // This logic should be more sophisticated based on PRD thresholds.
  const { confidence_score, reliability_score } = currentScores;
  let needsClarification = false;
  let clarificationType = null;

  if (reason === "low_reliability" && reliability_score < 0.70) {
    needsClarification = true;
    clarificationType = "check_consistency"; // Or a specific type of check question
  }
  if (reason.startsWith("low_confidence") && confidence_score < 0.80) {
    needsClarification = true;
    // If LLM was just used and its own confidence was low, maybe don't ask another open question immediately.
    // This needs more sophisticated logic in engine_service to manage question flow.
    clarificationType = "open_ended_question"; // Default to open-ended for low confidence
  }

  if (!needsClarification) {
    return { clarificationNeeded: false };
  }

  let clarificationQuestion = null;
  if (clarificationType === "check_consistency") {
    const { data: prompt, error } = await supabase
      .from("questions") // Assuming check questions are in the main questions table
      .select("id, text_en, text_ru, question_type") 
      .eq("dimension_id", dimensionId)
      .eq("question_type", "check_consistency") // Or other relevant check types
      // Add logic to avoid asking the same check question repeatedly
      .order("last_asked_at", { ascending: true, nullsFirst: true }) // Example to pick least recently asked
      .limit(1)
      .single();
    if (error) console.warn("Error fetching consistency check question:", error);
    if (prompt) clarificationQuestion = { type: prompt.question_type, ...prompt };
  }
  // Add logic for fetching open-ended questions if clarificationType is "open_ended_question"
  // Ensure not to ask too many open-ended questions per dimension (e.g., max 2-3)
  else if (clarificationType === "open_ended_question") {
    // This would typically be handled by the engine_service selecting an appropriate open_question
    // based on dimension, segment, and ensuring it hasn't been asked too many times.
    // For now, this service just signals the need.
     console.log(`ConfidenceService: Signalling need for an open-ended question for Dim ${dimensionId}.`);
  }


  if (clarificationQuestion) {
    console.log("Clarification question identified by ConfidenceService:", clarificationQuestion.id);
    return { clarificationNeeded: true, question: clarificationQuestion, clarificationType };
  } else if (needsClarification && clarificationType === "open_ended_question") {
    return { clarificationNeeded: true, clarificationType: "open_ended_question", message: "Recommend open-ended question." };
  } else {
    return { clarificationNeeded: false };
  }
}

module.exports = {
  updateReliabilityScore,
  updateConfidenceFromIRT, // Renamed from updateConfidenceScore
  applyLlmConfidenceUpdate,
  triggerClarification,
};

