now i tell you built an app which based on interview agent you can choose the information from the files that i give you also place the camera which detect that interview was real and ai voice assistant use for seamless real-time responses and an interactive feedback loop. At the end evaluate the interview
please evaluate the ans right or wrong not only ans the way of ans the ques also matter
the Live interview not work properly check it also add slide show in home page which interact user and make the app more user friendly
make the app name HireMind
when wrapup and evaluate click then make live interview end and mic and video be close
the session end but camera still working
close it when seesion end
make the security that if person hide his mouth also then it is panelty and overall score reduce all the interview rule need to be mention in home page
At the time of Live interview remove the suggestion of ans that ai give from the app. also remove api inspector and REST API Specification JSON Payload from app
now add animation to the website in each every page also convert the person report into pdf and create btn when person click on that a pdf was generated of his/her report and start download in web browser
check why the pdf is not downloading
can you brought animation when the page scrool then content come to up and seetle down on the positon where it is necessary also change
the cursor to some unique shape
the cursor of white color that come along hide it
Modify my `server.ts` file to ensure that every AI technical interview session generates completely unique, dynamic, and non-repetitive questions—even if the interview is restarted with the exact same candidate multiple times.
Please update the `generateInterviewerTurn` function and system prompt in `server.ts` with the following changes:
1. Dynamic Question Angles & Randomization:
   - Introduce dynamic temperature (e.g., between 0.75 and 0.85) to increase variation.
   - For each turn (Questions 1 to 8), randomly choose a different angle or scenario (e.g., alternate between deep-dive coding choices, real-world bug troubleshooting, system architecture edge cases, and behavioral trade-off scenarios) based on the candidate's profile.
2. Enforce Memory & History Awareness:
   - Make sure Gemini explicitly checks previous messages in `session.messages` to strictly avoid repeating questions or phrasing that was already asked in the current or previous session turns.
3. Candidate Specificity & Depth:
   - Tailor questions dynamically to the candidate's failed, skipped, or high-attempt missions from `formatCandidateContext`. If a candidate skipped a topic (e.g., Docker, Vector DBs, Guardrails), focus on probing that topic with fresh scenarios.
4. Keep Formatting & Response Strictness:
   - Ensure the output strictly remains the interviewer's speech text (2-3 concise sentences max) assessing the candidate's answer correctness and delivery manner before asking the next targeted question.
Please update `server.ts` cleanly while retaining the existing API endpoint parameters (`/api/interview`) and fallback logic intact.
The previous changes didn't solve the repetition issue because Gemini still follows a static 1-to-8 topic blueprint and resets memory when a new session starts. Please update `server.ts` with these 3 exact fixes:

1. Remove Static Sequential Blueprints from System Prompt:
   - In `generateInterviewerTurn`, replace the rigid "Question 1 to 8 target topics list" in the system prompt with a dynamic prompt approach.
   - Instead of hardcoding "Question 1 = Capstone, Question 2 = Vector DB", dynamically randomize the sequence of topics based on `chooseTurnScenario()`.
   - Explicitly instruct Gemini: "Do NOT use a standard opening template. Generate a completely unpredictable, distinct entry point and question framing every single time."

2. Add Anti-Repetition Seed / Randomization Anchor:
   - Inject a unique random session seed (e.g., `Math.random().toString(36).substring(7)` or a random timestamp angle) directly into the system prompt.
   - Tell Gemini: "Randomization Anchor ID: [SEED]. Use this anchor to vary your vocabulary, technical scenario choices, and line of questioning so it never matches previous runs."

3. Enforce Distinct Scenario Hooks per Turn:
   - Pass the output of `chooseTurnScenario()` explicitly into the content prompt sent to `ai.models.generateContent()`.
   - Example prompt structure:
     `Candidate: ${candidate.member.name}`
     `Selected Focus Area: ${randomScenario}`
     `Turn: ${turnCount + 1}/8`
     `Constraint: Formulate a fresh technical scenario question in 2-3 sentences. Do NOT reuse common interview cliches or standard intro phrasing.`
Please apply these updates directly to `generateInterviewerTurn` in `server.ts` while keeping the API interfaces intact.
The issue is that the code silently catches Gemini API errors and falls back to the hardcoded `fallbackReplies` array in `server.ts`, which makes every interview repeat the exact same static questions.

Please update `server.ts` with these 2 critical fixes:

1. Debug & Fix Gemini API Failures:
   - In `generateInterviewerTurn`, log the explicit error inside the `catch` block using `console.error("Gemini API Error Detail:", err)`.
   - Remove or update the static `fallbackReplies` array so that if Gemini fails or fallback is triggered, it logs a clear server warning: `[FALLBACK TRIGGERED]`.

2. Ensure Dynamic API Client Initialization:
   - Inside `getGenAI()`, ensure `process.env.GEMINI_API_KEY` is always fetched fresh and valid.
   - Verify model name is valid (`gemini-2.5-flash` or `gemini-1.5-flash`). Note: If the code is using an invalid model string like `gemini-3.6-flash`, replace it with `gemini-2.5-flash` or `gemini-1.5-flash`.

3. Unique Session ID in Frontend / Request:
   - Ensure `sessionId` in `/api/interview` is generated as `sess-${Date.now()}-${Math.random().toString(36).substring(7)}` so every single interview click creates a completely isolated new session object in backend memory.

Please apply these updates now so we can see if the API call is failing or hitting fallback.
The issue is that `gemini-2.5-flash` is an invalid model name, which causes Gemini API calls to throw a 404 error and default to fallback.

Please update `server.ts`:
1. Change the model string in both `ai.models.generateContent` calls from `gemini-2.5-flash` to `gemini-1.5-flash` (or `gemini-2.0-flash`).
2. Make sure the `@google/genai` SDK call syntax is supported by the installed package version.

Keep everything else intact.
The `@google/genai` SDK is failing with a 404 Error because `gemini-1.5-flash` is not supported on the v1beta endpoint with this SDK version.

Please update `server.ts`:
1. In both `ai.models.generateContent` calls (in `generateInterviewerTurn` and `generateEvaluation`), change the model string to `'gemini-2.5-flash'`.
2. Make sure the model parameter is passed simply as `'gemini-2.5-flash'`.
Keep all existing prompt structures, dynamic randomization, and fallback handlers intact.
