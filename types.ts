export interface Material {
  id: string;
  projectId: string;
  name: string;
  price: number;
  isBought: boolean;
  link?: string;
}

export interface Note {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
}

export type ProjectStatus = 'planned' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  notes: Note[]; 
  status: ProjectStatus;
  progress: number;
  endGoal: string;
  createdAt: number;
}

export interface AppData {
  projects: Project[];
  materials: Material[];
}

export enum Tab {
  Hobbies = 'hobbies',
  Shopping = 'shopping',
  Explore = 'explore',
  Account = 'account',
}

export interface ExploreSuggestion {
  title: string;
  description: string;
  estimatedCost: string;
  difficulty: string;
  tags: string[];
}