# AI-AAP Architecture & Flows

This document describes the overall architecture of the AI-AAP project and the main end-to-end flows between the frontend, Node backend, and Python model service.

---

## 1. High-Level Overview

AI-AAP is an AI-driven learning platform with three main services:

- **Frontend** – React (Vite) SPA that students interact with.
- **Backend** – Node.js/Express API that handles authentication, domain and custom-domain data, quiz session storage, and MongoDB access.
- **Model Service** – Python/FastAPI microservice that generates adaptive quizzes and AI-generated curricula using LLMs (Ollama or Groq).

All three services run independently and communicate over HTTP.

---

## 2. Components

### 2.1 Frontend (React + Vite)

**Location:** `frontend/`

**Key technologies:**
- React + React Router
- Tailwind CSS
- Vite bundler

**Entry points:**
- `src/main.jsx` – Bootstraps React and wraps the app in `BrowserRouter`.
- `src/App.jsx` – Defines client-side routes and top-level layout.

**Major responsibilities:**
- Render the public marketing pages and student dashboard.
- Drive quiz experiences (standard quiz, guest assessment) and show gamified feedback.
- Provide a UI for building AI-generated "custom domains" and saving them.
- Manage client-side authentication state (e.g., `localStorage.userData`).

**Key routes (App):**
- Public:
  - `/` – Landing page.
  - `/program-select/:domainId` – Program selection within a domain.
  - `/assessment/:programId` – Guest pre-assessment.
  - `/coding` – Coding playground.
  - `/quiz` – Standard quiz page.
  - `/quiz-insights` – Simple quiz insights view.
  - `/quiz-modals-demo` – Demo of quiz feedback modals.
  - `/auth/login`, `/auth/signup` – Auth UIs.
- Student (under a shared layout):
  - `/student/dashboard`, `/student/home`, `/student/roadmap`, `/student/workspace`, `/student/leaderboard`, `/student/certificates`, `/student/settings`.
  - `/student/custom-domain` – Custom domain builder.
  - `/student/custom-domain/:domainId` – Custom domain details.
  - `/student/domains/:domainId` – Subjects within a domain.

**Important screens/components:**
- `pages/QuizPage.jsx` – Main adaptive quiz flow for logged-in users.
- `pages/PreAssessment/GuestAssessment.jsx` – Short guest calibration quiz using the same quiz engine.
- `pages/student/CustomDomainBuilder.jsx` – AI-powered custom curriculum builder.
- `components/QuizModal.jsx`, `QuizFeedbackModals.jsx`, `QuizProgressSidebar.jsx`, `QuizInsightsSimple.jsx` – Quiz UI and feedback experience.
- `components/GameContext.jsx` – Provides game-like state (XP, progress) across the app.

---

### 2.2 Backend (Node.js + Express + MongoDB)

**Location:** `backend/`

**Key technologies:**
- Node.js + Express
- MongoDB via Mongoose
- Passport.js (Google OAuth2)
- express-session

**Entry point:**
- `index.js`

**Server setup (index.js):**
- Loads environment variables via `dotenv`.
- Connects to MongoDB with `connectDB()`.
- Configures CORS to allow local frontend origins (ports 3000, 3001, 5173).
- Enables JSON and URL-encoded body parsing.
- Sets up sessions via `express-session`.
- Configures Passport for Google OAuth and mounts auth/session middleware.
- Mounts API routers:
  - `/api/auth` – Google OAuth endpoints.
  - `/api/domains` – CRUD for predefined domains.
  - `/api/custom-domains` – CRUD for user-created custom domains.
  - `/api/online-users` – Online user tracking.
  - `/api/quiz-sessions` – Storage of completed quiz sessions.

**Main domains of responsibility:**

1. **Authentication (Google OAuth)**
   - Routes: `src/routes/passportAuth.js`
   - Controller: `src/controllers/passportAuthController.js`
   - Flow:
     - `GET /api/auth/google` – Redirects to Google OAuth.
     - `GET /api/auth/google/callback` – Handles Google callback, authenticates user using Passport.
     - On success, `googleCallback` sends an HTML page that uses `window.opener.postMessage` to send a small user payload (id, name, email, avatar) back to the SPA, then closes the popup.
     - `GET /api/auth/logout` – Logs out and redirects.

2. **Domains (Predefined learning domains)**
   - Routes: `src/routes/domainRoutes.js`
   - Controller: `src/controllers/domainController.js`
   - Model: `src/models/domainModel.js`
   - Purpose: Store and manage catalog of learning domains (title, icon, colors, programs, etc.).
   - Endpoints (under `/api/domains`):
     - `POST /create` – Create or upsert a single domain, or bulk create if the body is an array.
     - `GET /` – List all domains.
     - `GET /:id` – Fetch domain by `id`.
     - `PUT /:id` – Update domain by `id`.
     - `DELETE /:id` – Delete domain by `id`.

3. **Custom Domains (User-defined curricula)**
   - Routes: `src/routes/customDomainRoutes.js`
   - Controller: `src/controllers/customDomainController.js`
   - Model: `src/models/customDomainModel.js`
   - Purpose: Store and manage AI-generated custom domains tied to specific users.
   - Endpoints (under `/api/custom-domains`):
     - `POST /` – Create a new custom domain.
     - `GET /user/:userId` – List all custom domains for a user.
     - `GET /:id` – Fetch a specific custom domain by Mongo `_id`.
     - `PUT /:id` – Update a custom domain.
     - `DELETE /:id` – Delete a custom domain.

4. **Quiz Sessions (Analytics & persistence)**
   - Routes: `src/routes/quizSessionRoutes.js`
   - Controller: `src/controllers/quizSessionController.js`
   - Model: `src/models/quizSessionModel.js`
   - Purpose: Persist completed quiz sessions for later analysis and progress tracking.
   - Endpoint (under `/api/quiz-sessions`):
     - `POST /` – Saves a quiz session including:
       - `email` (optional, may be null)
       - `domainId` (optional)
       - `sessionId` (matches the model service session)
       - `payload` (raw quiz data/analytics from frontend)
       - `attemptedAt` timestamp

5. **Online Users & Other Services**
   - `src/routes/onlineUsers.js` and related models track currently active users.
   - `src/services/userService.js` encapsulates user-related logic.

---

### 2.3 Model Service (Python + FastAPI + LLMs)

**Location:** `model/`

**Key technologies:**
- FastAPI
- MongoDB integration
- LLM providers: Ollama and/or Groq

**Entry point:**
- `main.py`

**Server setup (main.py):**
- Creates a FastAPI app with CORS allowing all origins.
- Includes routers from `app/routes`:
  - `mcq` – MCQ-specific utilities.
  - `curriculum` – Curriculum generation endpoints.
  - `quiz` – Adaptive quiz generation.
  - `statistics` – Quiz statistics/endpoints.
  - `next_level` – Progression to next levels.
- Exposes `/health` for health checks.

#### 2.3.1 Quiz Generation (Adaptive Quiz Engine)

**Router:** `app/routes/quiz.py` (prefix `/quiz`)

**Core model:** `QuizRequest` (in `app/models.py`), containing:
- `domain_name`
- `program_name`
- `level`
- `session_id` (optional, reused across calls)
- `history` (list of previous question/answer interactions)

**Flow (simplified):**
1. **Request intake** (`POST /quiz`):
   - If `session_id` is missing, generate a new UUID.
   - Log configuration (which LLM provider, model, etc.).

2. **Prefetch cache check:**
   - If a prefetched question exists for this `session_id`, return it (after validation), otherwise generate a new one.

3. **Core generation** (`generate_quiz_core`):
   - Load persisted history from Mongo with `load_session_history(session_id)`.
   - Combine stored history with request `history`.
   - Auto-adjust difficulty using `auto_adjust_level` and level descriptions from `app/utils/quiz_logic.py`.
   - Build an LLM prompt using `QUIZ_PROMPT_TEMPLATE` from `app/prompts/quiz_prompt.py`.
   - Call LLM provider:
     - Groq (chat completions API), or
     - Ollama (local model with JSON output).
   - Clean the raw text into valid JSON using `clean_json_string`.
   - Parse JSON and validate against a strict schema:
     - Required fields: `question_id`, `question_text`, `options`, `correct_option_index`, `hint`, `explanation`.
     - Exactly 4 string options.
     - `correct_option_index` must be an integer 0–3 (with a hardening rule that remaps `-1` to `0`).
     - Non-empty strings for question, hint, explanation.
     - Optional `code_context` as string or null.
   - Clean option labels (strip "Option A:", "A.", etc.).
   - Check for exact and semantic repeats against history; reject duplicates.
   - Persist the question and correct answer to Mongo using `save_question`.

4. **Response transformation:**
   - Convert backend fields to frontend-friendly format using `transform_backend_to_frontend`:
     - `question_id` → `id`
     - `question_text` → `question`
     - `correct_option_index` → `correctIndex`
   - Return:
     - `status: "success"`
     - `session_id`
     - `attempts_used` (how many LLM retries were needed)
     - `data` object with `question`, `options`, `correctIndex`, `hint`, `code_context`, `explanation`.

5. **Background prefetch:**
   - After returning a question, spawn a background thread (`prefetch_next`) to generate the *next* question and store it in `PREFETCH_CACHE[session_id]` for faster subsequent responses.

#### 2.3.2 Curriculum Generation

**Router:** `app/routes/curriculum.py` (prefix `/curriculum`)

**Purpose:** Given a natural-language prompt describing what the learner wants to achieve, generate a structured curriculum consisting of:
- `main_topic`
- A list of `programs` with fields such as `title`, `description`, `difficulty`, `key_topics`, and ordering.

**Flow:**
- Endpoint such as `POST /curriculum/generate_curriculum` accepts `{ "prompt": "..." }`.
- Uses an LLM prompt template in `app/prompts/curriculum_prompt.py`.
- Produces a JSON response that the frontend converts into a set of courses for a new custom domain.

---

## 3. End-to-End Flows

### 3.1 Authentication Flow (Google OAuth)

1. User clicks "Sign in with Google" on the frontend.
2. Frontend opens `/api/auth/google` in a popup window.
3. Backend redirects to Google OAuth; upon success, Google redirects back to `/api/auth/google/callback`.
4. Passport authenticates the user and passes the user object to `googleCallback`.
5. `googleCallback` renders a small HTML page that:
   - Builds a sanitized payload (id, name, email, avatar).
   - Calls `window.opener.postMessage({ type: 'oauth', user: payload }, '*')`.
   - Closes the popup (or provides a button to close).
6. Frontend listens for the `postMessage` event, stores the user data in `localStorage.userData`, and updates UI/auth state.

### 3.2 Custom Domain Creation Flow

1. **User opens builder:**
   - Navigates to `/student/custom-domain`.
   - `CustomDomainBuilder` loads any existing `customDomains` from `localStorage`.

2. **User describes learning goal:**
   - Inputs a free-form prompt (e.g., "Learn Python for data analysis in 10 weeks").
   - Clicks "Generate"; the frontend calls:
     - `POST http://localhost:8000/curriculum/generate_curriculum` with `{ prompt }`.

3. **Model service generates curriculum:**
   - `curriculum` router builds an LLM prompt and gets structured JSON.
   - Response contains `main_topic` and `programs` with titles, difficulty, key topics, etc.

4. **Frontend maps to courses:**
   - `CustomDomainBuilder` maps `programs` into UI-friendly courses: adds icons, color, derived duration/modules, ratings, etc.
   - Displays cards representing each course.

5. **User saves custom domain:**
   - On "Save", frontend reads `userId` from `localStorage.userData`.
   - Serializes generated courses (removing React component references).
   - Sends `POST http://localhost:9000/api/custom-domains` with:
     - `userId`, `name` (main topic), `userPrompt`, `mainTopic`, `description`, `courses`, and styling fields.

6. **Backend persists domain:**
   - `createCustomDomain` validates required fields.
   - Creates a new `CustomDomain` document in Mongo.
   - Returns the saved document.

7. **Frontend updates local cache:**
   - Adds the saved domain (including Mongo `_id`) to `localStorage.customDomains`.
   - Allows navigation to `/student/custom-domain/:domainId` or `/student/domains/:domainId` for details.

### 3.3 Taking an Adaptive Quiz (Standard QuizPage)

1. **Route & parameters:**
   - User navigates to `/quiz` (with query or route params indicating `domainId`, `programId`, `level`).
   - `QuizPage` reads `domainId`, `programId`, `level` from `useParams()`.

2. **Identify user and domain name:**
   - Reads `localStorage.userData` to extract `userEmail` (if logged in).
   - Tries to resolve a friendly `domainName` via:
     - `GET http://localhost:9000/api/custom-domains/:domainId`.
     - If not found, falls back to using the `domainId` directly.

3. **Initialize questions:**
   - Pre-allocates 15 placeholder questions and corresponding `answers`.
   - Calls `fetchQuestion(null, [], 0)` to fetch the first real question.

4. **Frontend → Model service:**
   - Sends `POST http://localhost:8000/quiz` with payload:
     - `domain_name` (resolved name or id)
     - `program_name` (from route)
     - `level` (parsed int)
     - `session_id` (null for the first call)
     - `history` (empty list initially)

5. **Model service generates a question:**
   - `POST /quiz` triggers `generate_quiz_question`.
   - `generate_quiz_core` builds prompt, calls LLM, validates JSON, ensures no duplicates, and stores question in Mongo.
   - Returns:
     - `session_id` (new or existing)
     - `data` with `question`, `options`, `correctIndex`, etc.

6. **Frontend displays question:**
   - Replaces placeholder at index 0 with the real question.
   - Starts timing for the question.

7. **User answers:**
   - When a user selects an option, `handleAnswerSelect`:
     - Records the selected index in `answers`.
     - Computes correctness with `correctIndex`.
     - Calculates `timeTaken` from question start time.
     - Appends an entry to `questionTimings`.
     - Updates `history` (question text, user answer, correctness).
     - Updates streaks and correct/wrong counts.
     - Chooses an appropriate feedback modal (motivation, streak, encouragement, reassurance).

8. **Next question:**
   - When moving to the next question, `QuizPage` calls `fetchQuestion(sessionId, history, targetIndex)` again.
   - Because the model service prefetches, the next response may come from `PREFETCH_CACHE` for faster UX.

9. **Quiz completion and analytics:**
   - After 15 questions (or when the quiz ends), `QuizPage` builds an analytics object via `buildTimingPayload()`:
     - Includes per-question correctness, user answer index, `correctIndex`, `time_taken_seconds`, etc.
   - Optionally stored in `localStorage` for local insights.

10. **Persisting the quiz session (Frontend → Node backend):**
    - Frontend calls `POST http://localhost:9000/api/quiz-sessions` with:
      - `email` (from user data, if present)
      - `domainId`
      - `sessionId` (from model service)
      - `payload` (analytics JSON)
      - `attemptedAt` (timestamp)
    - `createQuizSession` in the Node backend creates a `quizSession` document in Mongo.

11. **Results display:**
    - `QuizPage` shows results (score, time, streaks) using quiz insights components.

### 3.4 Guest Pre-Assessment Flow

1. **Route & initialization:**
   - User navigates to `/assessment/:programId`.
   - `GuestAssessment` initializes a short assessment with `TOTAL_QUESTIONS = 5`.

2. **Question fetching:**
   - Calls `POST http://localhost:8000/quiz` with:
     - `domain_name` = `programId`
     - `program_name` = `programId`
     - `level` = 5 (fixed default)
     - `session_id`, `history` analogous to `QuizPage`.

3. **Answering and feedback:**
   - Tracks selected answers, correctness, streaks, and explanation text.
   - Shows feedback modals similar to the full quiz.

4. **Results:**
   - After 5 questions, shows a summary score (e.g., XP-style score) and can route the user into signup or a suggested learning path.
   - Typically does **not** persist full session analytics via the Node backend (lighter-weight calibration flow).

---

## 4. Data & Persistence

- **MongoDB:**
  - Backend (Node) manages collections for:
    - Users / auth providers.
    - Domains and programs.
    - Custom domains per user.
    - Quiz sessions.
    - Online users.
  - Model service (Python) stores quiz history (questions and correct answers) keyed by `session_id`.

- **LocalStorage (browser):**
  - `userData` – Persisted user session from OAuth (id, email, etc.).
  - `customDomains` – Cached list of user-created domains for quick client-side access.
  - Optional quiz analytics snapshots for in-browser insights.

---

## 5. Running the System (Summary)

- **Backend (Node):**
  - From `backend/`: `npm start` (or equivalent script).
- **Model service (Python):**
  - From `model/`: `python main.py` (or `uvicorn main:app --reload`).
- **Frontend (React):**
  - From `frontend/`: `npm run dev`.

Ensure environment variables (MongoDB URI, session secret, OAuth credentials, LLM API keys, etc.) are configured in each service's `.env` before running.
