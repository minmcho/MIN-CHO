
import React, { useState } from 'react';
import { analyzeResume } from '../services/gemini';
import { ResumeReport } from '../types';

const ResumeAnalysis: React.FC = () => {
  const [text, setText] = useState('');
  const [role, setRole] = useState('');
  const [report, setReport] = useState<ResumeReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !role) return;
    setLoading(true);
    try {
      const res = await analyzeResume(text, role);
      setReport(res);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Resume Optimizer</h2>
        <p className="text-slate-500">AI-driven technical evaluation for competitive STEM roles.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Target Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Target Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Flight Systems Engineer"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Resume Text</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  className="w-full h-64 px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !text || !role}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Analyzing Depth...' : 'Analyze Resume'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {report ? (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                      <circle cx="48" cy="48" r="40" fill="transparent" stroke="#4f46e5" strokeWidth="8" 
                              strokeDasharray={`${2 * Math.PI * 40}`} 
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - report.score / 100)}`} 
                              strokeLinecap="round" />
                    </svg>
                    <span className="text-3xl font-extrabold text-indigo-600">{report.score}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">STEM Match Score</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Depth Assessment</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{report.depthAssessment}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Keyword Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 mb-3 flex items-center gap-2">
                      ✅ Found Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {report.technicalSkillsMatch.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-600 mb-3 flex items-center gap-2">
                      ⚠️ Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {report.missingKeywords.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium border border-rose-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-4">Structural Improvements</h3>
                <p className="text-indigo-200 text-sm mb-6 leading-relaxed">{report.structureFeedback}</p>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Actionable Impacts</h4>
                  <ul className="space-y-2">
                    {report.impactSuggestions.map((sug, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="text-indigo-400">⚡</span>
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-slate-400">
               <span className="text-6xl mb-4">🔬</span>
               <p className="text-lg font-medium">Input your resume details to unlock the optimization dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
