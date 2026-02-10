import React from 'react';
import { Project } from '../types';
import { ArrowRight } from 'lucide-react';

interface Props {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<Props> = ({ project, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
    >
      <div className="h-40 w-full overflow-hidden">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="text-xs font-medium text-emerald-300 uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-md">
          {project.category}
        </span>
        <h3 className="text-xl font-bold text-white mt-2 leading-tight drop-shadow-md">
          {project.title}
        </h3>
      </div>
    </div>
  );
};