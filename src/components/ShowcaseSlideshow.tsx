import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Sparkles, Bot, Award, 
  Camera, Mic, Terminal, ArrowRight, CheckCircle2, ShieldCheck, Flame, Cpu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShowcaseSlideshowProps {
  onStartInterviewWithTopCandidate: () => void;
}

export const ShowcaseSlideshow: React.FC<ShowcaseSlideshowProps> = ({
  onStartInterviewWithTopCandidate,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [
    {
      id: 'ai-interviewer',
      badge: 'Interactive AI Feature',
      title: 'AI Technical Interviewer',
      subtitle: 'Conduct automated 8-question technical interviews customized to each candidate\'s cohort performance.',
      gradient: 'from-indigo-900/60 via-slate-900 to-indigo-950/80',
      borderColor: 'border-indigo-500/30',
      icon: <Bot className="w-6 h-6 text-indigo-400" />,
      features: [
        'Customized 8-question role-specific technical question flow',
        'Evaluates Capstone architecture, Vector DBs, & Multi-Agent systems',
        'Generates instant executive evaluation report upon session wrap-up',
      ],
      ctaText: 'Start Live AI Interview',
      ctaAction: onStartInterviewWithTopCandidate,
      tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'dual-eval',
      badge: 'Evaluation Engine',
      title: 'Dual-Dimension Answer Evaluation',
      subtitle: 'We evaluate candidate answers on both Factual Accuracy (Right/Wrong) AND Communication Delivery Style.',
      gradient: 'from-purple-900/60 via-slate-900 to-slate-950',
      borderColor: 'border-purple-500/30',
      icon: <Award className="w-6 h-6 text-purple-400" />,
      features: [
        'Factual Correctness: Verifies technical algorithms & code precision',
        'Delivery Manner: Assesses STAR framework structure, clarity, & confidence',
        'Identifies candidate strengths, technical gaps, & actionable next steps',
      ],
      ctaText: 'Explore Candidate Pool',
      ctaAction: () => {
        const el = document.getElementById('candidate-pool-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'camera-proctor',
      badge: 'Proctoring & Security',
      title: 'Live Camera Proctoring & Attention Tracking',
      subtitle: 'Real-time candidate camera monitoring with face detection, liveness verification, and attention scores.',
      gradient: 'from-emerald-900/60 via-slate-900 to-slate-950',
      borderColor: 'border-emerald-500/30',
      icon: <Camera className="w-6 h-6 text-emerald-400" />,
      features: [
        'Webcam feed analysis with attention score tracking (0-100%)',
        'Lighting quality check & multiple face detection warnings',
        'Hardware-level liveness verification for assessment integrity',
      ],
      ctaText: 'Launch Live Proctoring Test',
      ctaAction: onStartInterviewWithTopCandidate,
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'voice-assistant',
      badge: 'Hands-Free Interaction',
      title: 'Real-Time Voice Speech-to-Text & Speech Synthesis',
      subtitle: 'Perform oral technical interviews with full Speech Recognition & natural AI voice question read-aloud.',
      gradient: 'from-amber-900/60 via-slate-900 to-slate-950',
      borderColor: 'border-amber-500/30',
      icon: <Mic className="w-6 h-6 text-amber-400" />,
      features: [
        'Live speech transcription converting audio responses to text',
        'Browser SpeechSynthesis voicing interviewer questions naturally',
        'Hands-free candidate microphone control with status indicators',
      ],
      ctaText: 'Test Voice Assistant',
      ctaAction: onStartInterviewWithTopCandidate,
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'cohort-analytics',
      badge: 'Candidate Analytics',
      title: 'Cohort & Capstone Performance Benchmarking',
      subtitle: 'In-depth analysis of candidate capstone projects, coding missions, and technical skill distributions.',
      gradient: 'from-cyan-900/60 via-slate-900 to-slate-950',
      borderColor: 'border-cyan-500/30',
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      features: [
        'Detailed candidate profile cards with Capstone architecture highlights',
        'Mission completion rates, score distributions, and skill radar tags',
        'Seamless candidate switching and instant interview initialization',
      ],
      ctaText: 'View Candidate Cohort',
      ctaAction: () => {
        const el = document.getElementById('candidate-pool-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
      tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
  ];

  // Auto-advance slideshow every 5 seconds if playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden group">
      
      {/* Background Gradient & Animated Glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-all duration-700 pointer-events-none opacity-90`} />
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Slide Card Layout */}
      <div className="relative z-10 p-6 sm:p-8 min-h-[280px] flex flex-col justify-between">
        
        {/* Top Header of Slide */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${slide.tagColor} flex items-center gap-1.5`}>
              <Sparkles className="w-3.5 h-3.5" />
              {slide.badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Slide {currentSlide + 1} / {slides.length}
            </span>
          </div>

          {/* Controls: Play/Pause and Next/Prev */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isPlaying ? 'Pause auto-play' : 'Play auto-play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Content Grid with Motion Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-2"
          >
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-md">
                  {slide.icon}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {slide.title}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {slide.subtitle}
              </p>

              {/* Feature Bullets */}
              <ul className="space-y-1.5 pt-1">
                {slide.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive CTA Card */}
            <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/90 w-full space-y-3 shadow-xl">
                <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold block">
                  Quick Interactive Action
                </span>
                <p className="text-xs text-slate-400">
                  Experience this feature live in the application now:
                </p>
                <button
                  onClick={slide.ctaAction}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicator Bar & Dots */}
        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === idx
                    ? 'w-8 bg-indigo-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Platform Walkthrough</span>
          </div>
        </div>

      </div>

    </div>
  );
};
