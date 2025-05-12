# TraitTune Backend API & Data Handling

This document provides a concise overview of the TraitTune backend API, data handling, and core services, tailored for a solopreneur focused on production deployment.

## 1. Overview

The backend provides RESTful APIs to manage user authentication, conduct adaptive personality assessments using a 2PL IRT model, and (in the future) support chat functionalities. It is built with Node.js and Express.

## 2. Data Handling

All assessment data is loaded dynamically at runtime from JSON files. **No assessment data is hardcoded into the application.**

*   **Data Directory**: `/home/ubuntu/traittune_backend/src/data/`
*   **Data Files**:
    *   `questions.json`: Core assessment questions (Likert, forced-choice, scenario, check) with IRT parameters (a, b), bilingual texts, etc.
    *   `open_questions.json`: Open-ended questions with bilingual texts.
    *   `answer_options.json`: Answer options for all questions, including codes, score values, and bilingual texts.
    *   `segment_definitions.json`: Definitions for the 5 segments within each of the 15 dimensions, including theta ranges and bilingual names.
    *   `interpretation_templates.json`: Templates for generating narrative reports based on assessment results.
*   **Data Loading Service**: `/home/ubuntu/traittune_backend/src/services/assessmentDataService.js`
    *   This service is responsible for reading and parsing all JSON data files when the server starts.
    *   It provides getter functions for other modules to access the loaded data (e.g., `getQuestions()`, `getAnswerOptionsForQuestion(questionId)`).

## 3. Core Services

*   **`assessmentDataService.js`** (Path: `src/services/assessmentDataService.js`)
    *   **Purpose**: Loads, stores, and provides access to all assessment-related data (questions, options, segments, etc.).
    *   **Key Functions**:
        *   `loadData()`: Loads all data from JSON files into memory.
        *   `getQuestions()`: Returns all core questions.
        *   `getOpenQuestions()`: Returns all open-ended questions.
        *   `getAnswerOptions()`: Returns all answer options.
        *   `getAnswerOptionsForQuestion(questionId)`: Returns answer options for a specific question.
        *   `getSegments()`: Returns all segment definitions.
        *   `getInterpretationTemplates()`: Returns all interpretation templates.
        *   `getQuestionById(id)`: Retrieves a specific question by its ID.
        *   `getAnchorQuestions(dimensionId)`: Retrieves 1-2 initial anchor questions for a given dimension.

*   **`assessmentLogicService.js`** (Path: `src/services/assessmentLogicService.js`)
    *   **Purpose**: Contains the core psychometric logic for the 2PL IRT model, response processing, and segment mapping.
    *   **Key Functions**:
        *   `calculate2PLProbability(theta, item_a, item_b, item_c = 0)`: Calculates the probability of a keyed response using the 2PL IRT model.
        *   `getDichotomousResponse(question, rawResponse, answerOptions)`: Converts a user's raw response into a dichotomous value (0 or 1) for IRT processing, handling different question types and reverse scoring.
        *   `getSegmentForTheta(theta, dimensionId)`: Maps an estimated theta score to a personality segment for a given dimension. **Note**: The current implementation correctly maps typical theta values; however, for very extreme theta values (e.g., far beyond the defined -3 to +3 range, like 10 or -10), it may not map to the most extreme segment as expected. This edge case should be reviewed if such extreme values are anticipated or critical in production.

## 4. API Endpoints

The API base path is `/api`.
All assessment-related endpoints require JWT authentication via a Bearer token in the Authorization header. Authentication is handled by `src/middleware/authMiddleware.js`.

### 4.1. Authentication (`/api/auth`)

Handled by `src/routes/authRoutes.js`.
*   `POST /register`: Registers a new user.
*   `POST /login`: Logs in an existing user and returns a JWT.
*   `GET /me`: Returns information about the currently authenticated user (validates JWT).

### 4.2. Assessment (`/api/assessment`)

Handled by `src/routes/assessmentRoutes.js`.

*   **`GET /start/:dimensionId`**
    *   **Purpose**: Starts or continues an assessment for a specific dimension.
    *   **Parameters**: `dimensionId` (integer, path parameter).
    *   **Response**: JSON object containing the first anchor question for the dimension or the current question if resuming.
        ```json
        {
          "message": "Assessment started for dimension ID 1. User: <userId>",
          "nextQuestion": { /* Question Object */ },
          "state": { /* Current user state for this dimension */ }
        }
        ```

*   **`POST /response`**
    *   **Purpose**: Submits a user's response to a question, updates their theta estimate (currently a placeholder in the provided code, actual theta estimation logic needs to be fully integrated), and returns the next question or completion status.
    *   **Request Body** (JSON):
        ```json
        {
          "dimensionId": 1,
          "questionId": 101,
          "answerCode": "A" // or "5" for Likert
        }
        ```
    *   **Response**: JSON object containing the next question or completion status.
        ```json
        // If more questions
        {
          "message": "Response processed.",
          "nextQuestion": { /* Next Question Object */ },
          "state": { /* Updated user state */ }
        }
        // If assessment for dimension is complete
        {
          "message": "Assessment for dimension ID 1 completed.",
          "nextQuestion": null,
          "finalTheta": 0, // Placeholder value
          "finalSegment": { /* Segment Object */ },
          "state": { /* Final user state */ }
        }
        ```

*   **`GET /state/:dimensionId`** (For Debugging/Testing)
    *   **Purpose**: Retrieves the current in-memory assessment state for the authenticated user and specified dimension.
    *   **Parameters**: `dimensionId` (integer, path parameter).
    *   **Response**: JSON object representing the user's state for that dimension.

### 4.3. Chat (`/api/chat`)

Handled by `src/routes/chatRoutes.js`. Currently contains placeholder routes.

## 5. Running the Server

1.  Ensure you have Node.js installed.
2.  Navigate to the `/home/ubuntu/traittune_backend` directory.
3.  Make sure the `.env` file is present in the `/home/ubuntu/traittune_backend` directory (it's referenced as `../../.env` from `src/index.js`, so it should be in the project root) and contains:
    ```env
    PORT=3001
    OPENAI_API_KEY=your_openai_api_key
    SUPABASE_JWT_SECRET=your_supabase_jwt_secret
    # NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are for frontend, not directly used by backend for JWT validation but good to have for context.
    ```
4.  Start the server:
    ```bash
    node src/index.js
    ```
    The server will run on the port specified in `.env` (default 3001).

## 6. Testing

*   **IRT Logic Validation**:
    *   A test script is available to validate core IRT logic functions.
    *   Run from the `src` directory: `node tests/validate_irt_logic.js`
    *   This script checks `calculate2PLProbability`, `getDichotomousResponse`, and `getSegmentForTheta` using predefined test cases.

This documentation provides the essential information to run, test, and understand the TraitTune backend. For further details, refer to the source code comments and structure.
