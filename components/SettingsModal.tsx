
import React from 'react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [tempSettings, setTempSettings] = React.useState<UserSettings>(settings);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl overflow-hidden relative">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Pengaturan Alert</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Browser Notifications</p>
              <p className="text-xs text-slate-500">Dapatkan alert langsung di HP/PC</p>
            </div>
            <button 
              onClick={() => setTempSettings({ ...tempSettings, browserAlerts: !tempSettings.browserAlerts })}
              className={`w-12 h-6 rounded-full transition-colors relative ${tempSettings.browserAlerts ? 'bg-sky-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${tempSettings.browserAlerts ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-slate-800">Waktu Pengingat</p>
              <span className="text-sky-600 font-bold bg-sky-50 px-2 py-1 rounded-lg text-sm">H-{tempSettings.leadDays}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="14" 
              value={tempSettings.leadDays}
              onChange={(e) => setTempSettings({ ...tempSettings, leadDays: parseInt(e.target.value) })}
              className="w-full accent-sky-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
              <span>1 Hari</span>
              <span>14 Hari</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-slate-500 font-bold text-sm"
          >
            Batal
          </button>
          <button 
            onClick={() => onSave(tempSettings)}
            className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
