
import React from 'react';
import { DataRow, Anomaly } from '../types';

interface DataTableProps {
  data: DataRow[];
  columns: string[];
  anomalies?: Anomaly[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns, anomalies = [] }) => {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 italic">
        No data to display.
      </div>
    );
  }

  const getAnomaly = (rowIndex: number, columnName: string) => {
    return anomalies.find(a => a.row === rowIndex && a.column === columnName);
  };

  return (
    <table className="w-full text-left border-collapse min-w-[800px]">
      <thead className="sticky top-0 bg-slate-100 z-10">
        <tr>
          <th className="px-4 py-3 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 bg-slate-100">#</th>
          {columns.map((col) => (
            <th key={col} className="px-4 py-3 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 50).map((row, idx) => (
          <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 transition">
            <td className="px-4 py-3 text-sm text-slate-400 font-mono">{idx + 1}</td>
            {columns.map((col) => {
              const anomaly = getAnomaly(idx, col);
              const isSchema = anomaly?.type === 'schema';
              const isAI = anomaly?.type === 'ai';
              
              return (
                <td 
                  key={col} 
                  className={`px-4 py-3 text-sm text-slate-700 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis relative ${
                    isSchema ? 'bg-red-50 text-red-900 border-red-100' : 
                    isAI ? 'bg-amber-50 text-amber-900 border-amber-100' : ''
                  }`}
                  title={anomaly ? `${anomaly.reason} - Suggestion: ${anomaly.suggestion}` : String(row[col])}
                >
                  <div className="flex items-center">
                    {row[col] === null || row[col] === '' ? (
                      <span className="text-slate-300 italic text-xs">null</span>
                    ) : String(row[col])}
                    
                    {anomaly && (
                      <span className="ml-2 inline-flex items-center">
                        <svg className={`w-3.5 h-3.5 ${isSchema ? 'text-red-500' : 'text-amber-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
      {data.length > 50 && (
        <tfoot>
          <tr>
            <td colSpan={columns.length + 1} className="p-4 text-center text-slate-500 text-sm bg-slate-50">
              Showing first 50 rows of {data.length}.
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};
