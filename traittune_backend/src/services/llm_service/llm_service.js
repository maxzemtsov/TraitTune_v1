// /home/ubuntu/traittune_backend/src/services/llm_service/llm_service.js

const openai = require("../../config/openaiClient");
const supabase = require("../../config/supabaseClient");

/**
 * @description Analyzes an open-ended response using the configured LLM (OpenAI).
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} openQuestionId - The ID of the open-ended question.
 * @param {string} responseText - The user's text response.
 * @param {object} context - Additional context (e.g., dimension, segment, prior responses).
 * @returns {Promise<object>} An object containing the LLM interpretation, confidence, and inferred theta.
 */
async function analyzeOpenResponse(sessionId, userId, openQuestionId, responseText, context) {
  if (!responseText || !openQuestionId) {
    throw new Error("Response text and open question ID are required for LLM analysis.");
  }

  if (!openai) {
    console.error("LLM Service: OpenAI client is not initialized. Check OPENAI_API_KEY.");
    throw new Error("OpenAI client not available. Cannot analyze response.");
  }

  console.log(`LLMService: Analyzing open response for session ${sessionId}, question ${openQuestionId}.`);

  // Construct the prompt based on PRD and knowledge base (TraitTune LLM Prompt Specifications)
  // Example prompt structure:
  const prompt = `Analyze the following open-ended response for a personality assessment.
Dimension: ${context.dimension_name || "Unknown"} (Scale: -3 to +3, where +3 is ${context.positive_pole || "Positive Pole"}, -3 is ${context.negative_pole || "Negative Pole"}).
Segment (if known): ${context.segment_level || "Unknown"}.
Prior related responses (if any): ${JSON.stringify(context.prior_responses) || "None"}.
User Response: "${responseText}"

Task: Infer the user's trait level (theta) on the specified dimension. Return the inferred theta value (a float between -3.0 and +3.0), a brief interpretation (string, max 100 words), and a confidence score for your analysis (a float between 0.0 and 1.0).

Output Format (JSON only):
{
  "theta": <float_value>,
  "interpretation_en": "<string_interpretation_english>",
  "interpretation_ru": "<string_interpretation_russian>",
  "confidence": <float_value_0_to_1>
}`;

  try {
    const completion = await openai.chat.completions.create({
      // model: "gpt-4o", // As per user clarification, or gpt-4-turbo
      model: "gpt-3.5-turbo", // Using a more common model for initial dev, can be changed
      messages: [
        { role: "system", content: "You are an expert psychometric assistant. Analyze personality assessment responses accurately and provide output in the specified JSON format." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" }, // For models that support JSON mode
      temperature: 0.3, // Lower temperature for more deterministic, less creative output
    });

    const llmOutputString = completion.choices[0].message.content;
    const llmOutput = JSON.parse(llmOutputString);

    // Validate llmOutput structure
    if (typeof llmOutput.theta !== "number" || typeof llmOutput.interpretation_en !== "string" || typeof llmOutput.confidence !== "number") {
      console.error("LLM output format error:", llmOutput);
      throw new Error("LLM returned data in an unexpected format.");
    }

    // Clamp theta and confidence to expected ranges
    llmOutput.theta = Math.max(-3, Math.min(3, llmOutput.theta));
    llmOutput.confidence = Math.max(0, Math.min(1, llmOutput.confidence));

    console.log(`LLMService: Analysis complete for question ${openQuestionId}. Theta: ${llmOutput.theta}, Confidence: ${llmOutput.confidence}`);

    // Optionally, save the raw LLM response or key parts to open_responses table if not already handled by engine_service
    // The engine_service already saves the response_text, word_count, attempt_number.
    // It should be updated to also store llm_interpretation_en, llm_interpretation_ru, llm_confidence.
    // This service primarily focuses on getting the analysis.

    return {
      inferred_theta: llmOutput.theta,
      interpretation_en: llmOutput.interpretation_en,
      interpretation_ru: llmOutput.interpretation_ru || llmOutput.interpretation_en, // Fallback for Russian
      llm_confidence: llmOutput.confidence,
    };

  } catch (error) {
    console.error("Error during LLM API call or processing:", error);
    // Implement retry logic or fallback if necessary
    throw new Error(`LLM analysis failed: ${error.message}`);
  }
}

module.exports = {
  analyzeOpenResponse,
};
