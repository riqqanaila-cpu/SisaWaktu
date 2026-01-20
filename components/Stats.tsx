
import React from 'react';
import { ExpiryItem, ExpiryStatus } from '../types';
import { getExpiryStatus } from '../utils/dateUtils';

interface StatsProps {
  items: ExpiryItem[];
}

const Stats: React.FC<StatsProps> = ({ items }) => {
  const expiredCount = items.filter(i => getExpiryStatus(i.expiryDate) === ExpiryStatus.EXPIRED).length;
  const warningCount = items.filter(i => getExpiryStatus(i.expiryDate) === ExpiryStatus.WARNING).length;
  const safeCount = items.filter(i => getExpiryStatus(i.expiryDate) === ExpiryStatus.SAFE).length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <span className="text-xs text-slate-500 font-medium mb-1">Aman</span>
        <span className="text-2xl font-bold text-emerald-600">{safeCount}</span>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <span className="text-xs text-slate-500 font-medium mb-1">Segera</span>
        <span className="text-2xl font-bold text-amber-500">{warningCount}</span>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <span className="text-xs text-slate-500 font-medium mb-1">Basi</span>
        <span className="text-2xl font-bold text-rose-500">{expiredCount}</span>
      </div>
    </div>
  );
};

export default Stats;
