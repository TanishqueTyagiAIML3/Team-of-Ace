import React from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, Award, Calendar, BookOpen, User, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Candidate, CohortData } from '../types';

interface CandidateProfileModalProps {
  candidate: Candidate;
  cohort: CohortData;
  onClose: () => void;
  onStartInterview: (candidate: Candidate) => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  candidate,
  cohort,
  onClose,
  onStartInterview,
}) => {
  const member = candidate.member;
  const firstTryRate = Math.round((candidate.signals.missionsFirstTry / candidate.signals.missionsCompleted) * 100) || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8 text-slate-200"
      >
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-4 mb-6 pr-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shrink-0">
            {member.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{member.id}</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {member.status}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{member.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
              <span className="flex items-center gap-1 text-indigo-400 font-medium">
                <Briefcase className="w-3.5 h-3.5" />
                {member.jobRole} ({member.yearsExperience} yrs exp)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <GraduationCap className="w-3.5 h-3.5" />
                {member.education}
              </span>
            </div>
          </div>
        </div>

        {/* Signal Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Commit Days</span>
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">{candidate.signals.commitDays} <span className="text-xs text-slate-500 font-normal">/ 31</span></p>
            <p className="text-[10px] text-slate-500 mt-0.5">Active bootcamp participation</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Missions Completed</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{candidate.signals.missionsCompleted}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Total assignments submitted</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>First-Try Pass Rate</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{firstTryRate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{candidate.signals.missionsFirstTry} passed on first attempt</p>
          </div>
        </div>

        {/* Missions Breakdown Table */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
            <span>Completed Missions & Attempt Logs</span>
            <span className="text-xs text-slate-400 font-normal">{candidate.missions.length} tracked records</span>
          </h3>

          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Day</th>
                  <th className="px-4 py-2.5 font-medium">Mission Title</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {candidate.missions.map((m) => (
                  <tr key={m.day} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-indigo-400">Day {m.day}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-200">{m.title}</td>
                    <td className="px-4 py-2.5">
                      {m.passed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Passed
                        </span>
                      ) : m.skipped ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-semibold">
                          <AlertCircle className="w-3 h-3" /> Skipped
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-[10px] font-semibold">
                          <XCircle className="w-3 h-3" /> Unpassed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-400">
                      {m.attempts ? `${m.attempts} attempt(s)` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Profile
          </button>

          <button
            onClick={() => {
              onClose();
              onStartInterview(candidate);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
          >
            <span>Launch Interview with {member.name.split(' ')[0]}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};
