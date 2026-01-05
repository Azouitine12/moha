
import React from 'react';
import { CleaningReport } from '../types';

interface DashboardProps {
  history: CleaningReport[];
  onStartNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ history, onStartNew }) => {
  const totalCleaned = history.reduce((acc, curr) => acc + curr.rowCount, 0);
  const totalFixes = history.reduce((acc, curr) => acc + curr.totalChanges, 0);
  const avgFixRate = history.length > 0 ? (totalFixes / totalCleaned * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Health Dashboard</h1>
          <p className="text-slate-500">Overview of your data quality and processing history.</p>
        </div>
        <button 
          onClick={onStartNew}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          New Cleaning Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">Total Rows Cleaned</p>
          <div className="text-4xl font-black text-slate-900">{totalCleaned.toLocaleString()}</div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded w-fit">
            ↑ 12% this month
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-1">Total Corrections</p>
          <div className="text-4xl font-black text-slate-900">{totalFixes.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-4 italic">Automatically resolved via AI & Rules</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">Avg. Fix Rate</p>
          <div className="text-4xl font-black text-slate-900">{avgFixRate}%</div>
          <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(Number(avgFixRate), 100)}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Quality Trends</h3>
          <div className="h-64 flex items-end justify-between px-4 pb-4 bg-slate-50 rounded-xl">
            {history.length > 0 ? history.slice(0, 7).reverse().map((h, i) => (
              <div key={i} className="flex flex-col items-center group relative w-full">
                <div 
                  className="w-8 bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600 cursor-pointer" 
                  style={{ height: `${Math.max((h.totalChanges / 500) * 200, 10)}px` }}
                >
                  <div className="hidden group-hover:block absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                    {h.totalChanges} fixes
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 rotate-45 origin-left">{new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            )) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 italic">No data yet</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quality Score by Category</h3>
          <div className="space-y-4">
            {[
              { label: 'Formatting', score: 98, color: 'bg-green-500' },
              { label: 'Consistency', score: 85, color: 'bg-indigo-500' },
              { label: 'Integrity', score: 92, color: 'bg-blue-500' },
              { label: 'Uniqueness', score: 79, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.score}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
