import React from 'react';
import { 
  ShieldCheck, Camera, Mic, AlertTriangle, Award, CheckCircle2, 
  Lock, Eye, VideoOff, FileCheck, Sparkles 
} from 'lucide-react';
import { motion } from 'motion/react';

export const InterviewRulesSection: React.FC = () => {
  const rules = [
    {
      id: 'camera-audio',
      number: '01',
      icon: <Camera className="w-5 h-5 text-indigo-400" />,
      title: 'Continuous Camera & Audio Feed',
      badge: 'Hardware Integrity',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'The candidate webcam and microphone must remain active during the entire 8-question technical evaluation. Turning off hardware prematurely will pause session progress.',
    },
    {
      id: 'mouth-obstruction',
      number: '02',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      title: 'No Mouth or Face Obstruction',
      badge: 'Strict Security Penalty',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      description: 'Candidates MUST NOT cover their mouth or lower face with hands, clothing, or masks. Obstructing the mouth triggers an immediate security alert and deducts -20% from the proctor score.',
    },
    {
      id: 'dual-evaluation',
      number: '03',
      icon: <Award className="w-5 h-5 text-purple-400" />,
      title: 'Dual-Dimension Answer Scoring',
      badge: 'Evaluation Protocol',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Answers are evaluated on BOTH Factual Correctness (technical accuracy of vector DBs, architecture) AND Delivery Manner (STAR structure, articulation, & executive confidence).',
    },
    {
      id: 'single-frame',
      number: '04',
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
      title: 'Single Face Frame & Attention',
      badge: 'Proctoring Rule',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Only the candidate may be visible in the webcam frame. Detection of multiple faces, gaze away from screen, or leaving frame will flag the session logs for reviewer inspection.',
    },
    {
      id: 'auto-shutdown',
      number: '05',
      icon: <VideoOff className="w-5 h-5 text-amber-400" />,
      title: 'Privacy Wrap-Up Hardware Shutdown',
      badge: 'Privacy Standard',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'When clicking "Wrap-Up & Evaluate" or finishing Question 8, the session ends immediately and webcam & microphone tracks are shut off instantly.',
    },
    {
      id: 'unassisted-answers',
      number: '06',
      icon: <FileCheck className="w-5 h-5 text-cyan-400" />,
      title: 'Authentic Candidate Responses',
      badge: 'Assessment Integrity',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Candidates are evaluated on authentic, unassisted technical responses. No external text prompts or suggested answer hints are provided during live turns.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official Security Standards
            </span>
            <span className="text-xs text-slate-400 font-mono">v2.4 Mandatory Guidelines</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Technical Interview Rules & Proctoring Protocols
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            All candidates entering the HireMind AI interview room are monitored under these automated proctoring standards to ensure assessment fairness and integrity.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
          <Lock className="w-5 h-5 text-indigo-400" />
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-200">Proctor Enforcement</span>
            <span className="block text-[10px] text-emerald-400 font-semibold">Real-Time Automated Rules</span>
          </div>
        </div>
      </div>

      {/* Grid of Rules */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {rules.map((rule) => (
          <motion.div 
            key={rule.id}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 p-4 rounded-xl transition-all duration-200 flex flex-col justify-between group cursor-default"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
                  {rule.icon}
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${rule.badgeColor}`}>
                  {rule.badge}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-mono font-normal">{rule.number}.</span>
                {rule.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {rule.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Active Rule
              </span>
              <span className="font-mono">Enforced</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Security Warning Callout Banner */}
      <div className="mt-6 bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-start sm:items-center space-x-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="text-white font-semibold">Important Candidate Notice:</strong> Covering your mouth during an active interview session will trigger an automatic <strong className="text-red-400 font-semibold">-20% score penalty</strong> and flag your submission for manual HR audit.
          </span>
        </div>
        <span className="bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-lg border border-amber-500/30 text-[11px] shrink-0 font-mono">
          Strict Rule 02
        </span>
      </div>

    </motion.div>
  );
};

