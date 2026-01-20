
import React, { useState, useEffect, useCallback } from 'react';
import { ExpiryItem, Category, ExpiryStatus, UserSettings } from './types';
import { getItems, saveItems } from './services/storage';
import { getExpiryStatus, calculateDaysRemaining } from './utils/dateUtils';
import { getStorageAdvice } from './services/geminiService';
import ItemCard from './components/ItemCard';
import Stats from './components/Stats';
import SettingsModal from './components/SettingsModal';

const CATEGORIES: Category[] = ['Skincare', 'Medicine', 'Kitchen', 'Other'];
const DEFAULT_SETTINGS: UserSettings = {
  browserAlerts: true,
  leadDays: 3
};

const App: React.FC = () => {
  const [items, setItems] = useState<ExpiryItem[]>([]);
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState<Category>('Kitchen');
  const [isAdding, setIsAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [advices, setAdvices] = useState<Record<string, string>>({});

  // Initial load
  useEffect(() => {
    const loadedItems = getItems();
    const loadedSettings = localStorage.getItem('sisawaktu_settings');
    
    setItems(loadedItems);
    if (loadedSettings) setSettings(JSON.parse(loadedSettings));
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Sync with storage and update priority flags
  useEffect(() => {
    const itemsWithPriority = items.map(item => ({
      ...item,
      isPriority: calculateDaysRemaining(item.expiryDate) <= settings.leadDays
    }));
    
    // Only update if priority flags actually changed to avoid infinite loops
    const hasChanged = JSON.stringify(items) !== JSON.stringify(itemsWithPriority);
    if (hasChanged) {
       setItems(itemsWithPriority);
    }
    
    saveItems(items);
    localStorage.setItem('sisawaktu_settings', JSON.stringify(settings));
    
    if (settings.browserAlerts) {
      checkNotifications(items);
    }
  }, [items, settings]);

  const checkNotifications = useCallback((currentItems: ExpiryItem[]) => {
    currentItems.forEach(item => {
      const days = calculateDaysRemaining(item.expiryDate);
      // Trigger exactly at lead time
      if (days === settings.leadDays && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('SisaWaktu Priority!', {
          body: `${item.name} akan kedaluwarsa dalam ${days} hari. Pakai sebelum rugi!`,
          icon: 'https://cdn-icons-png.flaticon.com/512/564/564619.png'
        });
      }
    });
  }, [settings.leadDays]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate) return;

    const newItem: ExpiryItem = {
      id: crypto.randomUUID(),
      name,
      expiryDate,
      category,
      createdAt: Date.now(),
      isPriority: calculateDaysRemaining(expiryDate) <= settings.leadDays
    };

    setItems(prev => [newItem, ...prev]);
    setName('');
    setExpiryDate('');
    setIsAdding(false);

    const advice = await getStorageAdvice(newItem.name, newItem.category);
    setAdvices(prev => ({ ...prev, [newItem.id]: advice }));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const sortedItems = [...items].sort((a, b) => 
    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  return (
    <div className="max-w-md mx-auto min-h-screen pb-32 bg-[#FBFBFF] relative px-6 pt-12 overflow-x-hidden">
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">SisaWaktu</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Ingat Sebelum Basi • Pakai Sebelum Rugi</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-sky-500 transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </header>

      <Stats items={items} />

      <div className="space-y-5">
        {sortedItems.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-slate-100 border border-slate-50">
              <svg className="text-slate-200" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Belum Ada Catatan</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-[200px] font-medium leading-relaxed">Tap tombol di bawah untuk mulai melacak stok barangmu.</p>
          </div>
        ) : (
          sortedItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onDelete={deleteItem} 
              advice={advices[item.id]}
            />
          ))
        )}
      </div>

      {/* Quick Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 ease-out">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quick Add</h2>
              <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Barang</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Skincare/Obat/Susu..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                        category === cat 
                          ? 'bg-slate-900 text-white shadow-lg' 
                          : 'bg-white text-slate-400 border border-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal Expire</label>
                <input 
                  type="date" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none transition-all"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-sky-100 transition-all mt-4 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Tambahkan Catatan</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal 
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(newSettings) => {
            setSettings(newSettings);
            setShowSettings(false);
          }}
        />
      )}

      {/* Floating Action Button */}
      {!isAdding && (
        <button 
          onClick={() => setIsAdding(true)}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-full shadow-2xl shadow-slate-300 flex items-center gap-3 hover:scale-105 active:scale-90 transition-all z-40 group"
        >
          <div className="bg-sky-500 rounded-full p-1 group-hover:rotate-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <span className="font-black tracking-tight text-lg">Quick Add</span>
        </button>
      )}
    </div>
  );
};

export default App;
