import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CANDIDATES_DATA } from './data/candidates';
import { COHORT_DATA } from './data/cohort';
import { Candidate, CohortData, InterviewSession, ProctorStatus } from './types';
import { Navbar } from './components/Navbar';
import { CandidateSelector } from './components/CandidateSelector';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { InterviewRoom } from './components/InterviewRoom';
import { EvaluationReport } from './components/EvaluationReport';
import { CustomCursor } from './components/CustomCursor';

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES_DATA);
  const [cohort, setCohort] = useState<CohortData>(COHORT_DATA);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate>(CANDIDATES_DATA[0]);
  const [activeTab, setActiveTab] = useState<'candidates' | 'interview' | 'evaluation'>('candidates');

  // Fetch candidates and cohort data from backend API
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [candidatesRes, cohortRes] = await Promise.all([
          fetch('/api/candidates'),
          fetch('/api/cohort'),
        ]);

        if (candidatesRes.ok) {
          const data = await candidatesRes.json();
          if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
            setCandidates(data.candidates);
            setSelectedCandidate(data.candidates[0]);
          }
        }

        if (cohortRes.ok) {
          const cohortJson = await cohortRes.json();
          if (cohortJson && cohortJson.cohort) {
            setCohort(cohortJson);
          }
        }
      } catch (err) {
        console.warn('Backend API connection fallback used:', err);
      }
    }

    loadBackendData();
  }, []);

  // Active Session State
  const [sessionId, setSessionId] = useState<string>(`sess-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  const [completedSession, setCompletedSession] = useState<InterviewSession | null>(null);

  // Modals & Voice Settings
  const [inspectCandidate, setInspectCandidate] = useState<Candidate | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  const [proctorStatus, setProctorStatus] = useState<ProctorStatus>({
    cameraActive: true,
    faceDetected: true,
    lightingQuality: 'Good',
    attentionScore: 98,
    livenessVerified: true,
    alerts: [],
  });

  const handleStartInterview = (candidateToInterview: Candidate) => {
    setSelectedCandidate(candidateToInterview);
    const newSessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    setSessionId(newSessionId);
    setCompletedSession(null);
    setActiveTab('interview');
  };

  const handleInterviewComplete = (finishedSession: InterviewSession) => {
    setCompletedSession(finishedSession);
    setActiveTab('evaluation');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Custom Glowing Pointer & Follower Ring Cursor */}
      <CustomCursor />
      
      {/* Top Header Navbar */}
      <Navbar
        currentCandidate={selectedCandidate}
        proctorStatus={proctorStatus}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        onOpenCandidateSelector={() => setActiveTab('candidates')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content View Container with Page Transition Animation */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'candidates' && (
            <motion.div
              key="tab-candidates"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <CandidateSelector
                candidates={candidates}
                cohort={cohort}
                selectedCandidate={selectedCandidate}
                onSelectCandidate={setSelectedCandidate}
                onInspectCandidate={(c) => setInspectCandidate(c)}
                onStartInterview={handleStartInterview}
              />
            </motion.div>
          )}

          {activeTab === 'interview' && (
            <motion.div
              key="tab-interview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <InterviewRoom
                candidate={selectedCandidate}
                sessionId={sessionId}
                onInterviewComplete={handleInterviewComplete}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              />
            </motion.div>
          )}

          {activeTab === 'evaluation' && (
            <motion.div
              key="tab-evaluation"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {completedSession ? (
                <EvaluationReport
                  session={completedSession}
                  onRestartInterview={() => handleStartInterview(selectedCandidate)}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl mx-auto p-8"
                >
                  <h3 className="text-lg font-bold text-white mb-2">No Active Evaluation Report</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Start an interview session with candidate <span className="text-indigo-400 font-semibold">{selectedCandidate.member.name}</span> to generate live feedback.
                  </p>
                  <button
                    onClick={() => handleStartInterview(selectedCandidate)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    Launch Interview with {selectedCandidate.member.name.split(' ')[0]}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Candidate Profile Inspector Modal */}
      <AnimatePresence>
        {inspectCandidate && (
          <CandidateProfileModal
            candidate={inspectCandidate}
            cohort={cohort}
            onClose={() => setInspectCandidate(null)}
            onStartInterview={handleStartInterview}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

