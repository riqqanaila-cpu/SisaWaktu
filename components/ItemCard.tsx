
import React from 'react';
import { ExpiryItem, ExpiryStatus, StatusColors } from '../types';
import { getExpiryStatus, calculateDaysRemaining, formatDate } from '../utils/dateUtils';

interface ItemCardProps {
  item: ExpiryItem;
  onDelete: (id: string) => void;
  onMarkUsed: (id: string) => void;
  advice?: string;
  viewMode?: 'grid' | 'list';
}

const statusTheme: Record<ExpiryStatus, StatusColors> = {
  [ExpiryStatus.SAFE]: {
    bg: 'bg-white',
    text: 'text-emerald-600',
    border: 'border-slate-100',
    dot: 'bg-emerald-500',
    glow: 'shadow-emerald-100'
  },
  [ExpiryStatus.WARNING]: {
    bg: 'bg-amber-50/40',
    text: 'text-amber-600',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    glow: 'shadow-amber-100'
  },
  [ExpiryStatus.EXPIRED]: {
    bg: 'bg-rose-50/60',
    text: 'text-rose-600',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    glow: 'shadow-rose-100'
  }
};

const categoryIcons: Record<string, string> = {
  'Skincare': '✨',
  'Medicine': '💊',
  'Kitchen': '🍳',
  'Other': '📦'
};

const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete, onMarkUsed, advice, viewMode = 'list' }) => {
  const status = getExpiryStatus(item.expiryDate);
  const theme = statusTheme[status];
  const days = calculateDaysRemaining(item.expiryDate);

  if (item.isUsed) return null; // Hide used items from main list

  return (
    <div className={`p-4 rounded-[2.2rem] border-2 ${theme.border} ${theme.bg} transition-all hover:shadow-2xl ${theme.glow} relative overflow-hidden group ${viewMode === 'list' ? 'flex gap-4' : 'flex flex-col'}`}>
      {/* Product Image Section */}
      <div className={`relative shrink-0 ${viewMode === 'grid' ? 'w-full h-40 mb-3' : ''}`}>
        <div className={`${viewMode === 'grid' ? 'w-full h-full' : 'w-20 h-20'} rounded-2xl overflow-hidden bg-slate-100 border-2 ${theme.border} flex items-center justify-center`}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <span className={`${viewMode === 'grid' ? 'text-5xl' : 'text-3xl'} opacity-50`}>{categoryIcons[item.category]}</span>
          )}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${theme.dot} ${status === ExpiryStatus.WARNING ? 'animate-pulse' : ''}`} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-0.5">
                {categoryIcons[item.category]} {item.category}
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-tight truncate">{item.name}</h3>
            </div>
            <div className="flex gap-1">
              {!item.isUsed && status !== ExpiryStatus.EXPIRED && (
                <button 
                  onClick={() => onMarkUsed(item.id)}
                  title="Mark as Used"
                  className="p-1.5 rounded-xl text-emerald-500 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
              )}
              <button 
                onClick={() => onDelete(item.id)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs font-black ${theme.text}`}>
              {status === ExpiryStatus.EXPIRED ? 'EXPIRED' : 
               days === 0 ? 'HARI INI!' : 
               `${days} HARI LAGI`}
            </span>
            <span className="text-[10px] font-bold text-slate-400 italic">
              Exp: {formatDate(item.expiryDate)}
            </span>
          </div>
        </div>

        {advice && (
          <div className="mt-3 pt-3 border-t border-slate-100/50">
            <p className="text-[10px] leading-relaxed text-slate-500 font-medium line-clamp-2 italic">
              ✨ {advice}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
