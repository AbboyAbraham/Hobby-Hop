import { useState, useEffect, useCallback } from 'react';
import { Project, Material, AppData } from '../types';

const STORAGE_KEY = 'hobby_hop_data_v2';

// 1. Cleared default hobbies and added tutorial flag
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
        // Load the tutorial status from storage
        setHasSeenTutorial(parsed.hasSeenTutorial || false);
      } catch (e) {
        console.error("Failed to parse stored data", e);
        setProjects(DEFAULT_DATA.projects);
        setMaterials(DEFAULT_DATA.materials);
        setHasSeenTutorial(DEFAULT_DATA.hasSeenTutorial);
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
        setProjects(DEFAULT_DATA.projects);
        setMaterials(DEFAULT_DATA.materials);
        setHasSeenTutorial(false);
      }
    } else {
      // BRAND NEW USER: Use empty defaults
      setProjects(DEFAULT_DATA.projects);
      setMaterials(DEFAULT_DATA.materials);
      setHasSeenTutorial(DEFAULT_DATA.hasSeenTutorial);
    }
    setLoaded(true);
  }, []);

  // 2. Persist all data including the tutorial flag
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        projects, 
        materials, 
        hasSeenTutorial 
      }));
    }
  }, [projects, materials, hasSeenTutorial, loaded]);

  // 3. Helper to mark tutorial as finished
  const completeTutorial = useCallback(() => {
    setHasSeenTutorial(true);
  }, []);

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
    const dataStr = JSON.stringify({ projects, materials, hasSeenTutorial }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hobby-hop-
