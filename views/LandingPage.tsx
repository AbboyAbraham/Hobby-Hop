import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import DotGrid from '../components/DotGrid';
import AnimatedContent from '../components/AnimatedContent';

interface LandingPageProps {
  onStart: () => void;
  isReturningUser: boolean; // 🟢 New prop added
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, isReturningUser }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
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
        duration={0.5}
        ease="power3.out"
        initialOpacity={0}
        animateOpacity={true}
        scale={1}
        threshold={0.1}
        delay={0.2}
        disappearAfter={isExiting ? 0.01 : 0}
        disappearDuration={0.3}
        disappearEase="circ.in"
        onDisappearanceComplete={onStart}
      >
        {/* 3. STATIC CONTENT CONTAINER */}
        <div className={`relative z-10 max-w-md space-y-8 backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
          
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

          {/* CTA Buttons Container */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleStart}
              disabled={isExiting}
              className="group w-full py-4 px-6 bg-white text-slate-900 font-bold text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isReturningUser ? 'Explore New Hobbies' : (isExiting ? 'Starting...' :
