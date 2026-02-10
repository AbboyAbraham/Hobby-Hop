import React from 'react';
import { Tab } from '../types';
import { LayoutGrid, ShoppingCart, Compass, User } from 'lucide-react';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: Tab.Hobbies, icon: LayoutGrid, label: 'Hobbies' },
    { id: Tab.Shopping, icon: ShoppingCart, label: 'Shop' },
    { id: Tab.Explore, icon: Compass, label: 'Explore' },
    { id: Tab.Account, icon: User, label: 'Account' },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 h-16 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-around z-50 shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${
              isActive ? 'text-emerald-400 -translate-y-2' : 'text-white/50 hover:text-white'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`}>
               <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {isActive && (
              <span className="absolute -bottom-2 text-[10px] font-bold tracking-wide animate-in fade-in slide-in-from-bottom-1">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};