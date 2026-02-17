import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import DotGrid from '../components/DotGrid';
import AnimatedContent from '../components/AnimatedContent';

interface LandingPageProps {
  onStart: () => void;
  isReturningUser: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, isReturningUser }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden bg-slate-900">
      
      {/* 1. BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-60">
        <DotGrid
          dotSize={3}
          gap={25}
          baseColor="#113320" 
          activeColor="#588b89"
          shockStrength={10}
        />
      </div>

      {/* 2. ANIMATION WRAPPER */}
      <AnimatedContent
        distance={80}
        direction="vertical"
        reverse={true}
        duration={0.8}
        ease="power2.out"
        initialOpacity={0}
        animateOpacity={true}
        scale={1}
        threshold={0.1}
        delay={0.1}
        disappearAfter={isExiting ? 0.01 : 0}
        disappearDuration={0.4}
        disappearEase="circ.in"
        onDisappearanceComplete={onStart}
      >
        {/* 3. CONTENT CARD */}
        <div className={`relative z-10 max-w-md space-y-8 backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
          
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-hopTeal to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Hobby Hop
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Discover your next passion. Plan your projects. Track your progress.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleStart}
              disabled={isExiting}
              className="group w-full py-4 px-6 bg-white text-slate-900 font-bold text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isReturningUser ? 'Explore New Hobbies' : (isExiting ? 'Starting...' : 'Get Started')}
              {!isExiting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>

            {isReturningUser && (
              <button
                onClick={handleStart}
                disabled={isExiting}
                className="w-full py-3 px-6 bg-transparent text-white/70 border border-white/10 font-semibold rounded-xl hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
              >
                Continue Tracking
              </button>
            )}
          </div>
        </div>
      </AnimatedContent>
      
      <p className={`absolute bottom-8 text-sm text-white/30 z-10 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        Track your Hobbies, Shopping cart and discover new Hobbies with a Click
      </p>
    </div>
  );
};
