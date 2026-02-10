import React, { useState } from 'react';
import { useHobbyStore } from './hooks/useHobbyStore';
import { BottomNav } from './components/BottomNav';
import { MyHobbies } from './views/MyHobbies';
import { ShoppingList } from './views/ShoppingList';
import { Explore } from './views/Explore';
import { Account } from './views/Account';
import { Tab } from './types';

const App: React.FC = () => {
  const store = useHobbyStore();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Hobbies);

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
    <div className="min-h-screen text-white pb-20 overflow-hidden relative">
      {/* Decorative Gradient Overlay for softer feel */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/20" />
      
      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto h-screen p-4 md:p-6 relative z-10">
        {renderContent()}
      </main>

      {/* Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;