
import React, { useState, useEffect } from 'react';
import { searchSTEMJobs } from '../services/gemini';
import { Job } from '../types';

const STEM_LOCATIONS: Record<string, string[]> = {
  "USA": ["San Francisco", "Boston", "Seattle", "Austin", "New York", "Chicago"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Stuttgart"],
  "UK": ["London", "Cambridge", "Oxford", "Manchester"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Waterloo"],
  "India": ["Bangalore", "Hyderabad", "Pune", "Delhi NCR"],
  "Singapore": ["Singapore"],
  "Japan": ["Tokyo", "Osaka", "Kyoto"],
  "Switzerland": ["Zurich", "Geneva", "Lausanne"],
  "Netherlands": ["Amsterdam", "Eindhoven", "Delft"]
};

const JobSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset city when country changes
  useEffect(() => {
    setCity('');
  }, [country]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const results = await searchSTEMJobs(query, country, city);
      setJobs(results.jobs);
      setSources(results.sources);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const countries = Object.keys(STEM_LOCATIONS).sort();
  const cities = country ? STEM_LOCATIONS[country].sort() : [];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Find Your Next STEM Frontier</h2>
        <p className="text-slate-500 text-lg">AI-powered search grounded in real-time global market data.</p>
        
        <form onSubmit={handleSearch} className="mt-8 bg-white p-4 rounded-3xl shadow-xl border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Role Query */}
            <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <span className="text-slate-400 mr-2">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Role (e.g., Bioinformatician)"
                className="w-full py-4 bg-transparent outline-none text-slate-700 font-medium"
              />
            </div>
            
            {/* Country Select */}
            <div className="flex-shrink-0 lg:w-48 flex items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all relative">
              <span className="text-slate-400 mr-2">🌎</span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full py-4 bg-transparent outline-none text-slate-700 font-medium text-sm appearance-none cursor-pointer"
              >
                <option value="">All Countries</option>
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="absolute right-4 pointer-events-none text-slate-400">▼</span>
            </div>

            {/* City Select */}
            <div className={`flex-shrink-0 lg:w-48 flex items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all relative ${!country ? 'opacity-50' : ''}`}>
              <span className="text-slate-400 mr-2">📍</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!country}
                className="w-full py-4 bg-transparent outline-none text-slate-700 font-medium text-sm appearance-none cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="">{country ? 'Any City' : 'Select Country First'}</option>
                {cities.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
              <span className="absolute right-4 pointer-events-none text-slate-400">▼</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200 active:scale-95"
            >
              {loading ? 'Searching...' : 'Explore'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-8">
        {jobs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Global Opportunities</h3>
              <p className="text-sm text-slate-400">Found {jobs.length} frontier matches for your criteria</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((src, i) => (
                <a 
                  key={i} 
                  href={src.web?.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-widest bg-white border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg text-slate-500 hover:text-indigo-600 transition-all shadow-sm"
                >
                  📡 Source {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {job.company.charAt(0)}
                    </span>
                    <h4 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="font-bold text-slate-700">{job.company}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <span className="text-indigo-400">📍</span> {job.location}
                    </span>
                    {job.salary && (
                       <>
                        <span className="text-slate-300">|</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-xs tracking-tight">
                          💰 {job.salary}
                        </span>
                       </>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <button className="w-full bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                    Apply Now
                  </button>
                </div>
              </div>
              
              <p className="text-slate-600 mb-8 leading-relaxed line-clamp-3">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {job.requirements.map((req, i) => (
                  <span key={i} className="text-[10px] font-bold bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    {req}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!loading && jobs.length === 0 && (
          <div className="text-center py-24 bg-white/50 backdrop-blur rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl opacity-50">🔭</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">The Frontier Awaits</h3>
            <p className="text-slate-400 max-w-sm mx-auto">Select a technical role and filter by location to discover high-impact STEM opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
