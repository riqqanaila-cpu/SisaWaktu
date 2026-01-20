
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExpiryItem, Category, ExpiryStatus, UserSettings, ViewMode } from './types';
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
  const [price, setPrice] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [isAdding, setIsAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [advices, setAdvices] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState<Category | 'Semua'>('Semua');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadedItems = getItems();
    const loadedSettings = localStorage.getItem('sisawaktu_settings');
    setItems(loadedItems);
    if (loadedSettings) setSettings(JSON.parse(loadedSettings));
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    saveItems(items);
    localStorage.setItem('sisawaktu_settings', JSON.stringify(settings));
    if (settings.browserAlerts) checkNotifications(items);
  }, [items, settings]);

  const checkNotifications = useCallback((currentItems: ExpiryItem[]) => {
    currentItems.forEach(item => {
      if (item.isUsed) return;
      const days = calculateDaysRemaining(item.expiryDate);
      if (days === settings.leadDays && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('SisaWaktu Priority!', {
          body: `${item.name} akan kedaluwarsa dalam ${days} hari. Pakai sebelum rugi!`,
          icon: item.imageUrl || 'https://cdn-icons-png.flaticon.com/512/564/564619.png'
        });
      }
    });
  }, [settings.leadDays]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate) return;

    const newItem: ExpiryItem = {
      id: crypto.randomUUID(),
      name,
      expiryDate,
      category,
      imageUrl,
      price: price ? parseFloat(price) : 0,
      createdAt: Date.now(),
      isPriority: calculateDaysRemaining(expiryDate) <= settings.leadDays
    };

    setItems(prev => [newItem, ...prev]);
    setName('');
    setExpiryDate('');
    setPrice('');
    setImageUrl(undefined);
    setIsAdding(false);

    const advice = await getStorageAdvice(newItem.name, newItem.category);
    setAdvices(prev => ({ ...prev, [newItem.id]: advice }));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const markUsed = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isUsed: true } : i));
  };

  // Gamification: "Waste Warrior" logic
  const usedCount = items.filter(i => i.isUsed).length;
  const badge = usedCount >= 10 ? '👑 The Waste Warrior' : usedCount >= 5 ? '🛡️ Salvage Expert' : usedCount >= 1 ? '🌱 Green Saver' : 'Novice Tracker';

  const filteredItems = items.filter(i => !i.isUsed && (activeTab === 'Semua' || i.category === activeTab));
  const sortedItems = [...filteredItems].sort((a, b) => 
    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  // Dynamic Suggestion based on first warning item
  const warningItem = sortedItems.find(i => getExpiryStatus(i.expiryDate) === ExpiryStatus.WARNING);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fcfdff] relative overflow-x-hidden font-sans pb-40">
      {/* Decorative background blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-[30%] right-[-120px] w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-sky-50 to-transparent opacity-50 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/20 px-6 py-5 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-sky-600 bg-clip-text text-transparent tracking-tighter">SisaWaktu</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{badge}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="p-3 bg-white/50 rounded-2xl border border-white text-slate-400 hover:text-sky-600 transition-all shadow-sm"
          >
            {viewMode === 'grid' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            )}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white/50 rounded-2xl border border-white text-slate-500 hover:text-sky-500 transition-all active:scale-90 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </header>

      <main className="px-6 pt-6 relative z-10">
        <Stats items={items} />

        {/* Smart Suggestion Widget */}
        {warningItem && (
          <div className="mb-8 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] border border-amber-100 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-top duration-700">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">💡</div>
            <div>
              <h4 className="text-sm font-black text-amber-800">Cepat Pakai!</h4>
              <p className="text-[11px] text-amber-700 leading-tight mt-1 font-medium">
                <span className="font-bold">{warningItem.name}</span> segera basi. {warningItem.category === 'Kitchen' ? 'Yuk masak sesuatu hari ini!' : 'Jangan lupa dipakai malam ini ya!'}
              </p>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
          {['Semua', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat as any)}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap shadow-sm border ${
                activeTab === cat 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-400 border-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Item List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
          {sortedItems.length === 0 ? (
            <div className="col-span-2 text-center py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3.5rem]">
              <div className="text-5xl mb-4 grayscale opacity-50">📦</div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Kategori Ini Kosong</h2>
              <p className="text-slate-400 text-[10px] mt-2 max-w-[180px] mx-auto font-bold uppercase tracking-widest">Aman untuk saat ini</p>
            </div>
          ) : (
            sortedItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onDelete={deleteItem} 
                onMarkUsed={markUsed}
                advice={advices[item.id]}
                viewMode={viewMode}
              />
            ))
          )}
        </div>

        {/* Rotating Educational Tips Footer */}
        <footer className="mt-20 pt-10 border-t border-slate-100 mb-10">
          <div className="bg-sky-50/50 p-6 rounded-[2.5rem] border border-sky-100">
            <h5 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3 text-center">Edukasi SisaWaktu</h5>
            <p className="text-xs text-slate-600 text-center leading-relaxed font-medium">
              "Tahukah kamu? Simpan skincare di tempat sejuk agar masa simpannya lebih stabil. Hindari sinar matahari langsung!"
            </p>
          </div>
        </footer>
      </main>

      {/* Quick Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 ease-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tambah Barang</h2>
              <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="flex gap-4 items-center">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden shrink-0 group relative"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <svg className="text-slate-300 group-hover:text-sky-500 transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                      <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Photo</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </button>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Barang</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Susu, Toner, dll..."
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Estimasi Harga</label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Rp"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal Expire</label>
                  <input 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${
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

              <button 
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-5 rounded-[2.2rem] shadow-xl shadow-sky-100 transition-all mt-4 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Mulai Melacak</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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

      {/* Sticky Bottom Nav / Add Button */}
      <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none z-40">
        <button 
          onClick={() => setIsAdding(true)}
          className="pointer-events-auto bg-slate-900 text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-90 transition-all group"
        >
          <div className="bg-sky-500 rounded-full p-1 group-hover:rotate-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <span className="font-black tracking-tighter text-lg">Quick Add</span>
        </button>
      </div>
    </div>
  );
};

export default App;
