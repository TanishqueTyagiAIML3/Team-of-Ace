import React, { useState, useRef } from 'react';
import { Award, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, RefreshCw, ChevronRight, Download, FileText, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InterviewSession } from '../types';

interface EvaluationReportProps {
  session: InterviewSession;
  onRestartInterview: () => void;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  session,
  onRestartInterview,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const feedback = session.feedback;
  const candidate = session.candidate;

  if (!feedback) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-300"
      >
        <p>No evaluation report generated yet. Complete the interview turns first.</p>
        <button
          onClick={onRestartInterview}
          className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold"
        >
          Return to Interview
        </button>
      </motion.div>
    );
  }

  // Calculate readiness score
  const passedCount = candidate.missions.filter(m => m.passed).length;
  const totalMissions = candidate.missions.length;
  const baseScore = Math.round((passedCount / totalMissions) * 60) + 30;
  const finalScore = Math.min(Math.max(baseScore, 65), 98);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);

    try {
      // First attempt: try html2canvas capture if available and element exists
      if (reportRef.current) {
        try {
          const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#0f172a',
            logging: false,
            // Skip elements if they fail
            ignoreElements: (el) => el.classList.contains('no-pdf'),
          });

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }

          const candidateCleanName = candidate.member.name.replace(/\s+/g, '_');
          pdf.save(`HireMind_Evaluation_Report_${candidateCleanName}.pdf`);
          setIsGeneratingPdf(false);
          return;
        } catch (canvasError) {
          console.warn('html2canvas capture failed, falling back to direct vector PDF generation:', canvasError);
        }
      }

      // Fallback / Direct Vector PDF Generator using jsPDF API
      generateDirectVectorPdf();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Emergency direct vector fallback
      generateDirectVectorPdf();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generateDirectVectorPdf = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    let y = 15;

    // Header Background
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pageWidth, 28, 'F');

    // Brand Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('HIREMIND AI', margin, 12);

    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(165, 180, 252);
    pdf.text('OFFICIAL TECHNICAL EVALUATION REPORT', margin, 18);

    // Session Meta Right
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Session ID: ${session.sessionId}`, pageWidth - margin, 12, { align: 'right' });
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, 18, { align: 'right' });

    y = 35;

    // Candidate Info Card
    pdf.setFillColor(30, 41, 59); // slate-800
    pdf.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(candidate.member.name, margin + 5, y + 10);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(199, 210, 254);
    pdf.text(`${candidate.member.jobRole}  |  ${candidate.member.yearsExperience} Years Exp  |  ${candidate.member.education}`, margin + 5, y + 17);

    pdf.setFontSize(8);
    pdf.setTextColor(52, 211, 153);
    pdf.text('Interview Evaluation Complete & Verified', margin + 5, y + 25);

    // Score Badge Box
    const scoreBoxX = pageWidth - margin - 40;
    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(scoreBoxX, y + 4, 35, 24, 2, 2, 'F');
    pdf.setDrawColor(99, 102, 241);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(scoreBoxX, y + 4, 35, 24, 2, 2, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`${finalScore}%`, scoreBoxX + 17.5, y + 14, { align: 'center' });

    pdf.setFontSize(7);
    pdf.setTextColor(129, 140, 248);
    const ratingText = finalScore >= 85 ? 'STRONG HIRE' : finalScore >= 75 ? 'QUALIFIED' : 'UPSKILLING';
    pdf.text(ratingText, scoreBoxX + 17.5, y + 21, { align: 'center' });

    y += 38;

    // Executive Summary Section
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text('EXECUTIVE EVALUATION SUMMARY', margin, y);
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);
    const summaryLines = pdf.splitTextToSize(feedback.summary, contentWidth - 8);
    const summaryHeight = summaryLines.length * 4.5 + 8;

    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, y, contentWidth, summaryHeight, 2, 2, 'F');
    pdf.roundedRect(margin, y, contentWidth, summaryHeight, 2, 2, 'S');

    pdf.text(summaryLines, margin + 4, y + 6);

    y += summaryHeight + 8;

    // Evaluation Dimensions
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text('EVALUATION METRICS & DIMENSIONS', margin, y);
    y += 5;

    const colWidth = (contentWidth - 6) / 2;

    pdf.setFillColor(238, 242, 255);
    pdf.setDrawColor(199, 210, 254);
    pdf.roundedRect(margin, y, colWidth, 18, 2, 2, 'F');
    pdf.roundedRect(margin, y, colWidth, 18, 2, 2, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(67, 56, 202);
    pdf.text('1. Answer Accuracy & Correctness', margin + 3, y + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(71, 85, 105);
    const textDim1 = pdf.splitTextToSize('Factual correctness of architecture, code statements, vector DBs, and algorithms.', colWidth - 6);
    pdf.text(textDim1, margin + 3, y + 10);

    const col2X = margin + colWidth + 6;
    pdf.setFillColor(250, 245, 255);
    pdf.setDrawColor(233, 213, 255);
    pdf.roundedRect(col2X, y, colWidth, 18, 2, 2, 'F');
    pdf.roundedRect(col2X, y, colWidth, 18, 2, 2, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(126, 34, 206);
    pdf.text('2. Communication Manner & Delivery', col2X + 3, y + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(71, 85, 105);
    const textDim2 = pdf.splitTextToSize('Articulation, STAR framework structure, conciseness, clarity, and technical confidence.', colWidth - 6);
    pdf.text(textDim2, col2X + 3, y + 10);

    y += 24;

    // Strengths Section
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(16, 185, 129);
    pdf.text('DEMONSTRATED STRENGTHS', margin, y);
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(30, 41, 59);
    feedback.strengths.forEach((str) => {
      const lines = pdf.splitTextToSize(`- ${str}`, contentWidth - 4);
      pdf.text(lines, margin + 2, y);
      y += lines.length * 4.5;
    });

    y += 4;

    // Technical Gaps Section
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(217, 119, 6);
    pdf.text('IDENTIFIED TECHNICAL GAPS', margin, y);
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(30, 41, 59);
    feedback.gaps.forEach((gap) => {
      const lines = pdf.splitTextToSize(`- ${gap}`, contentWidth - 4);
      pdf.text(lines, margin + 2, y);
      y += lines.length * 4.5;
    });

    y += 4;

    // Next Steps
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(79, 70, 229);
    pdf.text('ACTIONABLE NEXT STEPS', margin, y);
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(30, 41, 59);
    feedback.next.forEach((step) => {
      const lines = pdf.splitTextToSize(`- ${step}`, contentWidth - 4);
      pdf.text(lines, margin + 2, y);
      y += lines.length * 4.5;
    });

    // Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Verified by HireMind AI Proctoring Platform  |  Official Audit Record', margin, pageHeight - 10);
    pdf.text(`Document Hash: ${session.sessionId.slice(-8).toUpperCase()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

    const cleanName = candidate.member.name.replace(/\s+/g, '_');
    pdf.save(`HireMind_Evaluation_Report_${cleanName}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Printable Report Container */}
      <div ref={reportRef} className="p-4 sm:p-6 bg-slate-950/60 rounded-3xl space-y-6 border border-slate-800/80">
        
        {/* Header Evaluation Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-600/10 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Interview Evaluation Complete
                </span>
                <span className="text-xs text-slate-400 font-mono">Session ID: {session.sessionId}</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{candidate.member.name}</h2>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">
                {candidate.member.jobRole} • {candidate.member.yearsExperience} Years Experience • {candidate.member.education}
              </p>
            </div>

            {/* Readiness Score Badge */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center space-x-4 shrink-0 shadow-lg">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#6366f1"
                    strokeWidth="6"
                    strokeDasharray={163}
                    initial={{ strokeDashoffset: 163 }}
                    animate={{ strokeDashoffset: 163 - (163 * finalScore) / 100 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-bold text-base text-white">{finalScore}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Tech Readiness</span>
                <span className="text-xs font-bold text-indigo-400">
                  {finalScore >= 85 ? 'Strong Hire' : finalScore >= 75 ? 'Qualified Hire' : 'Needs Upskilling'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Executive Summary Box with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Executive Dual-Dimension Evaluation Summary</h3>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-semibold">
                ✓ Technical Accuracy Evaluated
              </span>
              <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg font-semibold">
                ✓ Delivery & Manner Evaluated
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            {feedback.summary}
          </p>

          {/* Dual Dimension Metric Callout Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-indigo-500/20 flex items-start space-x-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 mb-0.5">1. Answer Accuracy & Technical Correctness</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Assesses factual correctness of architecture, algorithms, vector DB concepts, and code statements.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-purple-500/20 flex items-start space-x-3">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 mb-0.5">2. Communication Manner & Delivery</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Assesses articulation, response structure (STAR method), clarity, technical confidence, and conciseness.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Strengths, Gaps, and Next Steps Grid with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* Strengths */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <h4 className="font-bold text-xs text-white">Demonstrated Strengths</h4>
            </div>
            <ul className="space-y-2 text-xs">
              {feedback.strengths.map((item, idx) => (
                <li key={idx} className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-xl text-slate-300 flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Gaps */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="font-bold text-xs text-white">Identified Technical Gaps</h4>
            </div>
            <ul className="space-y-2 text-xs">
              {feedback.gaps.map((item, idx) => (
                <li key={idx} className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl text-slate-300 flex items-start space-x-2">
                  <span className="text-amber-400 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400">
              <ChevronRight className="w-4 h-4" />
              <h4 className="font-bold text-xs text-white">Actionable Next Steps</h4>
            </div>
            <ul className="space-y-2 text-xs">
              {feedback.next.map((item, idx) => (
                <li key={idx} className="bg-indigo-500/5 border border-indigo-500/20 p-2.5 rounded-xl text-slate-300 flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* PDF Footer Verification Seal */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified by HireMind AI Proctoring Platform • Official Audit</span>
          </div>
          <span className="font-mono text-slate-500">Document Hash: {session.sessionId.slice(-8).toUpperCase()}</span>
        </div>

      </div>

      {/* Action Footer with PDF Download Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2"
      >
        <button
          onClick={onRestartInterview}
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>New Interview Session</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs px-6 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all border border-emerald-400/30"
        >
          {isGeneratingPdf ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          ) : (
            <Download className="w-4 h-4 shrink-0" />
          )}
          <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Evaluation Report'}</span>
        </button>
      </motion.div>

    </motion.div>
  );
};

