const fs = require("fs");
const path = require("path");
const { query } = require("../config/db");

// In-memory cache for assessment data
const cache = {
  questions: [],
  openQuestions: [],
  answerOptions: [],
  segments: [],
  interpretationTemplates: [],
  lastRefreshed: null,
  isInitialized: false,
  usingMockData: false
};

const CACHE_TTL_MS = 60 * 60 * 1000; // Cache for 1 hour, for example
const MOCK_DATA_DIR = path.join(__dirname, "../data/mock");

const loadMockData = () => {
  console.log("Attempting to load assessment data from mock JSON files...");
  try {
    cache.questions = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "questions.json"), "utf-8"));
    cache.openQuestions = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "open_questions.json"), "utf-8"));
    cache.answerOptions = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "answer_options.json"), "utf-8"));
    cache.segments = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "segment_definitions.json"), "utf-8"));
    cache.interpretationTemplates = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "interpretation_templates.json"), "utf-8"));
    
    cache.lastRefreshed = new Date();
    cache.isInitialized = true;
    cache.usingMockData = true;
    console.log("Assessment data loaded and cached successfully from mock files.");
  } catch (error) {
    console.error("Error loading assessment data from mock files:", error);
    // If mock data loading fails, the cache will remain empty.
    cache.isInitialized = false; // Mark as not initialized if mock loading fails
    throw error; // Propagate error
  }
};

const loadDataFromDBAndCache = async () => {
  try {
    console.log("Attempting to load assessment data from database and update cache...");

    const questionsResult = await query("SELECT * FROM questions ORDER BY id ASC");
    cache.questions = questionsResult.rows;

    const openQuestionsResult = await query("SELECT * FROM open_questions ORDER BY id ASC");
    cache.openQuestions = openQuestionsResult.rows;

    const answerOptionsResult = await query("SELECT * FROM answer_options ORDER BY id ASC");
    cache.answerOptions = answerOptionsResult.rows;

    const segmentsResult = await query("SELECT * FROM segments ORDER BY dimension_id ASC, segment_level ASC");
    cache.segments = segmentsResult.rows;

    const interpretationTemplatesResult = await query("SELECT * FROM interpretation_templates ORDER BY id ASC");
    cache.interpretationTemplates = interpretationTemplatesResult.rows;

    cache.lastRefreshed = new Date();
    cache.isInitialized = true;
    cache.usingMockData = false;

    console.log("Assessment data loaded and cached successfully from database.");
    console.log(`Cached ${cache.questions.length} questions.`);
    console.log(`Cached ${cache.openQuestions.length} open questions.`);
    console.log(`Cached ${cache.answerOptions.length} answer options.`);
    console.log(`Cached ${cache.segments.length} segment definitions.`);
    console.log(`Cached ${cache.interpretationTemplates.length} interpretation templates.`);
    console.log(`Cache last refreshed: ${cache.lastRefreshed.toISOString()}`);

  } catch (error) {
    console.error("Error loading assessment data from database into cache:", error);
    console.log("Falling back to mock data due to database error.");
    loadMockData(); // Fallback to mock data
  }
};

// Getter functions now serve from the cache
const getQuestions = () => cache.questions;
const getOpenQuestions = () => cache.openQuestions;
const getAnswerOptions = () => cache.answerOptions;
const getAnswerOptionsForQuestion = (questionId) => {
    const qId = parseInt(questionId);
    return cache.answerOptions.filter(option => option.question_id === qId);
};
const getSegments = () => cache.segments;
const getInterpretationTemplates = () => cache.interpretationTemplates;

const getQuestionById = (id) => {
  const questionId = parseInt(id);
  return cache.questions.find(q => q.id === questionId);
};

const getOpenQuestionById = (id) => {
  const openQuestionId = parseInt(id);
  return cache.openQuestions.find(q => q.id === openQuestionId);
};

const getAnchorQuestions = (dimensionId) => {
  const dimId = parseInt(dimensionId);
  const anchorQs = cache.questions
    .filter(q => 
      q.dimension_id === dimId && 
      q.question_type === "likert" && 
      q.segment_level === 3 && 
      q.irt_discriminativeness !== null
    )
    .sort((a, b) => {
        const aDisc = parseFloat(a.irt_discriminativeness);
        const bDisc = parseFloat(b.irt_discriminativeness);
        return bDisc - aDisc;
    })
    .slice(0, 2);
  return anchorQs;
};

// Function to manually refresh the cache
const refreshDataCache = async () => {
    console.log("Manual cache refresh initiated...");
    if (process.env.USE_MOCK_DATA === "true") {
        loadMockData();
    } else {
        await loadDataFromDBAndCache();
    }
};

// Initial data load and cache population
const initializeAndCacheData = async () => {
    if (!cache.isInitialized) {
        try {
            console.log("Initializing and caching data on startup...");
            if (process.env.USE_MOCK_DATA === "true") {
                console.log("USE_MOCK_DATA is true. Loading mock data.");
                loadMockData();
            } else {
                await loadDataFromDBAndCache();
            }
        } catch (err) {
            console.error("Failed to initialize and cache assessment data on startup:", err);
            // If DB fails and USE_MOCK_DATA is not true, it will try to load mock data as fallback inside loadDataFromDBAndCache
            // If USE_MOCK_DATA is true and it fails, then it's a critical error with mock files.
        }
    }
};

const dataInitializationPromise = initializeAndCacheData();

module.exports = {
  dataInitializationPromise,
  getQuestions,
  getOpenQuestions,
  getAnswerOptions,
  getAnswerOptionsForQuestion,
  getSegments,
  getInterpretationTemplates,
  getQuestionById,
  getOpenQuestionById,
  getAnchorQuestions,
  refreshDataCache, // Expose manual refresh function
  getCacheStatus: () => ({ // For debugging/monitoring
      isInitialized: cache.isInitialized,
      usingMockData: cache.usingMockData,
      lastRefreshed: cache.lastRefreshed ? cache.lastRefreshed.toISOString() : null,
      itemCounts: {
          questions: cache.questions.length,
          openQuestions: cache.openQuestions.length,
          answerOptions: cache.answerOptions.length,
          segments: cache.segments.length,
          interpretationTemplates: cache.interpretationTemplates.length
      }
  })
};

