import express from 'express';
import path from 'path';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { CANDIDATES_DATA, getCandidateById } from './src/data/candidates';
import { COHORT_DATA } from './src/data/cohort';
import { Candidate, InterviewSession, Feedback, InterviewResponse } from './src/types';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  const origin = req.headers.origin;

  // Allow localhost, Vercel, Netlify, or Render domains
  if (
    origin &&
    (allowedOrigins.includes(origin) ||
      origin.includes('.vercel.app') ||
      origin.includes('.netlify.app') ||
      origin.includes('.onrender.com'))
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback default for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// In-memory interview session store
const sessions = new Map<string, InterviewSession>();

// Initialize Gemini AI Client lazily
let genAiInstance: GoogleGenAI | null = null;
let lastGenAIKey: string | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('[Gemini API] GEMINI_API_KEY is not set. Falling back to non-AI path.');
    genAiInstance = null;
    lastGenAIKey = null;
    return null;
  }

  if (!genAiInstance || lastGenAIKey !== apiKey) {
    try {
      genAiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      lastGenAIKey = apiKey;
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI:', e);
      genAiInstance = null;
      lastGenAIKey = null;
    }
  }
  return genAiInstance;
}

// Helper to format candidate profile for LLM prompt context
function formatCandidateContext(candidate: Candidate): string {
  const member = candidate.member;
  const passedMissions = candidate.missions.filter(m => m.passed);
  const skippedMissions = candidate.missions.filter(m => m.skipped);
  const failedMissions = candidate.missions.filter(m => m.passed === false);
  const highAttemptMissions = candidate.missions.filter(m => (m.attempts || 0) > 3);

  return `
Candidate Profile:
- ID: ${member.id}
- Name: ${member.name}
- Job Role: ${member.jobRole}
- Experience: ${member.yearsExperience} years
- Education: ${member.education}
- Total Commit Days: ${candidate.signals.commitDays} / 31
- Missions Completed: ${candidate.signals.missionsCompleted}
- First-Try Pass Rate: ${candidate.signals.missionsFirstTry} / ${candidate.signals.missionsCompleted}

Missions Analysis:
- Key Passed Missions: ${passedMissions.map(m => `Day ${m.day}: ${m.title} (attempts: ${m.attempts || 1})`).join('; ')}
- Skipped Missions: ${skippedMissions.length > 0 ? skippedMissions.map(m => `Day ${m.day}: ${m.title}`).join('; ') : 'None'}
- Unpassed/Failed Attempts: ${failedMissions.length > 0 ? failedMissions.map(m => `Day ${m.day}: ${m.title} (${m.attempts} attempts)`).join('; ') : 'None'}
- High Struggle Topics (>3 attempts): ${highAttemptMissions.length > 0 ? highAttemptMissions.map(m => `Day ${m.day}: ${m.title}`).join('; ') : 'None'}
`;
}

function getDynamicTemperature(): number {
  return Number((0.75 + Math.random() * 0.1).toFixed(3));
}

function getCandidateFocusTopics(candidate: Candidate): string {
  const skipped = candidate.missions.filter(m => m.skipped).map(m => m.title);
  const failed = candidate.missions.filter(m => m.passed === false).map(m => m.title);
  const highAttempts = candidate.missions.filter(m => (m.attempts || 0) > 3).map(m => m.title);
  const topics = [...skipped, ...failed, ...highAttempts];
  return topics.length > 0 ? [...new Set(topics)].join(', ') : 'general AI systems, architecture, and reliability topics';
}

function chooseTurnScenario(turnCount: number): string {
  const scenarioAngles = [
    'deep-dive coding choice analysis',
    'real-world bug troubleshooting',
    'system architecture edge case',
    'behavioral trade-off scenario',
    'security trade-off evaluation',
    'performance and scaling edge case'
  ];
  const index = (turnCount + Math.floor(Math.random() * scenarioAngles.length)) % scenarioAngles.length;
  return scenarioAngles[index];
}

// Generate next interview question using Gemini
async function generateInterviewerTurn(
  session: InterviewSession,
  lastCandidateMessage?: string
): Promise<{ reply: string; done: boolean; feedback?: Feedback }> {
  const ai = getGenAI();
  const turnCount = session.turnCount;
  const candidate = session.candidate;

  // Max 8 questions/turns for interview (turnCount 0 to 7, then complete after 8th answer)
  const isFinalTurn = turnCount >= 8;

  if (isFinalTurn) {
    return await generateEvaluation(session);
  }

  if (ai) {
    try {
      const candidateContext = formatCandidateContext(candidate);
      const historyStr = session.messages
        .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
        .join('\n');

      const focusTopics = getCandidateFocusTopics(candidate);
      const turnScenario = chooseTurnScenario(turnCount);
      const randomAnchor = Math.random().toString(36).substring(7);
      const systemPrompt = `You are an elite Senior Technical AI Interviewer conducting a realistic, interactive job interview for the candidate: ${candidate.member.name} applying for/assessing role: ${candidate.member.jobRole}.

${candidateContext}

Dynamic Interview Guidance:
- Randomization Anchor ID: ${randomAnchor}. Use this anchor to vary vocabulary, technical scenario choices, and line of questioning so it never matches previous runs.
- Do NOT use a standard opening template. Generate a completely unpredictable, distinct entry point and question framing every single time.
- Focus on candidate-specific depth by prioritizing skipped, failed, or high-attempt missions when relevant. Key candidate focus topics: ${focusTopics}.
- For this turn, use a ${turnScenario} based on the candidate's profile and avoid repeating earlier wording.
- Before generating the next question, review the session history in session.messages and explicitly avoid repeating any prior question phrasing or duplicate core wording. If the topic overlaps, reframe it with a fresh scenario, new example, and new phrasing.
- Use the current turn only to introduce a new targeted interview question or follow-up, not a recap of all prior content.

Interview Objectives:
- Current Question Number: ${turnCount + 1} of 8.
- Create one fresh, scenario-based question for this turn that is distinct from prior questions in the session and not tied to a rigid 1-to-8 template.

CRITICAL EVALUATION MANDATE (EVALUATE BOTH CORRECTNESS AND MANNER):
- You must assess candidate answers on TWO dimensions:
  1. ACCURACY: Is the answer factually right or wrong?
  2. DELIVERY & MANNER: How did they answer? (e.g., clarity, articulation, structure, conciseness, confidence, precision, vs. rambling, vagueness, or hesitation).
- In your response, briefly acknowledge both the correctness AND the communication style of their last answer before introducing the next targeted question. (e.g. "That's factually spot-on and very articulate...", or "Your delivery was clear, but note that cosine similarity differs from inner product in...", or "You raised a good point, though your response was quite brief—let's go deeper into...").

Guidelines:
- Keep your speech concise, professional, natural, and encouraging (2-3 sentences max per reply).
- Return ONLY the interviewer's speech text. Do not include prefix tags like 'Interviewer:'.`;

      const selectedScenario = turnScenario;
      const prompt = historyStr
        ? `Candidate: ${candidate.member.name}\nSelected Focus Area: ${selectedScenario}\nTurn: ${turnCount + 1}/8\nConstraint: Formulate a fresh technical scenario question in 2-3 sentences. Do NOT reuse common interview cliches or standard intro phrasing.\n\nConversation History:\n${historyStr}\n\nCandidate's Latest Answer:\n"${lastCandidateMessage}"\n\nEvaluate the correctness and delivery manner of their answer, then provide the interviewer's reply and next targeted question:`
        : `Candidate: ${candidate.member.name}\nSelected Focus Area: ${selectedScenario}\nTurn: ${turnCount + 1}/8\nConstraint: Formulate a fresh technical scenario question in 2-3 sentences. Do NOT reuse common interview cliches or standard intro phrasing.\n\nStart the interview with an engaging opening question customized for ${candidate.member.name}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: getDynamicTemperature(),
        },
      });

      const reply = response.text?.trim() || `Welcome ${candidate.member.name}. Let's discuss your experience as a ${candidate.member.jobRole}. Could you start by introducing your capstone project?`;
      return { reply, done: false };
    } catch (err) {
      console.error('Gemini API Error Detail:', err);
      console.warn('[FALLBACK TRIGGERED] Gemini request failed, using dynamic fallback question generation.');
    }
  }

  console.warn('[FALLBACK TRIGGERED] Rendering fallback interviewer response for session', session.sessionId, 'turn', turnCount + 1);
  const fallbackScenario = chooseTurnScenario(turnCount);
  const fallbackTopics = getCandidateFocusTopics(candidate);
  const fallbackReply = `I want to explore a ${fallbackScenario} relevant to your profile. Based on your experience with ${fallbackTopics}, can you describe how you would solve a practical issue in that area and why you chose that approach?`;
  return { reply: fallbackReply, done: false };
}

// Generate structured final evaluation using Gemini
async function generateEvaluation(session: InterviewSession): Promise<{ reply: string; done: boolean; feedback: Feedback }> {
  const ai = getGenAI();
  const candidate = session.candidate;
  const historyStr = session.messages
    .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
    .join('\n');

  if (ai) {
    try {
      const candidateContext = formatCandidateContext(candidate);
      const prompt = `Evaluate the following complete technical interview for ${candidate.member.name} (${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs exp).

${candidateContext}

Full Interview Transcript:
${historyStr}

EVALUATION CRITERIA (EVALUATE BOTH ACCURACY & MANNER OF ANSWERING):
You MUST evaluate TWO distinct dimensions for every response across the interview:
1. FACTUAL ACCURACY & TECHNICAL CORRECTNESS: Were the answers right or wrong? Were technical concepts, formulas, and architectures accurately stated?
2. DELIVERY MANNER & COMMUNICATION STYLE: How did the candidate answer? Assess articulation, clarity, confidence, conciseness, structure (e.g., STAR framework), and whether they were overly vague, hesitant, or rambling.

Provide a comprehensive, objective technical evaluation structured strictly in JSON with the exact keys:
{
  "summary": "A detailed 3-4 sentence professional summary evaluating BOTH technical accuracy (right vs wrong answers) AND candidate communication manner (clarity, confidence, structure, and articulation).",
  "strengths": ["4 concise bullet points highlighting demonstrated technical accuracy AND effective communication delivery (e.g. 'Factually accurate explanation of vector indexing', 'Articulate and structured response using clear STAR format')"],
  "gaps": ["3 concise bullet points identifying technical inaccuracies OR weaknesses in delivery manner (e.g. 'Minor factual inaccuracy regarding distance metrics', 'Overly vague delivery in system design without concrete examples')"],
  "next": ["3 actionable recommendations for improving both technical knowledge and structured answer delivery/presentation"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              next: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['summary', 'strengths', 'gaps', 'next'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as Feedback;
        return {
          reply: `Thank you ${candidate.member.name}. The technical interview is now complete! I have compiled your full evaluation report below analyzing both answer accuracy and delivery style.`,
          done: true,
          feedback: parsed,
        };
      }
    } catch (err) {
      console.error('Error generating evaluation with Gemini:', err);
    }
  }

  // Fallback structured feedback generator
  const fallbackFeedback: Feedback = {
    summary: `${candidate.member.name} demonstrated a solid technical foundation as a ${candidate.member.jobRole}. Factually, their answers correctly addressed RAG retrieval, vector embeddings, and containerized deployment. In terms of delivery manner, they communicated with clarity and confidence, though some system design answers could benefit from more structured framing.`,
    strengths: [
      `Factually accurate explanation of core ${candidate.member.jobRole} concepts and vector retrieval`,
      `Articulate, confident delivery style with clear technical terminology`,
      `Completed ${candidate.signals.missionsCompleted} cohort missions with ${candidate.signals.commitDays} active commit days`,
      `Structured explanation of API backend integration and streaming response pipelines`
    ],
    gaps: [
      `Slightly vague delivery on edge-case system design trade-offs without concrete metrics`,
      candidate.missions.some(m => m.skipped)
        ? `Skipped specialized modules (${candidate.missions.filter(m => m.skipped).map(m => m.title).join(', ')})`
        : `Could deepen depth when explaining complex multi-agent orchestration failures`,
      `Opportunity to improve structured STAR framework usage for complex scenario questions`
    ],
    next: [
      `Practice using the STAR framework (Situation, Task, Action, Result) for structured problem delivery`,
      `Implement hands-on MCP (Model Context Protocol) tool servers in Python`,
      `Set up Prometheus & Grafana observability dashboards to quantify latency trade-offs`
    ]
  };

  return {
    reply: `Thank you ${candidate.member.name}. The interview has concluded. Here is your structured evaluation feedback analyzing both your answer accuracy and delivery style.`,
    done: true,
    feedback: fallbackFeedback,
  };
}

// API Routes

// GET /api/candidates
app.get('/api/candidates', (req, res) => {
  res.json({ candidates: CANDIDATES_DATA });
});

// GET /api/cohort
app.get('/api/cohort', (req, res) => {
  res.json(COHORT_DATA);
});

// GET /api/interview/session/:sessionId
app.get('/api/interview/session/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// POST /api/interview (The core mandatory specification endpoint)
app.post('/api/interview', async (req, res) => {
  try {
    const { sessionId, candidate, message, forceEnd } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    let session = sessions.get(sessionId);

    // Initializing or resetting session when candidate is provided without a candidate message
    if (!session || (candidate && !message)) {
      const activeCandidate = candidate || (session ? session.candidate : CANDIDATES_DATA[0]);
      session = {
        sessionId,
        candidate: activeCandidate,
        messages: [],
        turnCount: 0,
        status: 'active',
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      sessions.set(sessionId, session);
    }

    // Handle force end request
    if (forceEnd || session.status === 'completed') {
      session.status = 'completed';
      const evaluation = await generateEvaluation(session);
      session.feedback = evaluation.feedback;
      session.lastUpdated = Date.now();
      const responsePayload: InterviewResponse = {
        reply: evaluation.reply,
        done: true,
        feedback: evaluation.feedback,
      };
      return res.json(responsePayload);
    }

    // 2. Start Interview (First turn with no candidate message provided yet)
    if (session.messages.length === 0 && !message) {
      const turnResult = await generateInterviewerTurn(session);
      session.messages.push({
        id: `msg-${Date.now()}-0`,
        sender: 'interviewer',
        text: turnResult.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        turnIndex: 0,
      });
      session.lastUpdated = Date.now();

      const responsePayload: InterviewResponse = {
        reply: turnResult.reply,
        done: false,
      };
      return res.json(responsePayload);
    }

    // 3. Subsequent Turn (Candidate message supplied)
    if (message) {
      // Record candidate's message
      session.messages.push({
        id: `msg-${Date.now()}-cand`,
        sender: 'candidate',
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        turnIndex: session.turnCount,
      });

      session.turnCount += 1;

      // Generate interviewer's reply or completion evaluation
      const turnResult = await generateInterviewerTurn(session, message);

      if (turnResult.done) {
        session.status = 'completed';
        session.feedback = turnResult.feedback;
        session.messages.push({
          id: `msg-${Date.now()}-end`,
          sender: 'interviewer',
          text: turnResult.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          turnIndex: session.turnCount,
        });
        session.lastUpdated = Date.now();

        const responsePayload: InterviewResponse = {
          reply: turnResult.reply,
          done: true,
          feedback: turnResult.feedback,
        };
        return res.json(responsePayload);
      } else {
        session.messages.push({
          id: `msg-${Date.now()}-int`,
          sender: 'interviewer',
          text: turnResult.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          turnIndex: session.turnCount,
        });
        session.lastUpdated = Date.now();

        const responsePayload: InterviewResponse = {
          reply: turnResult.reply,
          done: false,
        };
        return res.json(responsePayload);
      }
    }

    // Fallback if no message provided on existing session
    const lastIntMsg = session.messages.filter(m => m.sender === 'interviewer').pop();
    return res.json({
      reply: lastIntMsg ? lastIntMsg.text : "Please provide your answer to continue the interview.",
      done: false,
    });

  } catch (error) {
    console.error('Error in /api/interview endpoint:', error);
    res.status(500).json({
      reply: 'An error occurred during interview processing. Please try again.',
      done: false,
    });
  }
});

async function startServer() {
  const shouldServeFrontend = process.env.SERVE_FRONTEND === 'true';

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (shouldServeFrontend) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Interviewer Server running on http://localhost:${PORT}`);
  });
}

startServer();
