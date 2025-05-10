const dataService = require("../services/assessmentDataService");
const logicService = require("../services/assessmentLogicService");

// Ensure data is loaded (it should be loaded on require, but explicit call can be for safety in test scripts)
dataService.loadData();

console.log("--- Starting IRT Logic Validation ---");

// Test Suite 1: calculate2PLProbability
const testCalculate2PLProbability = () => {
  console.log("\n--- Test Suite 1: calculate2PLProbability ---");
  let passed = 0;
  let total = 0;

  const testCases = [
    { theta: 0, a: 1.5, b: 0, c: 0, expected: 0.5, description: "Theta at difficulty" },
    { theta: 1, a: 1.5, b: 0, c: 0, expectedMin: 0.5, expectedMax: 1.0, description: "Theta above difficulty" }, // P should be > 0.5
    { theta: -1, a: 1.5, b: 0, c: 0, expectedMin: 0.0, expectedMax: 0.5, description: "Theta below difficulty" }, // P should be < 0.5
    { theta: 1, a: 1.5, b: 1, c: 0, expected: 0.5, description: "Theta at difficulty (shifted)" },
    { theta: 0, a: 1.0, b: 0, c: 0.1, expected: 0.55, description: "With guessing parameter c=0.1, P = c + (1-c)*0.5" }, // 0.1 + 0.9 * 0.5 = 0.1 + 0.45 = 0.55
    { theta: 0, a: null, b: 0, c: 0, expected: 0.5, description: "Null \'a\' parameter" },
  ];

  testCases.forEach(tc => {
    total++;
    const prob = logicService.calculate2PLProbability(tc.theta, tc.a, tc.b, tc.c);
    let currentTestPassed = false;
    if (tc.expected !== undefined) {
      currentTestPassed = Math.abs(prob - tc.expected) < 0.001;
    } else if (tc.expectedMin !== undefined && tc.expectedMax !== undefined) {
      currentTestPassed = prob > tc.expectedMin && prob < tc.expectedMax;
    }
    if (currentTestPassed) passed++;
    console.log(`Test: ${tc.description} - Theta=${tc.theta}, a=${tc.a}, b=${tc.b}, c=${tc.c} => P=${prob.toFixed(4)}. Expected: ${tc.expected !== undefined ? tc.expected : '(' + tc.expectedMin + '-' + tc.expectedMax + ')'}. Result: ${currentTestPassed ? "PASS" : "FAIL"}`);
  });
  console.log(`calculate2PLProbability: ${passed}/${total} passed.`);
  return passed === total;
};

// Test Suite 2: getDichotomousResponse
const testGetDichotomousResponse = () => {
  console.log("\n--- Test Suite 2: getDichotomousResponse ---");
  let passed = 0;
  let total = 0;

  // Find some sample questions and options from loaded data
  const qLikertNonReversed = dataService.getQuestions().find(q => q.id === 1); // Assuming QID 1 is Likert, non-reversed
  const qLikertReversed = dataService.getQuestions().find(q => q.id === 2);    // Assuming QID 2 is Likert, reversed
  const qForced = dataService.getQuestions().find(q => q.question_type === "forced" && !q.is_reverse);
  const qForcedReversed = dataService.getQuestions().find(q => q.question_type === "forced" && q.is_reverse);
  const qScenario = dataService.getQuestions().find(q => q.question_type === "scenario" && !q.is_reverse);

  const testCases = [];

  if (qLikertNonReversed) {
    testCases.push({ question: qLikertNonReversed, rawResponse: "5", answerOptions: [], expected: 1, description: "Likert Non-Reversed (ID 1): Agree -> Keyed" });
    testCases.push({ question: qLikertNonReversed, rawResponse: "1", answerOptions: [], expected: 0, description: "Likert Non-Reversed (ID 1): Disagree -> Non-Keyed" });
    testCases.push({ question: qLikertNonReversed, rawResponse: "3", answerOptions: [], expected: 1, description: "Likert Non-Reversed (ID 1): Neutral -> Keyed" });
  }
  if (qLikertReversed) {
    testCases.push({ question: qLikertReversed, rawResponse: "5", answerOptions: [], expected: 0, description: "Likert Reversed (ID 2): Agree -> Non-Keyed" });
    testCases.push({ question: qLikertReversed, rawResponse: "1", answerOptions: [], expected: 1, description: "Likert Reversed (ID 2): Disagree -> Keyed" });
    testCases.push({ question: qLikertReversed, rawResponse: "3", answerOptions: [], expected: 1, description: "Likert Reversed (ID 2): Neutral -> Keyed" });
  }
  if (qForced) {
    const optsForced = dataService.getAnswerOptionsForQuestion(qForced.id);
    const optForcedKeyed = optsForced.find(o => parseInt(o.score_value) === 1);
    const optForcedNonKeyed = optsForced.find(o => parseInt(o.score_value) === -1);
    if (optForcedKeyed) testCases.push({ question: qForced, rawResponse: optForcedKeyed.code, answerOptions: optsForced, expected: 1, description: `Forced Non-Reversed (ID ${qForced.id}): Keyed Option ${optForcedKeyed.code}` });
    if (optForcedNonKeyed) testCases.push({ question: qForced, rawResponse: optForcedNonKeyed.code, answerOptions: optsForced, expected: 0, description: `Forced Non-Reversed (ID ${qForced.id}): Non-Keyed Option ${optForcedNonKeyed.code}` });
  }
   if (qForcedReversed) {
    const optsForcedRev = dataService.getAnswerOptionsForQuestion(qForcedReversed.id);
    const optForcedRevKeyed = optsForcedRev.find(o => parseInt(o.score_value) === -1); // Keyed for reversed is score -1
    const optForcedRevNonKeyed = optsForcedRev.find(o => parseInt(o.score_value) === 1);
    if (optForcedRevKeyed) testCases.push({ question: qForcedReversed, rawResponse: optForcedRevKeyed.code, answerOptions: optsForcedRev, expected: 1, description: `Forced Reversed (ID ${qForcedReversed.id}): Keyed Option (score -1) ${optForcedRevKeyed.code}` });
    if (optForcedRevNonKeyed) testCases.push({ question: qForcedReversed, rawResponse: optForcedRevNonKeyed.code, answerOptions: optsForcedRev, expected: 0, description: `Forced Reversed (ID ${qForcedReversed.id}): Non-Keyed Option (score 1) ${optForcedRevNonKeyed.code}` });
  }
  // Add more for scenario if distinct logic or options exist

  testCases.forEach(tc => {
    if (!tc.question) {
        console.log(`Skipping test: ${tc.description} - Question data not found.`);
        return;
    }
    total++;
    const dichotomous = logicService.getDichotomousResponse(tc.question, tc.rawResponse, tc.answerOptions);
    const currentTestPassed = dichotomous === tc.expected;
    if (currentTestPassed) passed++;
    console.log(`Test: ${tc.description} - Raw: ${tc.rawResponse} => Dichotomous: ${dichotomous}. Expected: ${tc.expected}. Result: ${currentTestPassed ? "PASS" : "FAIL"}`);
  });
  console.log(`getDichotomousResponse: ${passed}/${total} passed.`);
  return passed === total;
};

// Test Suite 3: getSegmentForTheta
const testGetSegmentForTheta = () => {
  console.log("\n--- Test Suite 3: getSegmentForTheta ---");
  let passed = 0;
  let total = 0;

  const testCases = [
    { theta: 2.0, dimensionId: 1, expectedSegmentName: "Highly Expressive", expectedLevel: 1 },
    { theta: 1.0, dimensionId: 1, expectedSegmentName: "Moderately Expressive", expectedLevel: 2 },
    { theta: 0.0, dimensionId: 1, expectedSegmentName: "Neutral", expectedLevel: 3 },
    { theta: -1.0, dimensionId: 1, expectedSegmentName: "Moderately Reserved", expectedLevel: 4 },
    { theta: -2.0, dimensionId: 1, expectedSegmentName: "Highly Reserved", expectedLevel: 5 },
    { theta: 1.5, dimensionId: 1, expectedSegmentName: "Highly Expressive", expectedLevel: 1 }, // Boundary test, assuming >= min and <= max
    { theta: 0.5, dimensionId: 1, expectedSegmentName: "Moderately Expressive", expectedLevel: 2 }, // Boundary test
    { theta: 1.2, dimensionId: 15, expectedSegmentName: "Moderately Optimistic", expectedLevel: 2 },
    { theta: -2.5, dimensionId: 15, expectedSegmentName: "Highly Realistic", expectedLevel: 5 },
    { theta: 10, dimensionId: 1, expectedSegmentName: "Highly Expressive", expectedLevel: 1, description: "Theta far above max"},
    { theta: -10, dimensionId: 1, expectedSegmentName: "Highly Reserved", expectedLevel: 5, description: "Theta far below min"},
  ];

  testCases.forEach(tc => {
    total++;
    const segment = logicService.getSegmentForTheta(tc.theta, tc.dimensionId);
    let currentTestPassed = false;
    if (segment && segment.name_en === tc.expectedSegmentName && segment.segment_level === tc.expectedLevel) {
      currentTestPassed = true;
    }
    if (currentTestPassed) passed++;
    console.log(`Test: Dim ${tc.dimensionId}, Theta=${tc.theta} => Segment: ${segment ? segment.name_en : "null"} (Level ${segment ? segment.segment_level : "N/A"}). Expected: ${tc.expectedSegmentName} (Level ${tc.expectedLevel}). Result: ${currentTestPassed ? "PASS" : "FAIL"}`);
  });
  console.log(`getSegmentForTheta: ${passed}/${total} passed.`);
  return passed === total;
};

// Run tests
const allPassedProb = testCalculate2PLProbability();
const allPassedDich = testGetDichotomousResponse();
const allPassedSeg = testGetSegmentForTheta();

console.log("\n--- Validation Summary ---");
console.log(`calculate2PLProbability all passed: ${allPassedProb}`);
console.log(`getDichotomousResponse all passed: ${allPassedDich}`);
console.log(`getSegmentForTheta all passed: ${allPassedSeg}`);

if (allPassedProb && allPassedDich && allPassedSeg) {
  console.log("\nALL IRT LOGIC VALIDATION TESTS PASSED!");
} else {
  console.log("\nSOME IRT LOGIC VALIDATION TESTS FAILED.");
}

console.log("\n--- End of IRT Logic Validation ---");

