import React, { useRef } from 'react';
import { Download, Upload, User, Shield } from 'lucide-react';

interface Props {
  onExport: () => void;
  onImport: (json: string) => boolean;
}

export const Account: React.FC<Props> = ({ onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const success = onImport(result);
          if (success) {
            alert('Data imported successfully!');
          } else {
            alert('Invalid data file.');
          }
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500">
          <User size={32} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-white/50 text-sm">Manage your data</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-emerald-400" />
          Data Backup
        </h2>
        <p className="text-sm text-white/60 mb-6 leading-relaxed">
          Your data is stored locally on this device. Create a backup file to move your data to another device or keep it safe.
        </p>

        <div className="space-y-3">
          <button
            onClick={onExport}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <Download size={18} />
            Backup Data (JSON)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium border border-white/5"
          >
            <Upload size={18} />
            Import Data
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      <div className="text-center text-xs text-white/20 mt-auto pb-24">
        Hobby Hop v1.0.0
      </div>
    </div>
  );
};