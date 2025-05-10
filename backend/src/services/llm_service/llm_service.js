// /home/ubuntu/traittune/backend/src/services/llm_service/llm_service.js

const openai = require("../../config/openaiClient");
// const supabase = require("../../config/supabaseClient"); // Supabase client not directly used in this service for LLM calls

/**
 * @description Analyzes an open-ended response using the configured LLM (OpenAI).
 * @param {string} sessionId - The ID of the assessment session.
 * @param {string} userId - The ID of the user.
 * @param {number} openQuestionId - The ID of the open-ended question.
 * @param {string} responseText - The user's text response.
 * @param {object} context - Additional context retrieved via RAG. Expected fields include:
 *                          dimension_id, dimension_name, dimension_description,
 *                          positive_pole, negative_pole, question_text,
 *                          segment_level_explored, segment_description_explored,
 *                          example_high_response, example_low_response.
 * @returns {Promise<object>} An object containing the LLM interpretation, confidence, and inferred theta.
 */
async function analyzeOpenResponse(sessionId, userId, openQuestionId, responseText, context) {
  if (!responseText || !openQuestionId) {
    throw new Error("Response text and open question ID are required for LLM analysis.");
  }
  if (!context) {
    console.warn(`LLMService: Context object is missing for session ${sessionId}, question ${openQuestionId}. Analysis quality may be reduced.`);
    context = {}; // Ensure context object exists to avoid errors in prompt templating
  }

  if (!openai) {
    console.error("LLM Service: OpenAI client is not initialized. Check OPENAI_API_KEY.");
    throw new Error("OpenAI client not available. Cannot analyze response.");
  }

  console.log(`LLMService: Analyzing open response for session ${sessionId}, question ${openQuestionId}. Model: gpt-4.1-nano`);

  const prompt = `
You are an expert psychometric assistant for TraitTune, a personality assessment platform.
Your task is to analyze a user's open-ended response and provide a psychometrically sound estimation of their trait level (theta), a brief interpretation, and your confidence in this analysis.
Output MUST be in JSON format only.

**Assessment Context:**
*   **Dimension:** ${context.dimension_name || "Unknown Dimension"} (ID: ${context.dimension_id || "N/A"})
    *   Description: ${context.dimension_description || "No description provided."}
    *   Positive Pole (+3): ${context.positive_pole || "High End of the trait"}
    *   Negative Pole (-3): ${context.negative_pole || "Low End of the trait"}
*   **Specific Open Question Asked:** "${context.question_text || "The user was asked an open-ended question about this dimension."}"
*   **Relevant Segment Information (if available):**
    *   Segment Level being explored (1-5): ${context.segment_level_explored || "N/A"}
    *   Segment Description: ${context.segment_description_explored || "N/A"}
*   **Prototypical Response Examples (if available, for calibration only - DO NOT COPY directly):**
    *   Example of a response indicating high trait level (e.g., for ${context.positive_pole || "High End"}): "${context.example_high_response || "N/A"}"
    *   Example of a response indicating low trait level (e.g., for ${context.negative_pole || "Low End"}): "${context.example_low_response || "N/A"}"

**User's Response to Analyze:**
"${responseText}"

**Your Task & Instructions:**

1.  **Estimate Theta:** Based on the user's response and the provided assessment context, estimate the user's trait level (theta) on the specified dimension. Theta must be a float between -3.0 and +3.0.
    *   A score towards +3.0 indicates strong alignment with the Positive Pole.
    *   A score towards -3.0 indicates strong alignment with the Negative Pole.
    *   A score around 0.0 indicates a neutral, balanced position, or that the response does not clearly indicate a leaning.
2.  **Provide Interpretation:** Write a brief, objective interpretation of the user's response in relation to the dimension, explaining your theta estimation. Focus on the aspects of the response that informed your judgment.
    *   Keep interpretations concise (max 70 words).
    *   Provide interpretations in both English ("interpretation_en") and Russian ("interpretation_ru"). If you are not proficient in Russian, provide the English interpretation for both fields.
3.  **State Confidence:** Provide a confidence score (a float between 0.0 and 1.0) for your overall analysis (theta estimation and interpretation). A score of 1.0 means very high confidence, and 0.0 means very low confidence. Base this on the clarity of the user's response and its alignment with the provided contextual information.

**Few-Shot Examples (Illustrative - adapt your reasoning based on the dynamically provided Assessment Context above, not just these static examples):**

*   **Example 1 (Illustrative - context would be dynamically filled for a real query):**
    *   Dimension: Optimism-Pessimism (Positive Pole: Optimistic, Negative Pole: Pessimistic)
    *   User Response: "I always look on the bright side of things, even when stuff gets tough. There's always a silver lining, and I believe challenges are just opportunities in disguise."
    *   Expected Analysis (Illustrative JSON Output):
        {
          "theta": 2.6,
          "interpretation_en": "The user expresses a consistently positive outlook and resilience, strongly aligning with the optimistic pole. They view challenges as opportunities.",
          "interpretation_ru": "Пользователь выражает стабильно позитивный взгляд на вещи и устойчивость, что сильно соответствует полюсу оптимизма. Они рассматривают трудности как возможности.",
          "confidence": 0.92
        }
*   **Example 2 (Illustrative - context would be dynamically filled for a real query):**
    *   Dimension: Detail-Oriented vs. Big Picture (Positive Pole: Detail-Oriented, Negative Pole: Big Picture)
    *   User Response: "I don't really get bogged down in the tiny details. I prefer to see the overall strategy and where we're headed. The specifics can be sorted out by others who enjoy that."
    *   Expected Analysis (Illustrative JSON Output):
        {
          "theta": -2.3,
          "interpretation_en": "The user clearly prioritizes a holistic, strategic view over focusing on specifics, indicating a strong preference for the 'big picture' end of the spectrum and delegates details.",
          "interpretation_ru": "Пользователь явно отдает приоритет целостному, стратегическому видению, а не концентрации на деталях, что указывает на сильное предпочтение «общей картины» и делегирование деталей.",
          "confidence": 0.88
        }

**Output Format (JSON only - strictly adhere to this schema):**
{
  "theta": <float_value_between_-3.0_and_3.0>,
  "interpretation_en": "<string_interpretation_english_max_70_words>",
  "interpretation_ru": "<string_interpretation_russian_max_70_words_or_english_fallback>",
  "confidence": <float_value_between_0.0_and_1.0>
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano", // Updated model as per recommendations and user guidance
      messages: [
        { role: "system", content: "You are an expert psychometric assistant. Analyze personality assessment responses accurately and provide output in the specified JSON format. Ground your analysis in the provided context and examples." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lowered temperature further for more deterministic and consistent psychometric analysis
      // max_tokens: 250, // Consider setting max_tokens to control output length and cost, if necessary
    });

    const llmOutputString = completion.choices[0].message.content;
    const llmOutput = JSON.parse(llmOutputString);

    // Validate llmOutput structure
    if (typeof llmOutput.theta !== "number" || 
        typeof llmOutput.interpretation_en !== "string" || 
        typeof llmOutput.interpretation_ru !== "string" || // Ensure Russian interpretation is also checked
        typeof llmOutput.confidence !== "number") {
      console.error("LLM output format error or missing fields:", llmOutput);
      throw new Error("LLM returned data in an unexpected format or with missing fields.");
    }

    // Clamp theta and confidence to expected ranges
    llmOutput.theta = Math.max(-3.0, Math.min(3.0, parseFloat(llmOutput.theta.toFixed(2)))); // Ensure float and clamp
    llmOutput.confidence = Math.max(0.0, Math.min(1.0, parseFloat(llmOutput.confidence.toFixed(2)))); // Ensure float and clamp

    console.log(`LLMService: Analysis complete for question ${openQuestionId}. Theta: ${llmOutput.theta}, Confidence: ${llmOutput.confidence}`);

    return {
      inferred_theta: llmOutput.theta,
      interpretation_en: llmOutput.interpretation_en,
      interpretation_ru: llmOutput.interpretation_ru,
      llm_confidence: llmOutput.confidence,
    };

  } catch (error) {
    console.error(`Error during LLM API call or processing for session ${sessionId}, question ${openQuestionId}:`, error);
    // More specific error handling could be added here based on error types
    throw new Error(`LLM analysis failed: ${error.message}`);
  }
}

module.exports = {
  analyzeOpenResponse,
};

