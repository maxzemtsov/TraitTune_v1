# TraitTune Backend: Data Loading and Caching Logic

This document outlines the data loading and caching mechanisms implemented in the TraitTune backend, specifically within `src/services/assessmentDataService.js`.

## Overview

The `assessmentDataService.js` is responsible for fetching and caching all critical assessment data, including questions, answer options, segment definitions, and interpretation templates. It is designed to work with a PostgreSQL database (Supabase) but includes a fallback mechanism to use local mock JSON files if the database is unavailable or if explicitly configured to do so.

## Data Sources

1.  **Primary Data Source: PostgreSQL Database (Supabase)**
    *   The service attempts to connect to the PostgreSQL database defined by the environment variables in the `.env` file (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`).
    *   SQL queries are executed to fetch data from tables like `questions`, `open_questions`, `answer_options`, `segment_definitions`, and `interpretation_templates`.

2.  **Fallback/Mock Data Source: Local JSON Files**
    *   If the database connection fails during the initial data load, or if the environment variable `USE_MOCK_DATA` is set to `"true"`, the service will load data from JSON files located in `/home/ubuntu/traittune_backend/src/data/mock/`.
    *   The mock files are:
        *   `questions.json`
        *   `open_questions.json`
        *   `answer_options.json`
        *   `segment_definitions.json`
        *   `interpretation_templates.json`

## Caching Mechanism

*   **In-Memory Cache**: All loaded data is stored in an in-memory JavaScript object named `cache` within the `assessmentDataService.js` module.
    ```javascript
    const cache = {
      questions: [],
      openQuestions: [],
      answerOptions: [],
      segments: [],
      interpretationTemplates: [],
      lastRefreshed: null,
      isInitialized: false,
      usingMockData: false // Indicates if mock data is currently in use
    };
    ```
*   **Initialization**: Data is loaded into the cache when the server starts. The `initializeAndCacheData()` function is called, which in turn calls `loadDataFromDBAndCache()` or `loadMockData()` based on the configuration and database availability.
*   **Cache TTL (Time To Live)**: A `CACHE_TTL_MS` constant is defined (e.g., 1 hour), but automatic periodic refresh based on TTL is currently commented out. Refreshing the cache currently requires a manual trigger or server restart.
*   **Cache Status**: The `/api/cache-status` endpoint (protected by `ADMIN_SECRET_KEY`) provides information about the cache, including initialization status, whether mock data is being used, last refresh time, and item counts.

## Key Functions in `assessmentDataService.js`

*   `initializeAndCacheData()`: Called on server startup to populate the cache. It checks `process.env.USE_MOCK_DATA` first.
*   `loadDataFromDBAndCache()`: Asynchronously fetches data from all relevant database tables and populates the cache. If a database error occurs, it calls `loadMockData()` as a fallback.
*   `loadMockData()`: Synchronously reads data from the JSON files in the mock directory and populates the cache. Sets `cache.usingMockData` to `true`.
*   `getQuestions()`, `getOpenQuestions()`, `getAnswerOptions()`, `getSegments()`, `getInterpretationTemplates()`: Getter functions that return the cached data arrays.
*   `getQuestionById(id)`, `getOpenQuestionById(id)`: Retrieve specific items by ID from the cache.
*   `getAnswerOptionsForQuestion(questionId)`: Filters and returns answer options for a specific question ID.
*   `getAnchorQuestions(dimensionId)`: Retrieves specific anchor questions for a dimension based on criteria (likert, segment_level 3, highest discriminativeness).
*   `refreshDataCache()`: An asynchronous function to manually trigger a data refresh. It will respect the `USE_MOCK_DATA` environment variable.
*   `getCacheStatus()`: Returns an object with the current status and contents of the cache.

## Configuration

*   **`.env` file**: Contains database credentials and the `ADMIN_SECRET_KEY`.
    *   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`: For PostgreSQL connection.
    *   `SUPABASE_JWT_SECRET`: Used by `authMiddleware.js` to verify JWTs.
    *   `ADMIN_SECRET_KEY`: For accessing the `/api/cache-status` endpoint.
*   **`USE_MOCK_DATA` (Environment Variable)**: If you want to force the use of mock data, you can set this environment variable to `"true"` when starting the server. For example:
    ```bash
    USE_MOCK_DATA="true" pm2 start src/index.js --name backend
    ```
    Or add `USE_MOCK_DATA=true` to your `.env` file (though direct environment variable setting for `pm2 start` or `npm start` scripts is often preferred for temporary overrides).

## Current Status (as of last test)

*   The backend is configured to attempt connection to `api.traittune.com`.
*   Due to `ENOTFOUND` errors for `api.traittune.com`, the system successfully falls back to using mock data from the `/home/ubuntu/traittune_backend/src/data/mock/` directory.
*   The cache is initialized and serving data from these mock files.

This setup allows for continued backend development and testing even when the live database is not accessible or not yet fully populated.

