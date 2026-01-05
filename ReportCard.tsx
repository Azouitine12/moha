
import React from 'react';
import { CleaningReport, Anomaly } from '../types';

interface ReportCardProps {
  report: CleaningReport;
  anomalies: Anomaly[];
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, anomalies }) => {
  const schemaAnomalies = anomalies.filter(a => a.type === 'schema');
  const aiAnomalies = anomalies.filter(a => a.type === 'ai');

  const stats = [
    { label: 'Rule Fixes', value: report.totalChanges - report.anomaliesDetected, icon: '🛠️', color: 'slate' },
    { label: 'Schema Issues', value: report.validationIssuesCount, icon: '📋', color: 'red' },
    { label: 'AI Findings', value: report.anomaliesDetected, icon: '🧠', color: 'indigo' },
    { label: 'Duplicates', value: report.duplicatesRemoved, icon: '📑', color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-${stat.color}-50 rounded-full transition-transform group-hover:scale-110 opacity-50`}></div>
            <div className="flex items-center justify-between mb-4 relative">
              <span className="text-3xl">{stat.icon}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">Stat</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1 relative">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider relative">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schema Issues List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-bold text-red-900">Schema Violations</h3>
            </div>
            <span className="bg-red-200 text-red-800 text-[10px] px-2 py-0.5 rounded font-black">{schemaAnomalies.length} found</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar flex-1">
            {schemaAnomalies.length > 0 ? schemaAnomalies.map((anomaly, idx) => (
              <div key={idx} className="p-4 hover:bg-red-50/30 transition">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-black text-red-600 uppercase">Row {anomaly.row + 1}: {anomaly.column}</span>
                  <span className="text-[10px] font-mono text-slate-400">"{String(anomaly.value)}"</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{anomaly.reason}</p>
                <p className="text-xs text-slate-500 italic">Action: {anomaly.suggestion}</p>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 text-sm">No schema violations detected.</div>
            )}
          </div>
        </div>

        {/* AI Findings List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-bold text-indigo-900">AI Deep-Scan Results</h3>
            </div>
            <span className="bg-indigo-200 text-indigo-800 text-[10px] px-2 py-0.5 rounded font-black">{aiAnomalies.length} scan hits</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar flex-1">
            {aiAnomalies.length > 0 ? aiAnomalies.map((anomaly, idx) => (
              <div key={idx} className="p-4 hover:bg-indigo-50/30 transition">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-black text-indigo-600 uppercase">Row {anomaly.row + 1}: {anomaly.column}</span>
                  <span className="text-[10px] font-mono text-slate-400">"{String(anomaly.value)}"</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{anomaly.reason}</p>
                <p className="text-xs text-slate-500 italic">AI Tip: {anomaly.suggestion}</p>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 text-sm">No AI anomalies detected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
