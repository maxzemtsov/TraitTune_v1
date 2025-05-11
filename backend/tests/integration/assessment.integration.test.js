const request = require("supertest");
const fs = require("fs"); // Added for file writing
const app = require("../../src/app");
const assessmentDataService = require("../../src/services/assessmentDataService"); // This is the auto-mocked version by jest.mock below

// Mocking authMiddleware for tests
jest.mock("../../src/middleware/authMiddleware", () => (req, res, next) => {
    req.user = { userId: "test-user-123", sessionId: "test-session-123" };
    next();
});

// Mock assessmentDataService
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
    getQuestions: jest.fn(() => Promise.resolve(mockQuestionsDim1)),
    getAnchorQuestions: jest.fn((dimensionId) => {
        if (dimensionId === 1) {
            return Promise.resolve([mockQuestionsDim1[0], mockQuestionsDim1[1]]);
        }
        return Promise.resolve([]);
    }),
    getQuestionById: jest.fn((id) => {
        return Promise.resolve(mockQuestionsDim1.find(q => q.id === id) || null);
    }),
    getAnswerOptionsForQuestion: jest.fn((questionId) => {
        const q = mockQuestionsDim1.find(q => q.id === questionId);
        if (q && q.question_type === "likert") return Promise.resolve([{ code: "1" }, { code: "2" }, { code: "3" }, { code: "4" }, { code: "5" }]);
        if (q && (q.question_type === "forced" || q.question_type === "scenario")) return Promise.resolve([{ code: "A", score_value: "1" }, { code: "B", score_value: "-1" }]);
        return Promise.resolve([]);
    }),
    getSegments: jest.fn((dimensionId) => Promise.resolve([
        { id: 1, dimension_id: 1, segment_level: 1, name_en: "Very Low", theta_min: -3.0, theta_max: -1.5 },
        { id: 2, dimension_id: 1, segment_level: 2, name_en: "Low", theta_min: -1.5, theta_max: -0.5 },
        { id: 3, dimension_id: 1, segment_level: 3, name_en: "Neutral", theta_min: -0.5, theta_max: 0.5 },
        { id: 4, dimension_id: 1, segment_level: 4, name_en: "High", theta_min: 0.5, theta_max: 1.5 },
        { id: 5, dimension_id: 1, segment_level: 5, name_en: "Very High", theta_min: 1.5, theta_max: 3.0 },
    ].filter(s => s.dimension_id === dimensionId))),
    getCacheStatus: jest.fn(() => ({ isInitialized: true, usingMockData: true })),
    saveUserResponse: jest.fn((data) => Promise.resolve({ ...data, id: Date.now() })),
    saveUserDimensionResult: jest.fn((data) => Promise.resolve({ ...data, id: Date.now() }))
}));

// Mock assessmentLogicService to control calculateConfidenceScore
jest.mock("../../src/services/assessmentLogicService", () => {
    const originalModule = jest.requireActual("../../src/services/assessmentLogicService");
    return {
        ...originalModule, // Spread original module to keep other functions and TARGET_CONFIDENCE_SCORE
        calculateConfidenceScore: jest.fn(), // This specific function will be a mock
    };
});

// Import the mocked version AFTER jest.mock has been defined
const assessmentLogicService = require("../../src/services/assessmentLogicService");
// Import the actual service to access original implementations for resetting mocks or getting actual constants
const actualAssessmentLogicService = jest.requireActual("../../src/services/assessmentLogicService");

describe("Assessment API Integration Tests - CAT/IRT Logic", () => {

    beforeEach(async () => {
        await request(app).post("/api/v1/assessment/debug/reset-state").send({});
        jest.clearAllMocks(); 
        // Reset getQuestions and getAnchorQuestions for assessmentDataService to default mocks
        assessmentDataService.getQuestions.mockImplementation(() => Promise.resolve(mockQuestionsDim1));
        assessmentDataService.getAnchorQuestions.mockImplementation((dimensionId) => {
            if (dimensionId === 1) return Promise.resolve([mockQuestionsDim1[0], mockQuestionsDim1[1]]);
            return Promise.resolve([]);
        });
        // Reset calculateConfidenceScore to its original implementation by default for each test
        assessmentLogicService.calculateConfidenceScore.mockImplementation(actualAssessmentLogicService.calculateConfidenceScore);
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

        it("should process responses, adaptively select questions, and eventually complete by MAX_QUESTIONS_PER_DIMENSION", async () => {
            // Ensure confidence does not cause early completion for this test
            assessmentLogicService.calculateConfidenceScore.mockImplementation(() => 0.1); 

            let startResponse = await request(app).get(`/api/v1/assessment/start/${dimensionId}`);
            expect(startResponse.statusCode).toBe(200);
            let nextQuestion = startResponse.body.nextQuestion;
            let questionsAnsweredCount = 0;
            const MAX_QUESTIONS_ROUTE = 10;

            for (let i = 0; i < MAX_QUESTIONS_ROUTE; i++) {
                expect(nextQuestion).not.toBeNull();
                
                const responsePayload = {
                    dimensionId: dimensionId,
                    questionId: nextQuestion.id,
                    answerCode: "3"
                };
                if (nextQuestion.question_type === "forced" || nextQuestion.question_type === "scenario") {
                    responsePayload.answerCode = "A";
                }

                const submitResponse = await request(app)
                    .post("/api/v1/assessment/response")
                    .send(responsePayload);
                
                questionsAnsweredCount++;
                nextQuestion = submitResponse.body.nextQuestion;

                if (questionsAnsweredCount === MAX_QUESTIONS_ROUTE) {
                    expect(submitResponse.statusCode).toBe(200);
                    expect(submitResponse.body.message).toMatch(/completed: Max questions reached/i);
                    expect(submitResponse.body.nextQuestion).toBeNull();
                    break; 
                } else {
                    expect(submitResponse.statusCode).toBe(200);
                    expect(submitResponse.body.message).toMatch(/Response processed/i);
                    expect(submitResponse.body.nextQuestion).not.toBeNull();
                }
            }
            expect(questionsAnsweredCount).toBe(MAX_QUESTIONS_ROUTE);
        }, 20000);

        it("should complete assessment if target confidence is reached after MIN_QUESTIONS_FOR_CONFIDENCE_CHECK", async () => {
            await request(app).get(`/api/v1/assessment/start/${dimensionId}`);
            
            const MIN_Q_FOR_CONF_CHECK = 3; 
            const targetConfidenceThreshold = actualAssessmentLogicService.TARGET_CONFIDENCE_SCORE;

            for (let i = 0; i < MIN_Q_FOR_CONF_CHECK - 1; i++) {
                assessmentLogicService.calculateConfidenceScore.mockImplementationOnce(() => 0.1); // Low confidence
                const currentStateRes = await request(app).get(`/api/v1/assessment/state/${dimensionId}`);
                const currentQ = currentStateRes.body.currentQuestion;
                expect(currentQ).not.toBeNull();
                let answerCodeForCurrentQ = "3"; // Default for likert
                if (currentQ.question_type === "forced" || currentQ.question_type === "scenario") {
                    answerCodeForCurrentQ = "A";
                }
                await request(app).post("/api/v1/assessment/response").send({ dimensionId, questionId: currentQ.id, answerCode: answerCodeForCurrentQ });
            }

            // For the critical response that should trigger confidence completion
            assessmentLogicService.calculateConfidenceScore.mockImplementationOnce(() => targetConfidenceThreshold + 0.1); // High confidence
            
            const lastStateRes = await request(app).get(`/api/v1/assessment/state/${dimensionId}`);
            const lastQ = lastStateRes.body.currentQuestion;
            expect(lastQ).not.toBeNull();
            const responsePayload = { dimensionId, questionId: lastQ.id, answerCode: "3" }; 
            const finalResponse = await request(app).post("/api/v1/assessment/response").send(responsePayload);

            if (finalResponse.statusCode === 400) {
                fs.writeFileSync("/home/ubuntu/traittune/backend/test_error_output.json", JSON.stringify(finalResponse.body, null, 2));
                console.log("DEBUG: Failing test received 400 response body, logged to test_error_output.json");
            }

            expect(finalResponse.statusCode).toBe(200);
            expect(finalResponse.body.message).toMatch(/completed: Target confidence reached/i);
            expect(finalResponse.body.nextQuestion).toBeNull();
            expect(finalResponse.body.confidenceScore).toBeGreaterThanOrEqual(targetConfidenceThreshold);
            expect(finalResponse.body.state.questionsAnswered.length).toBe(MIN_Q_FOR_CONF_CHECK);
        });

        it("should complete if no more suitable questions are available", async () => {
            assessmentDataService.getQuestions.mockImplementation(() => Promise.resolve([mockQuestionsDim1[0], mockQuestionsDim1[1]])); 
            assessmentDataService.getAnchorQuestions.mockImplementation((dimId) => {
                 if (dimId === 1) return Promise.resolve([mockQuestionsDim1[0]]);
                 return Promise.resolve([]);
            });
            
            await request(app).get(`/api/v1/assessment/start/${dimensionId}`);
            await request(app).post("/api/v1/assessment/response").send({ dimensionId, questionId: mockQuestionsDim1[0].id, answerCode: "3" });
            const finalResponse = await request(app).post("/api/v1/assessment/response").send({ dimensionId, questionId: mockQuestionsDim1[1].id, answerCode: "3" });

            expect(finalResponse.statusCode).toBe(200);
            expect(finalResponse.body.message).toMatch(/completed: No more suitable questions available/i);
            expect(finalResponse.body.nextQuestion).toBeNull();
        });

        it("should return 400 if response is for an unexpected question", async () => {
            await request(app).get(`/api/v1/assessment/start/${dimensionId}`); 
            const responsePayload = { dimensionId, questionId: 999, answerCode: "3" }; 
            const response = await request(app).post("/api/v1/assessment/response").send(responsePayload);
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/Response submitted for question ID 999, but current expected question is ID 101/i);
        });
    });

    describe("GET /api/v1/assessment/questions (Basic Check)", () => {
        it("should return 200 and an array for authenticated user", async () => {
            const response = await request(app).get("/api/v1/assessment/questions");
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});

