
import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { analyzeJournalEntry } from '../services/gemini';

const STEM_PROMPTS = [
  "What technical challenge did you troubleshoot today? What was the 'aha' moment?",
  "Reflect on a recent code review or research feedback. How will it change your next project?",
  "Describe a new STEM tool or library you explored. What is its unique value proposition?",
  "What soft skill (communication, leadership) did you apply in a technical context today?",
  "Post-Interview Post-Mortem: Which question was the most challenging and why?",
];

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('catalyst_journal');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  const saveToDisk = (newEntries: JournalEntry[]) => {
    localStorage.setItem('catalyst_journal', JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleCreate = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      title: 'New Reflection',
      content: '',
      tags: [],
    };
    setActiveEntry(newEntry);
    setTitle(newEntry.title);
    setContent(newEntry.content);
  };

  const handleSave = () => {
    if (!activeEntry) return;
    const updatedEntry = { ...activeEntry, title, content };
    const exists = entries.find(e => e.id === activeEntry.id);
    let newEntries;
    if (exists) {
      newEntries = entries.map(e => e.id === activeEntry.id ? updatedEntry : e);
    } else {
      newEntries = [updatedEntry, ...entries];
    }
    saveToDisk(newEntries);
    setActiveEntry(updatedEntry);
  };

  const handleDelete = (id: string) => {
    const filtered = entries.filter(e => e.id !== id);
    saveToDisk(filtered);
    if (activeEntry?.id === id) setActiveEntry(null);
  };

  const handleGetInsight = async () => {
    if (!content || !activeEntry) return;
    setLoadingInsight(true);
    try {
      const insight = await analyzeJournalEntry(content);
      const updated = { ...activeEntry, aiInsight: insight };
      const newEntries = entries.map(e => e.id === activeEntry.id ? updated : e);
      saveToDisk(newEntries);
      setActiveEntry(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex gap-8">
      {/* Sidebar - Entry List */}
      <div className="w-80 flex flex-col gap-4">
        <button 
          onClick={handleCreate}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <span>✍️</span> New Entry
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {entries.map(entry => (
            <button
              key={entry.id}
              onClick={() => {
                setActiveEntry(entry);
                setTitle(entry.title);
                setContent(entry.content);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                activeEntry?.id === entry.id 
                  ? 'bg-white border-indigo-400 shadow-md ring-2 ring-indigo-50' 
                  : 'bg-white/50 border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.date}</span>
                {entry.aiInsight && <span className="text-xs">✨</span>}
              </div>
              <h4 className="font-bold text-slate-800 truncate">{entry.title || 'Untitled'}</h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-1">{entry.content || 'No content yet...'}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col gap-6">
        {activeEntry ? (
          <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry Title..."
                className="text-2xl font-bold bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-300 w-full"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDelete(activeEntry.id)}
                  className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  🗑️
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-8 overflow-y-auto">
              {/* Prompt Bar */}
              <div className="mb-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 relative group">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-[10px] text-white font-bold uppercase rounded-lg">
                  STEM Suggestion
                </div>
                <p className="text-sm text-indigo-900 font-medium italic">
                  "{STEM_PROMPTS[currentPrompt]}"
                </p>
                <button 
                  onClick={() => setCurrentPrompt((prev) => (prev + 1) % STEM_PROMPTS.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-indigo-100 rounded-full text-indigo-400 transition-all opacity-0 group-hover:opacity-100"
                >
                  ➔
                </button>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start your technical reflection here..."
                className="flex-1 w-full bg-transparent border-none outline-none resize-none text-slate-700 leading-relaxed text-lg"
              />

              {activeEntry.aiInsight && (
                <div className="mt-8 p-6 bg-slate-900 text-white rounded-3xl shadow-lg animate-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">✨</span>
                    <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Catalyst Insight</h5>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300 italic font-medium">
                    {activeEntry.aiInsight}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
              <button
                onClick={handleGetInsight}
                disabled={loadingInsight || !content}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-indigo-200 text-indigo-600 font-bold text-sm shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all disabled:opacity-50"
              >
                {loadingInsight ? 'Synthesizing Insight...' : 'Get Catalyst Insight'}
                <span>✨</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-8">
              <span className="text-5xl opacity-30">📓</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">The Lab Notebook</h3>
            <p className="text-slate-400 max-w-sm">
              Document your growth, track technical breakthroughs, and get AI coaching on your STEM journey.
            </p>
            <button 
              onClick={handleCreate}
              className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Start Your First Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
