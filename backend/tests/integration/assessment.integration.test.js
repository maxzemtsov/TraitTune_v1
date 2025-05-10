// /home/ubuntu/traittune/backend/tests/integration/assessment.integration.test.js
const request = require("supertest");
const app = require("../../src/app");
const assessmentDataService = require("../../src/services/assessmentDataService");
const assessmentLogicService = require("../../src/services/assessmentLogicService");

// Mocking authMiddleware for tests
jest.mock("../../src/middleware/authMiddleware", () => (req, res, next) => {
    req.user = { userId: "test-user-123" };
    next();
});

// More detailed mock for assessmentDataService
const mockQuestionsDim1 = [
    { id: 101, dimension_id: 1, question_type: "likert", segment_level: 3, irt_discriminativeness: 1.5, irt_difficulty: 0.0, is_reverse: false, text_en: "Anchor Q1 Dim1" },
    { id: 102, dimension_id: 1, question_type: "likert", segment_level: 3, irt_discriminativeness: 1.8, irt_difficulty: 0.2, is_reverse: false, text_en: "Q2 Dim1" },
    { id: 103, dimension_id: 1, question_type: "forced", segment_level: 2, irt_discriminativeness: 1.2, irt_difficulty: -0.5, is_reverse: false, text_en: "Q3 Dim1" },
    { id: 104, dimension_id: 1, question_type: "scenario", segment_level: 4, irt_discriminativeness: 1.6, irt_difficulty: 0.8, is_reverse: true, text_en: "Q4 Dim1" },
    { id: 105, dimension_id: 1, question_type: "likert", segment_level: 5, irt_discriminativeness: 1.9, irt_difficulty: 1.5, is_reverse: false, text_en: "Q5 Dim1" },
    { id: 106, dimension_id: 1, question_type: "likert", segment_level: 1, irt_discriminativeness: 1.7, irt_difficulty: -1.2, is_reverse: false, text_en: "Q6 Dim1" },
    { id: 107, dimension_id: 1, question_type: "forced", segment_level: 3, irt_discriminativeness: 1.4, irt_difficulty: 0.1, is_reverse: true, text_en: "Q7 Dim1" },
    { id: 108, dimension_id: 1, question_type: "scenario", segment_level: 2, irt_discriminativeness: 1.3, irt_difficulty: -0.8, is_reverse: false, text_en: "Q8 Dim1" },
    { id: 109, dimension_id: 1, question_type: "likert", segment_level: 4, irt_discriminativeness: 1.6, irt_difficulty: 1.0, is_reverse: true, text_en: "Q9 Dim1" },
    { id: 110, dimension_id: 1, question_type: "likert", segment_level: 5, irt_discriminativeness: 2.0, irt_difficulty: 1.8, is_reverse: false, text_en: "Q10 Dim1" },
    { id: 111, dimension_id: 1, question_type: "likert", segment_level: 1, irt_discriminativeness: 1.5, irt_difficulty: -1.5, is_reverse: false, text_en: "Q11 Dim1" }
];

jest.mock("../../src/services/assessmentDataService", () => ({
    dataInitializationPromise: Promise.resolve(),
    getQuestions: jest.fn(() => mockQuestionsDim1), // Return a more diverse set for testing adaptive logic
    getAnchorQuestions: jest.fn((dimensionId) => {
        if (dimensionId === 1) {
            return [mockQuestionsDim1[0], mockQuestionsDim1[1]]; // Return first two as anchors
        }
        return [];
    }),
    getQuestionById: jest.fn((id) => {
        return mockQuestionsDim1.find(q => q.id === id) || null;
    }),
    getAnswerOptionsForQuestion: jest.fn((questionId) => {
        // Provide generic options, specific tests might need to refine this mock per question type
        const q = mockQuestionsDim1.find(q => q.id === questionId);
        if (q && q.question_type === "likert") return [{ code: "1" }, { code: "2" }, { code: "3" }, { code: "4" }, { code: "5" }];
        if (q && (q.question_type === "forced" || q.question_type === "scenario")) return [{ code: "A", score_value: "1" }, { code: "B", score_value: "-1" }];
        return [];
    }),
    getSegments: jest.fn(() => [
        // Mock segments for dimension 1
        { dimension_id: 1, segment_level: 1, name_en: "Very Low", theta_min: -3.0, theta_max: -1.5 },
        { dimension_id: 1, segment_level: 2, name_en: "Low", theta_min: -1.5, theta_max: -0.5 },
        { dimension_id: 1, segment_level: 3, name_en: "Neutral", theta_min: -0.5, theta_max: 0.5 },
        { dimension_id: 1, segment_level: 4, name_en: "High", theta_min: 0.5, theta_max: 1.5 },
        { dimension_id: 1, segment_level: 5, name_en: "Very High", theta_min: 1.5, theta_max: 3.0 },
    ]),
    getCacheStatus: jest.fn(() => ({ isInitialized: true, usingMockData: true }))
}));

// We will use the actual assessmentLogicService, but can spy on its methods if needed
// jest.spyOn(assessmentLogicService, 'estimateTheta');
// jest.spyOn(assessmentLogicService, 'calculateConfidenceScore');

describe("Assessment API Integration Tests - CAT/IRT Logic", () => {
    beforeEach(async () => {
        // Reset userStates before each test to ensure isolation
        // This is a simple way to clear in-memory state. For more complex scenarios, you might need a dedicated reset function.
        const assessmentRoutes = require("../../src/routes/assessmentRoutes"); // Re-require to access userStates if it's module-scoped
        // This direct manipulation is not ideal. Better to have a reset endpoint or clear state via service.
        // For now, we'll assume tests don't heavily interfere or we manage state carefully.
        // The userStates object is in assessmentRoutes.js, so we can't directly clear it here easily without exporting it from there.
        // For robust tests, the state management in assessmentRoutes should be refactored to allow easier test setup/teardown.
        // For this iteration, we'll rely on distinct userIds or careful sequencing if needed.
        await assessmentDataService.dataInitializationPromise;
    });

    describe("GET /api/v1/assessment/start/:dimensionId", () => {
        it("should start assessment and return the first anchor question for a valid dimensionId", async () => {
            const dimensionId = 1;
            const response = await request(app).get(`/api/v1/assessment/start/${dimensionId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("nextQuestion");
            expect(response.body.nextQuestion.id).toBe(mockQuestionsDim1[0].id);
            expect(response.body.state.currentTheta).toBe(0);
        });
    });

    describe("POST /api/v1/assessment/response - Full CAT/IRT Flow", () => {
        const dimensionId = 1;
        const userId = "test-user-123"; // Matches the mock authMiddleware

        it("should process responses, adaptively select questions, and eventually complete by MAX_QUESTIONS_PER_DIMENSION", async () => {
            // Start assessment
            let startResponse = await request(app).get(`/api/v1/assessment/start/${dimensionId}`);
            expect(startResponse.statusCode).toBe(200);
            let nextQuestion = startResponse.body.nextQuestion;
            let questionsAnsweredCount = 0;
            const MAX_ITERATIONS = 15; // Safety break for the loop

            while (nextQuestion && questionsAnsweredCount < MAX_ITERATIONS) {
                const responsePayload = {
                    dimensionId: dimensionId,
                    questionId: nextQuestion.id,
                    answerCode: "3" // Generic answer for Likert, or "A" for forced/scenario
                };
                if (nextQuestion.question_type === "forced" || nextQuestion.question_type === "scenario") {
                    responsePayload.answerCode = "A";
                }

                const submitResponse = await request(app)
                    .post("/api/v1/assessment/response")
                    .send(responsePayload);
                
                expect(submitResponse.statusCode).toBe(200);
                questionsAnsweredCount++;
                nextQuestion = submitResponse.body.nextQuestion;

                if (submitResponse.body.message.includes("completed")) {
                    expect(submitResponse.body.nextQuestion).toBeNull();
                    expect(submitResponse.body).toHaveProperty("finalTheta");
                    expect(submitResponse.body).toHaveProperty("finalSegment");
                    expect(submitResponse.body).toHaveProperty("confidenceScore");
                    // Check if completion was due to max questions
                    // This requires the MAX_QUESTIONS_PER_DIMENSION to be set appropriately in assessmentRoutes.js (e.g., 10)
                    // And that the test loop actually hits this number.
                    // For this test, we expect it to complete due to MAX_QUESTIONS_PER_DIMENSION (currently 10 in routes)
                    expect(questionsAnsweredCount).toBeGreaterThanOrEqual(10); 
                    break;
                }
                expect(nextQuestion).not.toBeNull(); // Should always get a next question until completion
            }
            expect(questionsAnsweredCount).toBeLessThan(MAX_ITERATIONS); // Ensure loop didn't just time out
            expect(questionsAnsweredCount).toBe(10); // Based on MAX_QUESTIONS_PER_DIMENSION in routes
        }, 20000); // Increase timeout for looped test

        it("should complete assessment if target confidence is reached after MIN_QUESTIONS_FOR_CONFIDENCE_CHECK", async () => {
            // This test requires careful mocking of estimateTheta and calculateConfidenceScore 
            // or ensuring the actual logic service functions lead to this state.
            // For now, we'll spy and mock the confidence score to trigger completion.
            
            const logicServiceActual = require("../../src/services/assessmentLogicService");
            const calculateConfidenceSpy = jest.spyOn(logicServiceActual, 'calculateConfidenceScore');
            
            // Start assessment
            await request(app).get(`/api/v1/assessment/start/${dimensionId}`);
            let currentQ = mockQuestionsDim1[0];

            // Simulate 2 responses (MIN_QUESTIONS_FOR_CONFIDENCE_CHECK is 3, so 3rd response will trigger check)
            for (let i = 0; i < 2; i++) {
                await request(app).post("/api/v1/assessment/response").send({ dimensionId, questionId: mockQuestionsDim1[i].id, answerCode: "3" });
                currentQ = mockQuestionsDim1[i+1]; // Assume sequential for this setup
            }

            // On the 3rd response, make confidence high enough
            calculateConfidenceSpy.mockReturnValueOnce(assessmentLogicService.TARGET_CONFIDENCE_SCORE + 0.1);

            const responsePayload = { dimensionId, questionId: currentQ.id, answerCode: "3" }; 
            const finalResponse = await request(app).post("/api/v1/assessment/response").send(responsePayload);

            expect(finalResponse.statusCode).toBe(200);
            expect(finalResponse.body.message).toMatch(/completed/i);
            expect(finalResponse.body.message).toMatch(/Target confidence reached/i); // Check console log in route
            expect(finalResponse.body.nextQuestion).toBeNull();
            expect(finalResponse.body.confidenceScore).toBeGreaterThanOrEqual(assessmentLogicService.TARGET_CONFIDENCE_SCORE);
            expect(finalResponse.body.state.questionsAnswered.length).toBe(3);

            calculateConfidenceSpy.mockRestore();
        });

        it("should complete if no more suitable questions are available", async () => {
            const dataServiceActual = require("../../src/services/assessmentDataService");
            const getQuestionsSpy = jest.spyOn(dataServiceActual, 'getQuestions');
            
            // Start assessment
            await request(app).get(`/api/v1/assessment/start/${dimensionId}`);

            // Provide only a few questions for the dimension to force completion
            getQuestionsSpy.mockReturnValueOnce([mockQuestionsDim1[0], mockQuestionsDim1[1]]);
            
            // Answer first question
            await request(app).post("/api/v1/assessment/response").send({ dimensionId, questionId: mockQuestionsDim1[0].id, answerCode: "3" });
            // Answer second question
            const finalResponse = await request(app).post("/api/v1/assessment/response").send({ dimensionId, questionId: mockQuestionsDim1[1].id, answerCode: "3" });

            expect(finalResponse.statusCode).toBe(200);
            expect(finalResponse.body.message).toMatch(/completed/i);
            expect(finalResponse.body.message).toMatch(/no more suitable questions/i);
            expect(finalResponse.body.nextQuestion).toBeNull();

            getQuestionsSpy.mockRestore();
        });

        it("should return 400 if response is for an unexpected question", async () => {
            await request(app).get(`/api/v1/assessment/start/${dimensionId}`); // Expected Q is 101
            const responsePayload = { dimensionId, questionId: 999, answerCode: "3" }; // Wrong question ID
            const response = await request(app).post("/api/v1/assessment/response").send(responsePayload);
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/Response submitted for question ID 999, but current expected question is ID 101/i);
        });

    });

    // Basic GET /questions and auth test (can be expanded)
    describe("GET /api/v1/assessment/questions (Basic Check)", () => {
        it("should return 200 and an array for authenticated user", async () => {
            const response = await request(app).get("/api/v1/assessment/questions");
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});


