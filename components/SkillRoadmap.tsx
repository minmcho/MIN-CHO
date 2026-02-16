
import React, { useState, useRef } from 'react';
import { generateSkillRoadmap, generateDetailedSkillPlan } from '../services/gemini';
import { Roadmap, SkillDetailPlan } from '../types';

const SkillRoadmap: React.FC = () => {
  const [role, setRole] = useState('');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [detailedPlans, setDetailedPlans] = useState<Record<number, SkillDetailPlan>>({});
  const [loadingPlanIndex, setLoadingPlanIndex] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState('');
  
  const mainInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (e?: React.FormEvent, customRole?: string) => {
    if (e) e.preventDefault();
    const targetRole = customRole || role;
    if (!targetRole) return;
    
    setLoading(true);
    setExpandedIndex(null);
    setDetailedPlans({});
    try {
      const data = await generateSkillRoadmap(targetRole);
      setRoadmap(data);
      if (!customRole) setRole(targetRole);
    } catch (error) {
      console.error("Roadmap generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockPlan = async (index: number, skillTitle: string) => {
    if (detailedPlans[index]) {
      setExpandedIndex(expandedIndex === index ? null : index);
      return;
    }

    setLoadingPlanIndex(index);
    try {
      const plan = await generateDetailedSkillPlan(skillTitle, roadmap?.role || role);
      setDetailedPlans(prev => ({ ...prev, [index]: plan }));
      setExpandedIndex(index);
    } catch (error) {
      console.error("Failed to generate detailed plan", error);
    } finally {
      setLoadingPlanIndex(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900">Skill Builder Labs</h2>
        <p className="text-slate-500 mt-2">Generate a technical learning path for any STEM specialization.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
        <form onSubmit={handleGenerate} className="flex gap-4">
          <input
            ref={mainInputRef}
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="What role are you aiming for? (e.g. Avionics Engineer)"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            {loading ? 'Analyzing...' : 'Generate Roadmap'}
          </button>
        </form>
      </div>

      {roadmap && (
        <div className="space-y-8 relative">
          <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-indigo-100 -z-10"></div>
          
          <div className="flex items-center justify-between mb-12">
            <div className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg">
              Target: {roadmap.role}
            </div>
            <button 
              onClick={() => { setRoadmap(null); setRole(''); }}
              className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
            >
              ← Start New Build
            </button>
          </div>

          {roadmap.steps.map((step, index) => (
            <div key={index} className="flex gap-8 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-4 border-indigo-600 flex items-center justify-center font-bold text-indigo-600 shadow-md transition-transform group-hover:scale-110">
                {index + 1}
              </div>
              <div className="flex-1 space-y-4">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold text-slate-800">{step.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      step.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600' :
                      step.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {step.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">{step.description}</p>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-50">
                    <div className="flex flex-wrap gap-2">
                      {step.resources.slice(0, 2).map((res, i) => (
                        <span key={i} className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
                          #{res.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleUnlockPlan(index, step.title)}
                      disabled={loadingPlanIndex === index}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                        expandedIndex === index 
                          ? 'bg-slate-100 text-slate-600' 
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      {loadingPlanIndex === index ? 'Generating Plan...' : 
                       expandedIndex === index ? 'Hide Blueprint' : 'Unlock Detailed Blueprint'}
                    </button>
                  </div>
                </div>

                {/* Detailed Blueprint Section */}
                {expandedIndex === index && detailedPlans[index] && (
                  <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Weekly Breakdown */}
                      <div className="space-y-6">
                        <h5 className="text-sm font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-6 h-6 bg-indigo-600 text-white rounded-md flex items-center justify-center text-[10px]">1</span>
                          Weekly Curriculum
                        </h5>
                        <div className="space-y-4">
                          {detailedPlans[index].weeks.map((week, wi) => (
                            <div key={wi} className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                              <p className="text-xs font-bold text-indigo-600 mb-1">{week.title}</p>
                              <ul className="text-xs text-slate-600 space-y-1">
                                {week.objectives.map((obj, oi) => (
                                  <li key={oi} className="flex gap-2">
                                    <span className="text-emerald-500 font-bold">✓</span> {obj}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Projects & Interviews */}
                      <div className="space-y-8">
                        <div>
                          <h5 className="text-sm font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 bg-indigo-600 text-white rounded-md flex items-center justify-center text-[10px]">2</span>
                            Project Spotlight
                          </h5>
                          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg">
                            <h6 className="font-bold text-lg mb-2">{detailedPlans[index].projects[0].name}</h6>
                            <p className="text-indigo-200 text-xs leading-relaxed mb-4">
                              {detailedPlans[index].projects[0].description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {detailedPlans[index].projects[0].techStack.map((tech, ti) => (
                                <span key={ti} className="text-[10px] bg-indigo-800 px-2 py-1 rounded text-indigo-300 font-mono">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 bg-indigo-600 text-white rounded-md flex items-center justify-center text-[10px]">3</span>
                            Interview Mastery
                          </h5>
                          <ul className="space-y-3">
                            {detailedPlans[index].interviewQuestions.map((q, qi) => (
                              <li key={qi} className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100 flex gap-3 italic">
                                <span className="text-indigo-500 font-bold">Q:</span> {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!roadmap && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Structural Analyst', 'Computational Biologist', 'Data Scientist'].map(example => (
            <button 
              key={example}
              onClick={() => handleGenerate(undefined, example)}
              className="p-6 bg-white border border-slate-100 rounded-2xl text-left hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Quick Start</p>
              <p className="text-slate-800 font-semibold group-hover:text-indigo-600">{example}</p>
            </button>
          ))}
          
          <div className="p-6 bg-indigo-50/50 border border-indigo-100 border-dashed rounded-2xl flex flex-col justify-between group hover:bg-indigo-50 hover:border-indigo-300 transition-all">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Your Vision</p>
              <input 
                type="text" 
                placeholder="Custom Role..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate(undefined, customInput)}
                className="w-full bg-transparent border-b border-indigo-200 py-1 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 placeholder:text-indigo-300"
              />
            </div>
            <button 
              onClick={() => handleGenerate(undefined, customInput)}
              disabled={!customInput}
              className="mt-4 text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2 disabled:opacity-30"
            >
              Initialize Build <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillRoadmap;
