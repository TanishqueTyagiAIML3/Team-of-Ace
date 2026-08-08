import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Sparkles, Play, Pause } from 'lucide-react';

interface VoiceAssistantControllerProps {
  latestInterviewerMessage?: string;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onTranscriptRecorded?: (text: string) => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  interviewEnded?: boolean;
}

export const VoiceAssistantController: React.FC<VoiceAssistantControllerProps> = ({
  latestInterviewerMessage,
  voiceEnabled,
  onToggleVoice,
  onTranscriptRecorded,
  isSpeaking,
  setIsSpeaking,
  interviewEnded = false,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);

  // Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Load browser TTS voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        // Find a natural sounding English voice
        const preferred = available.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.lang.startsWith('en')) || available[0];
        if (preferred) setSelectedVoice(preferred);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Speak latest message when autoSpeak is on and voice is enabled
  useEffect(() => {
    if (!interviewEnded && latestInterviewerMessage && voiceEnabled && autoSpeak && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speakText(latestInterviewerMessage);
    }
  }, [latestInterviewerMessage, voiceEnabled, autoSpeak, interviewEnded]);

  // Clean up mic and voice when interview ends or component unmounts
  useEffect(() => {
    if (interviewEnded) {
      stopListening();
      stopSpeaking();
    }
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [interviewEnded]);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any active speech

    const cleanText = text.replace(/[*#]/g, ''); // Strip markdown syntax for natural voice
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Setup Web Speech API Recognition for candidate voice input
  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported natively in this browser window. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            onTranscriptRecorded?.(transcript);
            setInterimTranscript('');
          } else {
            current += transcript;
          }
        }
        setInterimTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${isSpeaking ? 'from-purple-500 to-indigo-600 animate-pulse' : 'from-slate-800 to-slate-700'}`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white">AI Real-Time Voice Assistant</h3>
            <p className="text-[10px] text-slate-400">Natural TTS Speech & Live Voice Input</p>
          </div>
        </div>

        <button
          onClick={onToggleVoice}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-all ${
            voiceEnabled
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      {/* Speaking Sound Waveform Visualizer */}
      {isSpeaking && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            <span className="text-xs text-indigo-200 font-medium">Interviewer Speaking...</span>
          </div>

          <div className="flex items-center space-x-1 h-5">
            <div className="w-1 bg-indigo-400 h-2 animate-bounce rounded-full"></div>
            <div className="w-1 bg-indigo-400 h-5 animate-bounce delay-100 rounded-full"></div>
            <div className="w-1 bg-indigo-400 h-3 animate-bounce delay-200 rounded-full"></div>
            <div className="w-1 bg-indigo-400 h-4 animate-bounce delay-150 rounded-full"></div>
            <div className="w-1 bg-indigo-400 h-2 animate-bounce rounded-full"></div>
          </div>

          <button
            onClick={stopSpeaking}
            className="text-xs text-slate-400 hover:text-white p-1 rounded bg-slate-800/80"
            title="Mute Speech"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice Controls & Mic Button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Voice selector dropdown */}
        {voices.length > 0 && (
          <div className="flex-1">
            <label className="text-[10px] text-slate-400 block mb-1">Voice Profile</label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const v = voices.find(v => v.name === e.target.value);
                if (v) setSelectedVoice(v);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name.slice(0, 24)} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Candidate Microphone Push-To-Talk Button */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Candidate Mic</label>
          <button
            onClick={toggleListening}
            disabled={interviewEnded}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              interviewEnded
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{interviewEnded ? 'Mic Disabled' : isListening ? 'Listening...' : 'Push to Talk'}</span>
          </button>
        </div>
      </div>

      {interviewEnded ? (
        <p className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center gap-1.5">
          <VolumeX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Session Ended - Microphone and Voice Synthesis are powered down.</span>
        </p>
      ) : interimTranscript ? (
        <p className="text-xs text-indigo-300 italic bg-slate-950 p-2 rounded-lg border border-indigo-500/20">
          "{interimTranscript}..."
        </p>
      ) : null}
    </div>
  );
};
