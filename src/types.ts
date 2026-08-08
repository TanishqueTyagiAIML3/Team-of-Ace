export interface Member {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface Mission {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

export interface Signals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  member: Member;
  missions: Mission[];
  signals: Signals;
}

export interface CohortModule {
  n: number;
  title: string;
  days: number[];
}

export interface CohortDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface CohortData {
  cohort: string;
  modules: CohortModule[];
  days: CohortDay[];
}

export interface Feedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: Feedback;
}

export interface Message {
  id: string;
  sender: 'interviewer' | 'candidate' | 'system';
  text: string;
  timestamp: string;
  turnIndex?: number;
}

export interface InterviewSession {
  sessionId: string;
  candidate: Candidate;
  messages: Message[];
  turnCount: number;
  status: 'active' | 'completed';
  feedback?: Feedback;
  createdAt: number;
  lastUpdated: number;
}

export interface ProctorStatus {
  cameraActive: boolean;
  faceDetected: boolean;
  lightingQuality: 'Good' | 'Fair' | 'Poor';
  attentionScore: number; // 0 - 100
  livenessVerified: boolean;
  alerts: string[];
}
