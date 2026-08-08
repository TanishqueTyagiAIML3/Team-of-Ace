import React, { useState } from 'react';
import { Search, Filter, User, Briefcase, GraduationCap, Award, CheckCircle2, AlertTriangle, Eye, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { Candidate, CohortData } from '../types';
import { ShowcaseSlideshow } from './ShowcaseSlideshow';
import { InterviewRulesSection } from './InterviewRulesSection';

interface CandidateSelectorProps {
  candidates: Candidate[];
  cohort: CohortData;
  selectedCandidate: Candidate;
  onSelectCandidate: (candidate: Candidate) => void;
  onInspectCandidate: (candidate: Candidate) => void;
  onStartInterview: (candidate: Candidate) => void;
}

export const CandidateSelector: React.FC<CandidateSelectorProps> = ({
  candidates,
  cohort,
  selectedCandidate,
  onSelectCandidate,
  onInspectCandidate,
  onStartInterview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Extract unique roles for filter buttons
  const roles = ['ALL', ...Array.from(new Set(candidates.map(c => c.member.jobRole)))];

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.member.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.member.education.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || c.member.jobRole === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Interactive Home Showcase Slideshow */}
      <ShowcaseSlideshow
        onStartInterviewWithTopCandidate={() => onStartInterview(selectedCandidate || candidates[0])}
      />

      {/* Official Technical Interview Rules & Proctoring Standards */}
      <InterviewRulesSection />

      {/* Banner / Cohort Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30">
                {cohort.cohort}
              </span>
              <span className="text-xs text-slate-400">• 20 Enrolled Candidates</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">AI Cohort Candidate Pool</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Select a candidate from the 31-day AI Bootcamp. Evaluate their mission completion signals, first-try pass rate, and skipped topics before conducting an AI technical interview.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="block text-xl font-bold text-indigo-400">31</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Days</span>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <span className="block text-xl font-bold text-emerald-400">8</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Modules</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-xl font-bold text-purple-400">20</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Profiles</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Role Filter Toolbar with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800"
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, ID, education..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex space-x-1.5">
            {roles.slice(0, 6).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedRole === role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Candidate Cards Grid with Scroll Reveal */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.06,
            },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredCandidates.map((c) => {
          const isSelected = selectedCandidate?.member.id === c.member.id;
          const passedCount = c.missions.filter(m => m.passed).length;
          const skippedCount = c.missions.filter(m => m.skipped).length;
          const passRate = Math.round((c.signals.missionsFirstTry / c.signals.missionsCompleted) * 100) || 0;

          return (
            <motion.div
              key={c.member.id}
              onClick={() => onSelectCandidate(c)}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-slate-900 rounded-xl p-5 border transition-all cursor-pointer relative flex flex-col justify-between hover:shadow-lg ${
                isSelected
                  ? 'border-indigo-500 bg-slate-900/90 shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Info */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                      {c.member.id}
                    </span>
                    <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                      {c.member.name}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      )}
                    </h3>
                    <p className="text-xs text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3" />
                      {c.member.jobRole} • {c.member.yearsExperience} yrs exp
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {c.member.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.member.education}</span>
                </div>

                {/* Progress Signals Bar */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800/80 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Commit Days:</span>
                    <span className="font-semibold text-slate-200">{c.signals.commitDays} / 31 days</span>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                      style={{ width: `${(c.signals.commitDays / 31) * 100}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="flex items-center space-x-1 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{passedCount} Passed</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Award className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{passRate}% 1st-Try</span>
                    </div>
                  </div>

                  {skippedCount > 0 && (
                    <div className="flex items-center space-x-1 text-amber-400 text-[10px]">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{skippedCount} module(s) skipped</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectCandidate(c);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profile & Missions</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartInterview(c);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center space-x-1 shadow transition-all"
                >
                  <span>Interview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
};
