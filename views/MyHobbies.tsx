import React, { useState } from 'react';
import { Project, Material, ProjectStatus, Note } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { Plus, X, Trash2, ArrowLeft, MoreVertical, Image as ImageIcon, Send, Check } from 'lucide-react';

interface Props {
  projects: Project[];
  materials: Material[];
  onAddProject: (p: Project) => void;
  onUpdateProject: (id: string, p: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onAddMaterial: (m: Material) => void;
  onUpdateMaterial: (id: string, m: Partial<Material>) => void;
  onDeleteMaterial: (id: string) => void;
}

export const MyHobbies: React.FC<Props> = ({
  projects,
  materials,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Creation State
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('');

  // Detail View State
  const [detailTab, setDetailTab] = useState<'notes' | 'materials'>('notes');
  const [showMenu, setShowMenu] = useState(false);
  
  // Note Creation State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteImage, setNewNoteImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  // Material Creation State
  const [newMaterialName, setNewMaterialName] = useState('');

  // Derived Data
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectMaterials = materials.filter(m => m.projectId === selectedProjectId);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: newProjectTitle,
      category: newProjectCategory || 'General',
      description: '',
      notes: [],
      imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
      status: 'planned',
      progress: 0,
      endGoal: 'Set a goal for this project...',
      createdAt: Date.now(),
    };
    onAddProject(newProject);
    setNewProjectTitle('');
    setNewProjectCategory('');
    setIsAdding(false);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim() || !selectedProjectId) return;

    const newMaterial: Material = {
      id: crypto.randomUUID(),
      projectId: selectedProjectId,
      name: newMaterialName,
      price: 0,
      isBought: false
    };
    onAddMaterial(newMaterial);
    setNewMaterialName('');
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim() && !newNoteImage.trim()) return;
    if (!selectedProjectId || !selectedProject) return;

    const note: Note = {
      id: crypto.randomUUID(),
      content: newNoteContent,
      imageUrl: newNoteImage || undefined,
      createdAt: Date.now()
    };

    onUpdateProject(selectedProjectId, {
      notes: [note, ...selectedProject.notes]
    });
    setNewNoteContent('');
    setNewNoteImage('');
    setShowImageInput(false);
  };

  // Status Menu Actions
  const handleStatusChange = (status: ProjectStatus) => {
    if (selectedProjectId) {
      onUpdateProject(selectedProjectId, { status });
      setShowMenu(false);
    }
  };

  const handleDelete = () => {
    if (selectedProjectId && confirm('Are you sure you want to delete this project?')) {
      onDeleteProject(selectedProjectId);
      setSelectedProjectId(null);
      setShowMenu(false);
    }
  };

  // Detail View
  if (selectedProject) {
    return (
      <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative">
          <button 
            onClick={() => setSelectedProjectId(null)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 w-48 bg-[#0f2c1b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                 <div className="p-2 space-y-1">
                   {(['planned', 'in_progress', 'completed'] as ProjectStatus[]).map((status) => (
                     <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group hover:bg-white/5 transition-colors ${selectedProject.status === status ? 'text-emerald-400 font-medium' : 'text-white/70'}`}
                     >
                       <span className="capitalize">{status.replace('_', ' ')}</span>
                       {selectedProject.status === status && <Check size={14} />}
                     </button>
                   ))}
                   <div className="h-px bg-white/10 my-1" />
                   <button 
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                   >
                     <Trash2 size={14} />
                     Delete Project
                   </button>
                 </div>
              </div>
            )}
            {/* Click outside closer overlay */}
            {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
          </div>
        </div>

        {/* Hero Image & Title */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 shadow-lg border border-white/10 flex-shrink-0">
           <img 
            src={selectedProject.imageUrl} 
            alt={selectedProject.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
             <div className="flex justify-between items-end">
               <div>
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-3xl font-bold text-white drop-shadow-sm mt-1">{selectedProject.title}</h2>
               </div>
               <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md ${
                 selectedProject.status === 'completed' ? 'bg-emerald-500 text-white' : 
                 selectedProject.status === 'in_progress' ? 'bg-blue-500/50 text-blue-100' : 
                 'bg-white/10 text-white/70'
               }`}>
                 {selectedProject.status.replace('_', ' ')}
               </div>
             </div>
          </div>
        </div>

        {/* Goal & Progress Section */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm mb-6 flex-shrink-0">
          <div className="mb-3">
            <label className="text-xs text-emerald-300 font-semibold uppercase tracking-wider mb-1 block">End Goal</label>
            <input 
              className="w-full bg-transparent border-none p-0 text-white/90 focus:ring-0 placeholder-white/30 text-sm"
              value={selectedProject.endGoal || ''}
              onChange={(e) => onUpdateProject(selectedProject.id, { endGoal: e.target.value })}
              placeholder="What do you want to achieve?"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
               <label className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Progress</label>
               <span className="text-xs text-white/70 font-mono">{selectedProject.progress || 0}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={selectedProject.progress || 0}
              onChange={(e) => onUpdateProject(selectedProject.id, { progress: parseInt(e.target.value) })}
              className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-white/10 mb-4 flex-shrink-0">
          <button 
            onClick={() => setDetailTab('notes')}
            className={`pb-2 text-sm font-medium transition-colors relative ${detailTab === 'notes' ? 'text-emerald-400' : 'text-white/50 hover:text-white'}`}
          >
            Notes
            {detailTab === 'notes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full" />}
          </button>
          <button 
            onClick={() => setDetailTab('materials')}
            className={`pb-2 text-sm font-medium transition-colors relative ${detailTab === 'materials' ? 'text-emerald-400' : 'text-white/50 hover:text-white'}`}
          >
            Materials
            {detailTab === 'materials' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pb-24 min-h-0">
          
          {/* NOTES TAB */}
          {detailTab === 'notes' && (
            <div className="space-y-4">
              {/* Post Note Input */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <textarea
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 resize-none focus:outline-none h-20 mb-2"
                  placeholder="Share an update or idea..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
                
                {showImageInput && (
                   <input 
                    type="text"
                    className="w-full bg-black/20 rounded-lg px-3 py-2 text-xs text-white mb-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="Paste Image URL..."
                    value={newNoteImage}
                    onChange={(e) => setNewNoteImage(e.target.value)}
                    autoFocus
                   />
                )}

                <div className="flex justify-between items-center">
                   <button 
                    onClick={() => setShowImageInput(!showImageInput)}
                    className={`p-2 rounded-lg transition-colors ${showImageInput ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-white/10 text-white/60'}`}
                   >
                     <ImageIcon size={18} />
                   </button>
                   <button 
                    onClick={handleAddNote}
                    disabled={!newNoteContent.trim() && !newNoteImage.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                   >
                     Post <Send size={14} />
                   </button>
                </div>
              </div>

              {/* Notes Feed */}
              <div className="space-y-4">
                {selectedProject.notes.length === 0 && (
                  <p className="text-white/30 text-center py-8 text-sm">No notes yet. Start documenting!</p>
                )}
                {selectedProject.notes.map(note => (
                  <div key={note.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    {note.imageUrl && (
                      <div className="w-full h-48 overflow-hidden">
                        <img src={note.imageUrl} alt="Note attachment" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-white/90 text-sm whitespace-pre-wrap">{note.content}</p>
                      <p className="text-white/30 text-xs mt-3 text-right">
                        {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MATERIALS TAB */}
          {detailTab === 'materials' && (
            <div className="space-y-4">
               <form onSubmit={handleAddMaterial} className="flex gap-2">
                <input
                  type="text"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  placeholder="Add item (e.g., Wood Glue)"
                  className="flex-1 bg-black/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors"
                >
                  <Plus size={20} />
                </button>
              </form>

              <div className="space-y-2">
                {projectMaterials.length === 0 && (
                  <p className="text-white/40 text-center py-8 text-sm">No materials needed yet.</p>
                )}
                {projectMaterials.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateMaterial(m.id, { isBought: !m.isBought })}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          m.isBought 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-white/30 text-transparent hover:border-emerald-400'
                        }`}
                      >
                        <Check size={14} />
                      </button>
                      <span className={`${m.isBought ? 'line-through text-white/40' : 'text-white'}`}>
                        {m.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs text-emerald-300 font-mono">
                         ${(m.price || 0).toFixed(2)}
                       </span>
                      <button 
                        onClick={() => onDeleteMaterial(m.id)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // List View (Unchanged essentially, but utilizing new fields slightly indirectly via types)
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Hobbies</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-white text-emerald-900 rounded-full p-2 shadow-lg hover:bg-emerald-50 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-white/10 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleCreateProject} className="space-y-3">
            <h3 className="font-semibold text-white/90">New Project</h3>
            <input
              type="text"
              placeholder="Project Title (e.g., Knitting Scarf)"
              className="w-full bg-black/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              placeholder="Category (Optional)"
              className="w-full bg-black/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={newProjectCategory}
              onChange={(e) => setNewProjectCategory(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-24 overflow-y-auto">
        {projects.length === 0 && !isAdding && (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-20 text-white/40">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
               <span className="text-3xl">🌱</span>
             </div>
             <p className="text-lg">No hobbies yet.</p>
             <p className="text-sm mt-2">Start a new project or explore ideas!</p>
          </div>
        )}
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onClick={() => setSelectedProjectId(project.id)} 
          />
        ))}
      </div>
    </div>
  );
};