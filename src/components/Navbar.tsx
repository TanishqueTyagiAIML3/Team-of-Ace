import React from 'react';
import { Bot, Camera, Mic, RefreshCw, Award, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { Candidate, ProctorStatus } from '../types';

interface NavbarProps {
  currentCandidate?: Candidate;
  proctorStatus: ProctorStatus;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenCandidateSelector: () => void;
  activeTab: 'candidates' | 'interview' | 'evaluation';
  setActiveTab: (tab: 'candidates' | 'interview' | 'evaluation') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCandidate,
  proctorStatus,
  voiceEnabled,
  onToggleVoice,
  onOpenCandidateSelector,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-white tracking-tight">HireMind</h1>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                AI Hiring Platform
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-Time Voice • Proctor Camera • Live Evaluation</p>
          </div>
        </div>

        {/* Navigation Tabs with Motion Indicator */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50 relative">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative z-10 ${
              activeTab === 'candidates'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'candidates' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            Candidates & Cohort
          </button>

          <button
            onClick={() => setActiveTab('interview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 relative z-10 ${
              activeTab === 'interview'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'interview' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Activity className="w-3.5 h-3.5 text-indigo-300" />
            <span>Live Interview</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 relative z-10 ${
              activeTab === 'evaluation'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'evaluation' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Evaluation Report</span>
          </button>
        </nav>

        {/* Action Controls & Badges */}
        <div className="flex items-center space-x-3">
          
          {/* Active Candidate Badge */}
          {currentCandidate ? (
            <button
              onClick={onOpenCandidateSelector}
              className="hidden sm:flex items-center space-x-2 bg-slate-800 border border-slate-700 hover:border-indigo-500/50 px-2.5 py-1 rounded-lg text-xs transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-slate-300 font-medium">{currentCandidate.member.name}</span>
              <span className="text-slate-500">({currentCandidate.member.jobRole})</span>
              <RefreshCw className="w-3 h-3 text-slate-400 ml-1" />
            </button>
          ) : (
            <button
              onClick={onOpenCandidateSelector}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow"
            >
              Select Candidate
            </button>
          )}

          {/* Camera Proctor Status Indicator */}
          <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs">
            <Camera className={`w-3.5 h-3.5 ${proctorStatus.cameraActive ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="hidden lg:inline text-slate-300 text-[11px]">
              {proctorStatus.cameraActive ? 'Camera Live' : 'Camera Off'}
            </span>
            {proctorStatus.cameraActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </div>

          {/* Voice Assistant Toggle */}
          <button
            onClick={onToggleVoice}
            className={`p-2 rounded-lg border text-xs flex items-center space-x-1 transition-all ${
              voiceEnabled
                ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={voiceEnabled ? 'Voice Assistant Enabled' : 'Voice Assistant Muted'}
          >
            <Mic className={`w-4 h-4 ${voiceEnabled ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline font-medium text-[11px]">
              {voiceEnabled ? 'Voice On' : 'Muted'}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};

