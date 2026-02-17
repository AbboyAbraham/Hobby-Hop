import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import DotGrid from '../components/DotGrid';
import AnimatedContent from '../components/AnimatedContent';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  // New state to trigger the exit animation locally
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    // The onDisappearanceComplete callback in AnimatedContent 
    // will eventually call the original onStart prop.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden bg-slate-900">
      
      {/* 1. INTERACTIVE BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 opacity-60">
        <DotGrid
          dotSize={3}
          gap={25}
          baseColor="#113320" 
          activeColor="#588b89"
          shockStrength={10}
        />
      </div>

      {/* 2. ENTRANCE & EXIT ANIMATION WRAPPER */}
      <AnimatedContent
        distance={150}
        direction="vertical"
        reverse={true}
        duration={1.2}
        ease="power3.out"
        initialOpacity={0}
        animateOpacity={true}
        scale={1}
        threshold={0.1}
        delay={0.2}
        // EXIT LOGIC:
        disappearAfter={isExiting ? 0.01 : 0} // Trigger exit when isExiting is true
        disappearDuration={0.8}
        disappearEase="power3.inOut"
        onDisappearanceComplete={onStart} // Switch pages ONLY after animation finishes
      >
        {/* 3. STATIC CONTENT CONTAINER */}
        <div className={`relative z-10 max-w-md space-y-8 backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
          
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
            onClick={handleStart}
            disabled={isExiting}
            className="group w-full py-4 px-6 bg-white text-slate-900 font-bold text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExiting ? 'Starting...' : 'Get Started'}
            {!isExiting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>

        </div>
      </AnimatedContent>
      
      {/* Footer Text - Fades out manually when exiting */}
      <p className={`absolute bottom-8 text-sm text-white/30 z-10 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        Track your Hobbies, Shopping cart and discover new Hobbies with a Click
      </p>
    </div>
  );
};
