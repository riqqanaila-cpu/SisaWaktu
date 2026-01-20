
import React from 'react';
import { ExpiryItem, ExpiryStatus } from '../types';
import { getExpiryStatus } from '../utils/dateUtils';

interface StatsProps {
  items: ExpiryItem[];
}

const Stats: React.FC<StatsProps> = ({ items }) => {
  const total = items.length;
  const expiredCount = items.filter(i => getExpiryStatus(i.expiryDate) === ExpiryStatus.EXPIRED).length;
  const warningCount = items.filter(i => getExpiryStatus(i.expiryDate) === ExpiryStatus.WARNING).length;
  const safeCount = items.filter(i => getExpiryStatus(i.expiryDate) === ExpiryStatus.SAFE).length;
  
  const safePercentage = total > 0 ? Math.round((safeCount / total) * 100) : 100;
  
  // Calculate total "Saved" money from items marked as used
  const totalSaved = items.filter(i => i.isUsed).reduce((acc, curr) => acc + (curr.price || 0), 0);

  return (
    <div className="space-y-6 mb-10">
      <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        {/* Circular Progress */}
        <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * safePercentage) / 100}
              strokeLinecap="round"
              className="text-emerald-500 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-slate-800">{safePercentage}%</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Aman</span>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Terselamatkan</h4>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-emerald-600">Rp</span>
            <span className="text-2xl font-black text-slate-900">{totalSaved.toLocaleString('id-ID')}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight">
            Kamu telah menyelamatkan budget dari barang yang basi!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100 flex flex-col items-center">
          <span className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter mb-1">Safe</span>
          <span className="text-xl font-black text-emerald-700">{safeCount}</span>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100 flex flex-col items-center">
          <span className="text-[10px] text-amber-600 font-black uppercase tracking-tighter mb-1">Near</span>
          <span className="text-xl font-black text-amber-700">{warningCount}</span>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-3xl border border-rose-100 flex flex-col items-center">
          <span className="text-[10px] text-rose-600 font-black uppercase tracking-tighter mb-1">Expired</span>
          <span className="text-xl font-black text-rose-700">{expiredCount}</span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
