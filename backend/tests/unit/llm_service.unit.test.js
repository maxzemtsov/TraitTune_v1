// /home/ubuntu/traittune/backend/tests/unit/llm_service.unit.test.js

const { analyzeOpenResponse } = require("../../src/services/llm_service/llm_service");
const openai = require("../../src/config/openaiClient");

// Mock the OpenAI client
jest.mock("../../src/config/openaiClient", () => ({
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
}));

// Mock console to prevent test output clutter and allow assertions on logs
// console.log = jest.fn();
// console.warn = jest.fn();
// console.error = jest.fn();

describe("LLM Service - Unit Tests", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Restore original console functions if they were mocked for specific tests
    // jest.restoreAllMocks(); 
  });

  const mockSessionId = "test-session-123";
  const mockUserId = "test-user-xyz";
  const mockOpenQuestionId = 789;
  const mockResponseText = "This is a user\'s thoughtful response to an open question.";
  const mockContext = {
    dimension_id: 1,
    dimension_name: "Optimism-Pessimism",
    dimension_description: "A tendency to expect positive outcomes.",
    positive_pole: "Highly Optimistic",
    negative_pole: "Highly Pessimistic",
    question_text: "Describe your general outlook on life.",
    segment_level_explored: 3,
    segment_description_explored: "Neutral",
    example_high_response: "I always see the good in things.",
    example_low_response: "Things rarely work out for me.",
  };

  describe("analyzeOpenResponse - Successful Analysis", () => {
    it("should return parsed LLM analysis and use correct model and parameters", async () => {
      const mockLLMResponse = {
        theta: 1.5,
        interpretation_en: "The user shows a positive outlook.",
        interpretation_ru: "Пользователь демонстрирует позитивный взгляд.",
        confidence: 0.85,
      };
      openai.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockLLMResponse),
            },
          },
        ],
      });

      const result = await analyzeOpenResponse(
        mockSessionId,
        mockUserId,
        mockOpenQuestionId,
        mockResponseText,
        mockContext
      );

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
      expect(openai.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-4.1-nano",
        messages: expect.any(Array),
        response_format: { type: "json_object" },
        temperature: 0.2,
      });
      
      // Check if the prompt contains key contextual information
      const calledWith = openai.chat.completions.create.mock.calls[0][0];
      const userMessageContent = calledWith.messages.find(m => m.role === "user").content;
      expect(userMessageContent).toContain(mockContext.dimension_name);
      expect(userMessageContent).toContain(mockResponseText);
      expect(userMessageContent).toContain("Output MUST be in JSON format only.");

      expect(result).toEqual({
        inferred_theta: 1.5,
        interpretation_en: "The user shows a positive outlook.",
        interpretation_ru: "Пользователь демонстрирует позитивный взгляд.",
        llm_confidence: 0.85,
      });
    });

    it("should correctly clamp theta and confidence values to their respective ranges", async () => {
      const mockLLMResponseOver = {
        theta: 5.0, // Above max
        interpretation_en: "Overly positive.",
        interpretation_ru: "Слишком позитивно.",
        confidence: 1.5, // Above max
      };
      openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockLLMResponseOver) } }],
      });

      let result = await analyzeOpenResponse(mockSessionId, mockUserId, mockOpenQuestionId, "Response leading to over values", mockContext);
      expect(result.inferred_theta).toBe(3.0);
      expect(result.llm_confidence).toBe(1.0);

      const mockLLMResponseUnder = {
        theta: -5.0, // Below min
        interpretation_en: "Overly negative.",
        interpretation_ru: "Слишком негативно.",
        confidence: -0.5, // Below min
      };
      openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockLLMResponseUnder) } }],
      });
      result = await analyzeOpenResponse(mockSessionId, mockUserId, mockOpenQuestionId, "Response leading to under values", mockContext);
      expect(result.inferred_theta).toBe(-3.0);
      expect(result.llm_confidence).toBe(0.0);
    });
  });

  describe("analyzeOpenResponse - Input Validation", () => {
    it("should throw an error if responseText is missing", async () => {
      await expect(
        analyzeOpenResponse(mockSessionId, mockUserId, mockOpenQuestionId, "", mockContext)
      ).rejects.toThrow("Response text and open question ID are required for LLM analysis.");
    });

    it("should throw an error if openQuestionId is missing", async () => {
      await expect(
        analyzeOpenResponse(mockSessionId, mockUserId, null, mockResponseText, mockContext)
      ).rejects.toThrow("Response text and open question ID are required for LLM analysis.");
    });

    it("should proceed with a warning if context is missing (but not throw)", async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const mockLLMResponse = {
        theta: 0.5,
        interpretation_en: "Okay.",
        interpretation_ru: "Нормально.",
        confidence: 0.6,
      };
      openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockLLMResponse) } }],
      });

      await analyzeOpenResponse(mockSessionId, mockUserId, mockOpenQuestionId, mockResponseText, null);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `LLMService: Context object is missing for session ${mockSessionId}, question ${mockOpenQuestionId}. Analysis quality may be reduced.`
      );
      expect(openai.chat.completions.create).toHaveBeenCalled(); // Still attempts to call OpenAI
      consoleWarnSpy.mockRestore();
    });
  });

  describe("analyzeOpenResponse - Error Handling", () => {
    it("should throw an error if OpenAI API call fails", async () => {
      openai.chat.completions.create.mockRejectedValueOnce(new Error("OpenAI API Error"));
      await expect(
        analyzeOpenResponse(mockSessionId, mockUserId, mockOpenQuestionId, mockResponseText, mockContext)
      ).rejects.toThrow("LLM analysis failed: OpenAI API Error");
    });

    it("should throw an error if LLM returns a malformed JSON response", async () => {
      openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: "This is not JSON" } }],
      });
      await expect(
        analyzeOpenResponse(mockSessionId, mockUserId, mockOpenQuestionId, mockResponseText, mockContext)
      ).rejects.toThrow(/LLM analysis failed: Unexpected token/); // Error from JSON.parse
    });

    it("should throw an error if LLM response is missing required fields", async () => {
      const incompleteResponse = { theta: 1.0, confidence: 0.9 }; // Missing interpretations
      openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(incompleteResponse) } }],
      });
      await expect(
        analyzeOpenResponse(mockSessionId, mockUserId, mockOpenQuestionId, mockResponseText, mockContext)
      ).rejects.toThrow("LLM returned data in an unexpected format or with missing fields.");
    });
  });

  // Test for openai client initialization (though it's in a separate file, its usage is critical here)
  describe("OpenAI Client Initialization (Conceptual - tested via llm_service behavior)", () => {
    it("should throw an error if OPENAI_API_KEY is missing when service attempts to use client", async () => {
        // This scenario is tricky to test directly here without manipulating process.env 
        // and re-requiring modules, which Jest handles with care.
        // The openaiClient.js itself throws an error if key is missing on load.
        // We can simulate the client being unavailable to the service.
        const originalOpenAI = require("../../src/config/openaiClient");
        jest.doMock("../../src/config/openaiClient", () => null); // Make client null
        const { analyzeOpenResponse: analyzeWithNullClient } = require("../../src/services/llm_service/llm_service");

        await expect(
            analyzeWithNullClient(mockSessionId, mockUserId, mockOpenQuestionId, mockResponseText, mockContext)
        ).rejects.toThrow("OpenAI client not available. Cannot analyze response.");
        
        jest.unmock("../../src/config/openaiClient"); // Restore original mock
        jest.resetModules(); // Important to get the fresh module next time
    });
  });
});

