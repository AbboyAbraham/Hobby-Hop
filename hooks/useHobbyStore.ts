import { useState, useEffect, useCallback } from 'react';
import { Project, Material, AppData, Note } from '../types';

const STORAGE_KEY = 'hobby_hop_data_v2'; // Bumped version to v2 for schema change

const DEFAULT_DATA: AppData = {
  projects: [
    {
      id: '1',
      title: 'Terrarium Building',
      description: 'Creating a moss ecosystem in a jar.',
      category: 'Gardening',
      imageUrl: 'https://picsum.photos/id/62/400/300',
      notes: [
        { id: 'n1', content: 'Need to find activated charcoal.', createdAt: Date.now() }
      ],
      status: 'in_progress',
      progress: 45,
      endGoal: 'Create a self-sustaining moss ecosystem in the 5L jar.',
      createdAt: Date.now(),
    },
    {
      id: '2',
      title: 'Oil Painting',
      description: 'Learning landscape techniques.',
      category: 'Art',
      imageUrl: 'https://picsum.photos/id/104/400/300',
      notes: [
        { id: 'n2', content: 'Focus on color mixing this week.', createdAt: Date.now() - 100000 }
      ],
      status: 'planned',
      progress: 10,
      endGoal: 'Complete a replica of a Bob Ross mountain scene.',
      createdAt: Date.now() - 100000,
    }
  ],
  materials: [
    { id: 'm1', projectId: '1', name: 'Glass Jar', price: 15.50, isBought: true },
    { id: 'm2', projectId: '1', name: 'Moss Pack', price: 8.00, isBought: false },
    { id: 'm3', projectId: '2', name: 'Canvas Set', price: 25.00, isBought: false },
    { id: 'm4', projectId: '2', name: 'Oil Paint Set', price: 45.00, isBought: true },
  ]
};

export const useHobbyStore = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check v1 data first to migrate if needed, otherwise look for v2
    const storedV2 = localStorage.getItem(STORAGE_KEY);
    const storedV1 = localStorage.getItem('hobby_hop_data_v1');

    if (storedV2) {
      try {
        const parsed: AppData = JSON.parse(storedV2);
        setProjects(parsed.projects);
        setMaterials(parsed.materials);
      } catch (e) {
        console.error("Failed to parse stored data", e);
        setProjects(DEFAULT_DATA.projects);
        setMaterials(DEFAULT_DATA.materials);
      }
    } else if (storedV1) {
      // Migration logic: convert string notes to array, add defaults for new fields
      try {
        const parsedV1 = JSON.parse(storedV1);
        const migratedProjects = parsedV1.projects.map((p: any) => ({
          ...p,
          notes: typeof p.notes === 'string' 
            ? [{ id: crypto.randomUUID(), content: p.notes, createdAt: Date.now() }] 
            : [],
          status: 'in_progress',
          progress: 0,
          endGoal: 'No goal set yet.'
        }));
        setProjects(migratedProjects);
        setMaterials(parsedV1.materials);
      } catch (e) {
        setProjects(DEFAULT_DATA.projects);
        setMaterials(DEFAULT_DATA.materials);
      }
    } else {
      setProjects(DEFAULT_DATA.projects);
      setMaterials(DEFAULT_DATA.materials);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, materials }));
    }
  }, [projects, materials, loaded]);

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setMaterials(prev => prev.filter(m => m.projectId !== id));
  };

  const addMaterial = (material: Material) => {
    setMaterials(prev => [...prev, material]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ projects, materials }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hobby-hop-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (jsonData: string) => {
    try {
      const parsed: AppData = JSON.parse(jsonData);
      if (Array.isArray(parsed.projects) && Array.isArray(parsed.materials)) {
        setProjects(parsed.projects);
        setMaterials(parsed.materials);
        return true;
      }
    } catch (e) {
      console.error("Import failed", e);
    }
    return false;
  };

  return {
    projects,
    materials,
    addProject,
    updateProject,
    deleteProject,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    exportData,
    importData
  };
};