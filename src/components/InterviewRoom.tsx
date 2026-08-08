import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Award, RefreshCw, AlertCircle, ArrowRight, CheckCircle2, Sparkles, StopCircle, Play, Mic, Volume2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Candidate, InterviewSession, Message, ProctorStatus, InterviewResponse } from '../types';
import { CameraProctor } from './CameraProctor';
import { VoiceAssistantController } from './VoiceAssistantController';

interface InterviewRoomProps {
  candidate: Candidate;
  sessionId: string;
  onInterviewComplete: (session: InterviewSession) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  candidate,
  sessionId,
  onInterviewComplete,
  voiceEnabled,
  onToggleVoice,
}) => {
  const [session, setSession] = useState<InterviewSession>({
    sessionId,
    candidate,
    messages: [],
    turnCount: 0,
    status: 'active',
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  });

  const [candidateInput, setCandidateInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);

  const [proctorStatus, setProctorStatus] = useState<ProctorStatus>({
    cameraActive: true,
    faceDetected: true,
    lightingQuality: 'Good',
    attentionScore: 98,
    livenessVerified: true,
    alerts: [],
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, loading]);

  // Initialize interview on mount
  useEffect(() => {
    startInterviewSession();
  }, [sessionId, candidate.member.id]);

  const startInterviewSession = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          candidate,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP status ${res.status}`);
      }

      const data: InterviewResponse = await res.json();

      const initialMessage: Message = {
        id: `msg-${Date.now()}-init`,
        sender: 'interviewer',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        turnIndex: 0,
      };

      setSession(prev => ({
        ...prev,
        candidate,
        messages: [initialMessage],
        turnCount: 0,
        status: data.done ? 'completed' : 'active',
        feedback: data.feedback,
      }));

      if (data.done && data.feedback) {
        onInterviewComplete({
          ...session,
          status: 'completed',
          feedback: data.feedback,
          messages: [initialMessage],
        });
      }
    } catch (err: any) {
      console.error('Failed to initialize interview:', err);
      setErrorMsg('Failed to start interview session. Ensure API server is online.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || candidateInput;
    if (!text.trim() || loading) return;

    setCandidateInput('');
    setLoading(true);
    setErrorMsg(null);

    // Optimistically add candidate's message
    const candMsg: Message = {
      id: `msg-${Date.now()}-cand`,
      sender: 'candidate',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      turnIndex: session.turnCount,
    };

    const updatedMessages = [...session.messages, candMsg];
    setSession(prev => ({
      ...prev,
      messages: updatedMessages,
    }));

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error HTTP ${res.status}`);
      }

      const data: InterviewResponse = await res.json();

      const intMsg: Message = {
        id: `msg-${Date.now()}-int`,
        sender: 'interviewer',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        turnIndex: session.turnCount + 1,
      };

      const finalMessages = [...updatedMessages, intMsg];
      const updatedTurnCount = session.turnCount + 1;

      const newSession: InterviewSession = {
        ...session,
        messages: finalMessages,
        turnCount: updatedTurnCount,
        status: data.done ? 'completed' : 'active',
        feedback: data.feedback,
      };

      setSession(newSession);

      if (data.done && data.feedback) {
        onInterviewComplete(newSession);
      }
    } catch (err: any) {
      console.error('Error sending candidate message:', err);
      setErrorMsg('Failed to communicate with AI interviewer. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const speakMessageText = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (currentlySpeakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingMsgId(null);
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
    utterance.rate = 1.0;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentlySpeakingMsgId(msgId);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingMsgId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingMsgId(null);
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleForceEnd = async () => {
    setLoading(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          forceEnd: true,
        }),
      });

      const data: InterviewResponse = await res.json();

      const finalSession: InterviewSession = {
        ...session,
        status: 'completed',
        feedback: data.feedback,
      };
      setSession(finalSession);
      if (data.feedback) {
        onInterviewComplete(finalSession);
      }
    } catch (err) {
      console.error('Error concluding interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const latestInterviewerMsg = session.messages.filter(m => m.sender === 'interviewer').pop()?.text;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)]">
      
      {/* Left / Sidebar Column: Proctor Camera & Candidate Quick Reference */}
      <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-1">
        
        {/* Real Candidate Proctor Camera Widget */}
        <CameraProctor
          onStatusChange={setProctorStatus}
          interviewEnded={session.status === 'completed'}
        />

        {/* Voice Assistant Controller */}
        <VoiceAssistantController
          latestInterviewerMessage={latestInterviewerMsg}
          voiceEnabled={voiceEnabled}
          onToggleVoice={onToggleVoice}
          onTranscriptRecorded={(transcript) => {
            setCandidateInput(prev => (prev ? `${prev} ${transcript}` : transcript));
          }}
          isSpeaking={isSpeaking}
          setIsSpeaking={setIsSpeaking}
          interviewEnded={session.status === 'completed'}
        />

        {/* Candidate Profile Reference Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200">Candidate Info</span>
            <span className="text-[10px] text-indigo-400 font-mono">{candidate.member.id}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Name:</span>
              <span className="font-semibold text-white">{candidate.member.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Role:</span>
              <span className="font-semibold text-indigo-300">{candidate.member.jobRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Experience:</span>
              <span className="text-slate-200">{candidate.member.yearsExperience} yrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Education:</span>
              <span className="text-slate-200">{candidate.member.education}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium text-[11px]">Key Missions Passed:</span>
            <div className="flex flex-wrap gap-1">
              {candidate.missions.filter(m => m.passed).slice(0, 4).map(m => (
                <span key={m.day} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                  D{m.day}: {m.title.slice(0, 16)}...
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Main Chat Column */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
        
        {/* Chat Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white">AI Technical Interview Session</h3>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-500/30 font-medium">
                  Question {session.status === 'completed' ? 8 : Math.min(session.turnCount + 1, 8)} / 8
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Session ID: <span className="font-mono text-slate-300">{sessionId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleForceEnd}
            disabled={loading}
            className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>Wrap Up & Evaluate</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/40">
          <AnimatePresence initial={false}>
            {session.messages.map((msg) => {
              const isInterviewer = msg.sender === 'interviewer';
              const isMsgSpeaking = currentlySpeakingMsgId === msg.id;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${isInterviewer ? 'justify-start' : 'justify-end'}`}
                >
                  {isInterviewer && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                      isInterviewer
                        ? 'bg-slate-900 text-slate-100 border border-slate-800 shadow-md'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-700/40 text-[10px]">
                      <span className="font-semibold uppercase tracking-wider opacity-80">
                        {isInterviewer ? 'AI Interviewer' : candidate.member.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="opacity-60">{msg.timestamp}</span>
                        {isInterviewer && (
                          <button
                            onClick={() => speakMessageText(msg.id, msg.text)}
                            className={`p-1 rounded hover:bg-slate-800 text-slate-400 transition-colors ${
                              isMsgSpeaking ? 'text-indigo-400 animate-pulse' : ''
                            }`}
                            title="Listen / Replay question out loud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {!isInterviewer && (
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md font-bold text-xs">
                      {candidate.member.name[0]}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 text-xs text-indigo-400 bg-slate-900 p-3 rounded-xl border border-slate-800 w-max"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI Interviewer is evaluating accuracy & manner, and formulating next question...</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-500/30 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          
          {/* Answer Manner Guidance Banner */}
          <div className="flex items-center justify-between text-[11px] bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                <strong className="text-white font-semibold">Evaluation Tip:</strong> State factual technical choices clearly using the STAR method for top delivery manner scores.
              </span>
            </div>
          </div>

          {/* Form Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={candidateInput}
              onChange={(e) => setCandidateInput(e.target.value)}
              placeholder={`Type your response as ${candidate.member.name}...`}
              disabled={loading || session.status === 'completed'}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />

            <button
              type="submit"
              disabled={loading || !candidateInput.trim() || session.status === 'completed'}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Respond</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

