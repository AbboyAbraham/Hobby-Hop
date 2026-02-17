import React, { useState, useEffect } from 'react';
import { useHobbyStore } from './hooks/useHobbyStore';
import { BottomNav } from './components/BottomNav';
import { MyHobbies } from './views/MyHobbies';
import { ShoppingList } from './views/ShoppingList';
import { Explore } from './views/Explore';
import { Account } from './views/Account';
import { LandingPage } from './views/LandingPage';
import { Tab } from './types';
import AnimatedContent from './components/AnimatedContent'; // Reuse your animation component

const App: React.FC = () => {
  const store = useHobbyStore();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Hobbies);
  const [showLanding, setShowLanding] = useState(true);

  // 1. Sync Landing Page with Tutorial status
  // If they've seen the tutorial, they've likely used the app, so skip landing.
  useEffect(() => {
    if (store.loaded && store.hasSeenTutorial) {
      setShowLanding(false);
    }
  }, [store.loaded, store.hasSeenTutorial]);

  // 2. Prevent UI flickering while loading localStorage
  if (!store.loaded) {
    return <div className="min-h-screen bg-slate-900" />; 
  }

  // 3. The Gatekeeper
  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Hobbies:
        return (
          <MyHobbies
            projects={store.projects}
            materials={store.materials}
            onAddProject={store.addProject}
            onUpdateProject={store.updateProject}
            onDeleteProject={store.deleteProject}
            onAddMaterial={store.addMaterial}
            onUpdateMaterial={store.updateMaterial}
            onDeleteMaterial={store.deleteMaterial}
          />
        );
      case Tab.Shopping:
        return (
          <ShoppingList 
            projects={store.projects}
            materials={store.materials}
            onUpdateMaterial={store.updateMaterial}
          />
        );
      case Tab.Explore:
        return (
          <Explore 
            projects={store.projects}
            onAddProject={store.addProject}
          />
        );
      case Tab.Account:
        return (
          <Account 
            onExport={store.exportData}
            onImport={store.importData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-white pb-20 overflow-hidden relative bg-slate-900">
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/20" />
      
      <main className="max-w-2xl mx-auto h-screen p-4 md:p-6 relative z-10">
        {renderContent()}
      </main>

      {/* 4. FIRST-TIME TUTORIAL OVERLAY */}
      {!store.hasSeenTutorial && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <AnimatedContent 
            distance={40} 
            direction="vertical" 
            reverse={true} 
            duration={0.8}
          >
            <div className="bg-slate-800 border border-white/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Quick Tutorial</h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Welcome to Hobby Hop! Use the **Explore** tab to find new hobbies with AI, and track your progress here in **My Hobbies**.
              </p>
              <button 
                onClick={store.completeTutorial}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-teal-50 transition-colors"
              >
                Get Started
              </button>
            </div>
          </AnimatedContent>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
