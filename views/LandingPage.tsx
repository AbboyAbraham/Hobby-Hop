import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      
      {/* Background Decor - simple glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-hopTeal/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-hopDark/40 rounded-full blur-3xl" />

      {/* Content Container */}
      <div className="relative z-10 max-w-md space-y-8 backdrop-blur-sm bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
        
        {/* Logo / Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-hopTeal to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Hobby Hop
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Discover your next passion. Plan your projects. Track your progress.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="group w-full py-4 px-6 bg-white text-hopDark font-bold text-lg rounded-xl shadow-lg hover:bg-gray-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
      
      {/* Footer Text */}
      <p className="absolute bottom-8 text-sm text-white/30">
        Track your Hobbies, Shopping cart and discover new Hobbies with a Click
      </p>
    </div>
  );
};
