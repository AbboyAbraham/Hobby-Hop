import React, { useState } from 'react';
import { Project, ExploreSuggestion } from '../types';
import { getHobbySuggestions } from '../services/geminiService';
import { Compass, ExternalLink, Loader2, Sparkles, Tag, BarChart } from 'lucide-react';

interface Props {
  projects: Project[];
  onAddProject: (p: Project) => void;
}

export const Explore: React.FC<Props> = ({ projects, onAddProject }) => {
  const [suggestions, setSuggestions] = useState<ExploreSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await getHobbySuggestions(projects);
      setSuggestions(results);
    } catch (e) {
      setError('Failed to find ideas. Please check your connection or API key.');
    } finally {
      setLoading(false);
    }
  };

  const createFromSuggestion = (suggestion: ExploreSuggestion) => {
    // Map the first tag to category, default to 'General' if no tags
    const category = suggestion.tags && suggestion.tags.length > 0 ? suggestion.tags[0] : 'General';
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: suggestion.title,
      description: suggestion.description,
      category: category,
      imageUrl: `https://picsum.photos/seed/${suggestion.title.replace(/\s/g,'')}/600/400`,
      notes: [{
        id: crypto.randomUUID(),
        content: `Difficulty: ${suggestion.difficulty}\nEstimated Cost: ${suggestion.estimatedCost}`,
        createdAt: Date.now()
      }],
      status: 'planned',
      progress: 0,
      endGoal: 'Complete this project',
      createdAt: Date.now(),
    };
    onAddProject(newProject);
    alert('Project added to My Hobbies!');
  };

  const getPinterestUrl = (query: string) => {
    return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = difficulty.toLowerCase();
    if (d.includes('beginner')) return 'text-green-400 bg-green-400/10';
    if (d.includes('intermediate')) return 'text-yellow-400 bg-yellow-400/10';
    if (d.includes('advanced')) return 'text-red-400 bg-red-400/10';
    return 'text-emerald-400 bg-emerald-400/10';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Compass size={32} className="text-emerald-400" />
        <h1 className="text-3xl font-bold">Explore</h1>
      </div>
      
      <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-6 rounded-2xl border border-emerald-500/20 mb-8 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-semibold mb-2">Need Inspiration?</h2>
          <p className="text-white/70 text-sm mb-4">Let our AI Creative Consultant find your next obsession.</p>
          <button
            onClick={handleFetchSuggestions}
            disabled={loading}
            className="bg-white text-emerald-900 px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Thinking...' : 'Inspire Me'}
          </button>
        </div>
        {/* Decorative background blurs */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm mb-6 text-center">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-24 space-y-4">
        {suggestions.length === 0 && !loading && !error && (
          <div className="text-center text-white/30 py-10">
            <p>Tap "Inspire Me" to generate tailored project ideas.</p>
          </div>
        )}

        {suggestions.map((item, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between items-start mb-3">
              <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded flex items-center gap-1 ${getDifficultyColor(item.difficulty)}`}>
                <BarChart size={12} />
                {item.difficulty}
              </span>
              <span className="text-xs text-white/50 font-mono bg-black/20 px-2 py-1 rounded">
                {item.estimatedCost}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              {item.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map((tag, tIdx) => (
                <span key={tIdx} className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => createFromSuggestion(item)}
                className="flex-1 bg-white/10 hover:bg-emerald-600 hover:text-white text-emerald-200 py-2 rounded-lg text-sm font-medium transition-colors border border-white/5"
              >
                Start Project
              </button>
              <a
                href={getPinterestUrl(item.title + " " + item.tags.join(" ") + " diy")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-[#E60023]/20 text-[#E60023] hover:bg-[#E60023] hover:text-white rounded-lg transition-colors border border-white/5"
                title="Search on Pinterest"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};