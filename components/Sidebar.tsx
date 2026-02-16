
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { id: View.RESUME_ANALYSIS, label: 'Resume Insight', icon: '📄' },
    { id: View.JOB_SEARCH, label: 'Job Search', icon: '🔍' },
    { id: View.INTERVIEW_LAB, label: 'Interview Lab', icon: '🎙️' },
    { id: View.SKILL_BUILDER, label: 'Skill Builder', icon: '🧬' },
    { id: View.JOURNAL, label: 'Reflective Log', icon: '📓' },
  ];

  return (
    <div className="w-64 h-screen bg-indigo-900 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-indigo-200">Catalyst STEM</h1>
        <p className="text-xs text-indigo-400 mt-1 uppercase tracking-widest font-semibold">Career Engine</p>
      </div>
      
      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentView === item.id 
                    ? 'bg-indigo-700 text-white shadow-lg' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-indigo-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-inner">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold">Jane Doe</p>
            <p className="text-xs text-indigo-400">Bioengineer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
