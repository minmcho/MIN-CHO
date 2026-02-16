
import React from 'react';
import { View } from '../types';

interface DashboardProps {
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const stats = [
    { label: 'Applications', value: '12', trend: '+2 this week' },
    { label: 'Skill Level', value: 'Lvl 4', trend: 'Next: Senior ML' },
    { label: 'Interviews', value: '3', trend: '1 scheduled' },
    { label: 'Resources', value: '45', trend: '12 new today' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Welcome back, Jane</h2>
        <p className="text-slate-500">Here's what's happening in your STEM career journey.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-indigo-600">{stat.value}</span>
              <span className="text-xs text-emerald-600 font-medium">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🚀 Career Progress
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Quantum Computing Fundamentals</span>
                <span className="text-sm text-indigo-600">85%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Advanced React Architectures</span>
                <span className="text-sm text-indigo-600">42%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full w-[42%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Behavioral Interview Readiness</span>
                <span className="text-sm text-indigo-600">95%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full w-[95%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl shadow-xl text-white">
          <h3 className="text-xl font-bold mb-2">Ready for a mock session?</h3>
          <p className="text-indigo-100 mb-6 opacity-90">
            Our AI interviewer is ready to simulate a technical screen for a Senior Robotics Engineer role.
          </p>
          <button 
            onClick={() => setView(View.INTERVIEW_LAB)}
            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-indigo-500/30"
          >
            Start Practice Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
