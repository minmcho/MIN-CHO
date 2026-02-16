
import React, { useState } from 'react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobSearch from './components/JobSearch';
import InterviewLab from './components/InterviewLab';
import SkillRoadmap from './components/SkillRoadmap';
import ResumeAnalysis from './components/ResumeAnalysis';
import Journal from './components/Journal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard setView={setCurrentView} />;
      case View.JOB_SEARCH:
        return <JobSearch />;
      case View.INTERVIEW_LAB:
        return <InterviewLab />;
      case View.SKILL_BUILDER:
        return <SkillRoadmap />;
      case View.RESUME_ANALYSIS:
        return <ResumeAnalysis />;
      case View.JOURNAL:
        return <Journal />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 ml-64 min-h-screen">
        <div className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="text-slate-400 font-medium">
            Catalyst / <span className="text-indigo-600 capitalize">{currentView.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors relative" title="Notifications">
               <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
               🔔
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Settings">
               ⚙️
            </button>
          </div>
        </div>

        <div className="relative">
          {renderView()}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <div className="glass px-4 py-2 rounded-full shadow-lg border border-indigo-100 flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">AI Core Active</span>
        </div>
      </div>
    </div>
  );
};

export default App;
