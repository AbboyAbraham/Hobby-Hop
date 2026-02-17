import { useState, useEffect, useCallback } from 'react';
import { Project, Material, AppData } from '../types';

const STORAGE_KEY = 'hobby_hop_data_v2';

const DEFAULT_DATA: AppData = {
  projects: [],
  materials: [],
  hasSeenTutorial: false 
};

export const useHobbyStore = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedV2 = localStorage.getItem(STORAGE_KEY);
    const storedV1 = localStorage.getItem('hobby_hop_data_v1');

    if (storedV2) {
      try {
        const parsed: AppData = JSON.parse(storedV2);
        setProjects(parsed.projects || []);
        setMaterials(parsed.materials || []);
        setHasSeenTutorial(parsed.hasSeenTutorial || false);
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    } else if (storedV1) {
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
        setHasSeenTutorial(false);
      } catch (e) {
        setProjects([]);
        setMaterials([]);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        projects, 
        materials, 
        hasSeenTutorial 
      }));
    }
  }, [projects, materials, hasSeenTutorial, loaded]);

  const completeTutorial = useCallback(() => {
    setHasSeenTutorial(true);
  }, []);

  const addProject = (project: Project) => setProjects(prev => [project, ...prev]);
  const updateProject = (id: string, updates: Partial<Project>) => setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setMaterials(prev => prev.filter(m => m.projectId !== id));
  };
  const addMaterial = (material: Material) => setMaterials(prev => [...prev, material]);
  const updateMaterial = (id: string, updates: Partial<Material>) => setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const deleteMaterial = (id: string) => setMaterials(prev => prev.filter(m => m.id !== id));

  const exportData = () => {
    const dataStr = JSON.stringify({ projects, materials, hasSeenTutorial }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // FIXED: Ensured backticks are correctly closed here
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
        setHasSeenTutorial(parsed.hasSeenTutorial || false);
        return true;
      }
    } catch (e) { console.error("Import failed", e); }
    return false;
  };

  return {
    projects, materials, hasSeenTutorial, completeTutorial, loaded,
    addProject, updateProject, deleteProject, addMaterial, updateMaterial, 
    deleteMaterial, exportData, importData
  };
};
