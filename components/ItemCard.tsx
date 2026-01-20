
import React from 'react';
import { ExpiryItem, ExpiryStatus, StatusColors } from '../types';
import { getExpiryStatus, calculateDaysRemaining, formatDate } from '../utils/dateUtils';

interface ItemCardProps {
  item: ExpiryItem;
  onDelete: (id: string) => void;
  advice?: string;
}

const statusTheme: Record<ExpiryStatus, StatusColors> = {
  [ExpiryStatus.SAFE]: {
    bg: 'bg-white',
    text: 'text-emerald-600',
    border: 'border-slate-100',
    dot: 'bg-emerald-500'
  },
  [ExpiryStatus.WARNING]: {
    bg: 'bg-amber-50/30',
    text: 'text-amber-600',
    border: 'border-amber-100',
    dot: 'bg-amber-500'
  },
  [ExpiryStatus.EXPIRED]: {
    bg: 'bg-rose-50/50',
    text: 'text-rose-600',
    border: 'border-rose-100',
    dot: 'bg-rose-500'
  }
};

const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete, advice }) => {
  const status = getExpiryStatus(item.expiryDate);
  const theme = statusTheme[status];
  const days = calculateDaysRemaining(item.expiryDate);

  return (
    <div className={`p-5 rounded-[2rem] border ${theme.border} ${theme.bg} transition-all hover:shadow-xl hover:shadow-slate-200/50 relative overflow-hidden group`}>
      {item.isPriority && status !== ExpiryStatus.EXPIRED && (
        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
          Priority Alert
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {item.category}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 leading-none">{item.name}</h3>
        </div>
        <button 
          onClick={() => onDelete(item.id)}
          className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${theme.dot} ${status === ExpiryStatus.WARNING ? 'animate-pulse' : ''}`} />
          <span className={`text-sm font-black ${theme.text}`}>
            {status === ExpiryStatus.EXPIRED ? 'EXPIRED' : 
             days === 0 ? 'HARI INI!' : 
             `${days} HARI LAGI`}
          </span>
        </div>
        <div className="text-xs font-medium text-slate-400">
          Exp: {formatDate(item.expiryDate)}
        </div>
      </div>

      {advice && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3 items-start">
          <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
            <svg className="text-sky-500" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 font-medium italic">
            {advice}
          </p>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
