import React, { useMemo, useState } from 'react';
import { Project, Material } from '../types';
import { Tag, DollarSign, CheckCircle } from 'lucide-react';

interface Props {
  projects: Project[];
  materials: Material[];
  onUpdateMaterial: (id: string, m: Partial<Material>) => void;
}

type SortMode = 'project' | 'price';

export const ShoppingList: React.FC<Props> = ({ projects, materials, onUpdateMaterial }) => {
  const [sortMode, setSortMode] = useState<SortMode>('project');

  // Filter only materials needed (not bought)
  const materialsToBuy = useMemo(() => materials.filter(m => !m.isBought), [materials]);
  
  // Calculate totals
  const totalCost = useMemo(() => {
    return materialsToBuy.reduce((sum, m) => sum + (m.price || 0), 0);
  }, [materialsToBuy]);

  // Grouping Logic
  const groupedMaterials = useMemo(() => {
    if (sortMode === 'project') {
      // Group by Project ID
      const groups: Record<string, Material[]> = {};
      materialsToBuy.forEach(m => {
        if (!groups[m.projectId]) groups[m.projectId] = [];
        groups[m.projectId].push(m);
      });
      return Object.entries(groups).map(([projectId, items]) => ({
        key: projectId,
        title: projects.find(p => p.id === projectId)?.title || 'Unknown Project',
        items: items,
        total: items.reduce((sum, i) => sum + (i.price || 0), 0)
      }));
    } else {
      // "Price" sort is just a single list sorted by price descending
      return [{
        key: 'all',
        title: 'All Items (Price High to Low)',
        items: [...materialsToBuy].sort((a, b) => (b.price || 0) - (a.price || 0)),
        total: totalCost
      }];
    }
  }, [sortMode, materialsToBuy, projects, totalCost]);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Shopping List</h1>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 bg-white/5 p-1 rounded-xl border border-white/10">
        <button
          onClick={() => setSortMode('project')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            sortMode === 'project' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'text-white/60 hover:text-white'
          }`}
        >
          By Project
        </button>
        <button
          onClick={() => setSortMode('price')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            sortMode === 'price' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'text-white/60 hover:text-white'
          }`}
        >
          By Price
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 space-y-6">
        {materialsToBuy.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-white/40">
            <CheckCircle size={48} className="mb-4 text-emerald-500/50" />
            <p className="text-lg">All caught up!</p>
            <p className="text-sm">Nothing to buy right now.</p>
          </div>
        )}

        {groupedMaterials.map((group) => (
          <div key={group.key} className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
            <div className="p-4 bg-white/5 flex justify-between items-center border-b border-white/5">
              <h2 className="font-bold text-lg text-emerald-100">{group.title}</h2>
              <span className="text-sm font-mono bg-emerald-900/40 text-emerald-300 px-2 py-1 rounded">
                ${group.total.toFixed(2)}
              </span>
            </div>
            
            <div className="divide-y divide-white/5">
              {group.items.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                       onClick={() => onUpdateMaterial(item.id, { isBought: true })}
                       className="w-6 h-6 rounded-full border border-white/30 hover:border-emerald-400 hover:bg-emerald-500/20 transition-all flex-shrink-0"
                    />
                    <span className="text-white/90">{item.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-1 border border-white/5 focus-within:border-emerald-500/50 transition-colors">
                    <span className="text-white/40 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price || ''}
                      onChange={(e) => onUpdateMaterial(item.id, { price: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      className="w-16 bg-transparent text-right text-sm focus:outline-none font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Total Footer */}
      <div className="absolute bottom-20 left-4 right-4 bg-emerald-900/90 backdrop-blur-xl p-4 rounded-2xl border border-emerald-500/30 shadow-2xl flex justify-between items-center">
        <span className="text-emerald-200 font-medium">Grand Total</span>
        <span className="text-2xl font-bold text-white font-mono">${totalCost.toFixed(2)}</span>
      </div>
    </div>
  );
};