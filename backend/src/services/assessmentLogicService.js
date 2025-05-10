const { getSegments } = require("./assessmentDataService");

// Constants from PRD or psychometric guidelines
const THETA_MIN = -3;
const THETA_MAX = 3;
const TARGET_CONFIDENCE_SCORE = 0.80;

/**
 * Calculates the probability of a keyed (positive/correct) response for a given item
 * using the 2-Parameter Logistic (2PL) IRT model.
 * P(theta) = c + (1 - c) * (1 / (1 + exp(-a * (theta - b))))
 * For 2PL, c (guessing parameter) is assumed to be 0.
 * @param {number} theta The current estimated trait level of the user.
 * @param {number} item_a The discrimination parameter of the item.
 * @param {number} item_b The difficulty parameter of the item.
 * @param {number} [item_c=0] The guessing parameter of the item (defaults to 0 for 2PL).
 * @returns {number} The probability of a keyed response.
 */
const calculate2PLProbability = (theta, item_a, item_b, item_c = 0) => {
  if (item_a === null || item_b === null || item_a === undefined || item_b === undefined) {
    // console.warn("Item parameters (a or b) are null/undefined, cannot calculate probability.");
    return 0.5; // Return neutral probability or handle as an error
  }
  const exponent = -parseFloat(item_a) * (theta - parseFloat(item_b));
  const logisticPart = 1 / (1 + Math.exp(exponent));
  return parseFloat(item_c) + (1 - parseFloat(item_c)) * logisticPart;
};

/**
 * Converts a user's raw response for an item into a dichotomous value (0 or 1)
 * representing a non-keyed or keyed response, respectively.
 * Handles different question types and reverse scoring.
 * @param {object} question The question object from questionsData.
 * @param {any} rawResponse The user's raw response (e.g., Likert value 1-5, or answer option code 'A', 'B').
 * @param {Array<object>} answerOptions The list of answer options for this question.
 * @returns {number|null} 0 for non-keyed, 1 for keyed response, or null if not applicable/determinable.
 */
const getDichotomousResponse = (question, rawResponse, answerOptions) => {
  if (!question) return null;
  let keyedResponse = 0; // Default to non-keyed

  switch (question.question_type) {
    case "likert":
      const likertVal = parseInt(rawResponse);
      if (isNaN(likertVal) || likertVal < 1 || likertVal > 5) return null; // Invalid Likert response
      // Standard: 3,4,5 -> 1 (keyed); 1,2 -> 0 (non-keyed)
      // Reversed: 1,2,3 -> 1 (keyed); 4,5 -> 0 (non-keyed) (effectively, if it aligns with positive pole after reversal)
      if (question.is_reverse) {
        if (likertVal <= 3) keyedResponse = 1;
        else keyedResponse = 0;
      } else {
        if (likertVal >= 3) keyedResponse = 1;
        else keyedResponse = 0;
      }
      break;

    case "forced":
    case "scenario":
      const chosenOption = answerOptions.find(opt => opt.code === rawResponse);
      if (!chosenOption || chosenOption.score_value === null || chosenOption.score_value === undefined) return null; // Invalid option code or missing score_value
      
      const scoreValue = parseInt(chosenOption.score_value);
      // Standard: score_value = 1 -> keyed (1); score_value = -1 or 0 -> non-keyed (0)
      // Reversed: score_value = -1 -> keyed (1); score_value = 1 or 0 -> non-keyed (0)
      if (question.is_reverse) {
        if (scoreValue === -1) keyedResponse = 1;
        else keyedResponse = 0;
      } else {
        if (scoreValue === 1) keyedResponse = 1;
        else keyedResponse = 0;
      }
      break;

    default:
      return null;
  }
  return keyedResponse;
};

/**
 * Maps an estimated theta score to a segment for a given dimension.
 * @param {number} theta The estimated trait level.
 * @param {number} dimensionId The ID of the dimension.
 * @returns {object|null} The segment object or null if not found.
 */
const getSegmentForTheta = (theta, dimensionId) => {
  const segments = getSegments(); 
  const dimensionSegments = segments.filter(s => s.dimension_id === parseInt(dimensionId));
  
  dimensionSegments.sort((a, b) => a.segment_level - b.segment_level);

  for (const segment of dimensionSegments) {
    if (theta >= segment.theta_min && theta <= segment.theta_max) {
      return segment;
    }
  }

  if (dimensionSegments.length > 0) {
    if (theta < dimensionSegments[0].theta_min) {
      return dimensionSegments[0]; 
    }
    if (theta > dimensionSegments[dimensionSegments.length - 1].theta_max) { 
      return dimensionSegments[dimensionSegments.length - 1];
    }
  }
  
  console.warn(`Theta value ${theta} for dimension ${dimensionId} did not fall into any defined segment range after fallbacks.`);
  return null; 
};


/**
 * Estimates the user's trait level (theta) based on their responses using IRT.
 * This is a placeholder and needs a proper IRT estimation algorithm (e.g., EAP, MLE).
 * @param {Array<object>} responses - Array of response objects { dichotomousResponse, item_a, item_b }.
 * @param {number} currentTheta - The prior theta estimate.
 * @returns {{ newTheta: number, standardError: number }} - The new theta estimate and its standard error.
 */
const estimateTheta = (responses, currentTheta) => {
  let newTheta = parseFloat(currentTheta);
  let N = responses.length;

  // Simplified EAP-like update for demonstration, NOT a full IRT implementation.
  // This should be replaced with a robust IRT estimation function.
  if (N > 0) {
    const lastResponse = responses[N - 1];
    const prob_correct_at_current_theta = calculate2PLProbability(newTheta, lastResponse.item_a, lastResponse.item_b);

    if (lastResponse.dichotomousResponse === 1) { // Keyed response
      newTheta += (1 - prob_correct_at_current_theta) * (0.5 / Math.sqrt(N + 1)); 
    } else { // Non-keyed response
      newTheta -= prob_correct_at_current_theta * (0.5 / Math.sqrt(N + 1));
    }
  }
  
  newTheta = Math.max(THETA_MIN, Math.min(THETA_MAX, newTheta));

  // Crude Standard Error simulation: SE decreases as N increases.
  // This needs to be derived from the IRT model (e.g., inverse of Fisher Information).
  let standardError = 1.0 / Math.sqrt(N + 1); // Example: starts high, decreases
  standardError = Math.max(0.1, standardError); // Ensure SE doesn't go to zero

  return { newTheta: parseFloat(newTheta.toFixed(4)), standardError: parseFloat(standardError.toFixed(4)) };
};

/**
 * Calculates a confidence score based on the standard error of theta.
 * @param {number} standardError - The standard error of the theta estimate.
 * @returns {number} Confidence score (0 to 1, higher is better).
 */
const calculateConfidenceScore = (standardError) => {
  // This is a heuristic. A proper mapping or use of SE directly might be better.
  // PRD mentions target confidence > 0.80. Let's map SE to this.
  // Lower SE means higher confidence.
  if (standardError <= 0.32) return 0.90; // Corresponds to ~10 items with SE ~ 1/sqrt(10) approx 0.316
  if (standardError <= 0.4) return 0.80;
  if (standardError <= 0.5) return 0.70;
  if (standardError <= 0.7) return 0.60;
  return 0.50; // Low confidence for SE > 0.7
};

module.exports = {
  calculate2PLProbability,
  getDichotomousResponse,
  getSegmentForTheta,
  estimateTheta,
  calculateConfidenceScore,
  TARGET_CONFIDENCE_SCORE // Export constant
};

