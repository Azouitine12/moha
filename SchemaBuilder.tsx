
import React from 'react';
import { SchemaField, FieldType } from '../types';

interface SchemaBuilderProps {
  columns: string[];
  schema: SchemaField[];
  onChange: (schema: SchemaField[]) => void;
}

export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ columns, schema, onChange }) => {
  const addField = (column: string) => {
    if (schema.find(f => f.name === column)) return;
    onChange([...schema, { name: column, type: 'string', required: false }]);
  };

  const removeField = (name: string) => {
    onChange(schema.filter(f => f.name !== name));
  };

  const updateField = (name: string, updates: Partial<SchemaField>) => {
    onChange(schema.map(f => f.name === name ? { ...f, ...updates } : f));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Schema Validation Builder
        </h3>
        <div className="text-xs text-slate-500 font-medium">
          Define rules for your columns
        </div>
      </div>

      <div className="p-6">
        {schema.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm mb-4">No validation rules defined yet.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {columns.map(col => (
                <button
                  key={col}
                  onClick={() => addField(col)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-colors border border-slate-200"
                >
                  + {col}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {schema.map(field => (
              <div key={field.name} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex-1 min-w-[120px]">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Column</span>
                  <span className="font-bold text-slate-900">{field.name}</span>
                </div>

                <div className="w-full md:w-32">
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.name, { type: e.target.value as FieldType })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center h-full pt-5">
                    <input
                      type="checkbox"
                      id={`req-${field.name}`}
                      checked={field.required}
                      onChange={(e) => updateField(field.name, { required: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor={`req-${field.name}`} className="ml-2 text-sm font-medium text-slate-700">Required</label>
                  </div>
                </div>

                {field.type === 'number' && (
                  <div className="flex gap-2 w-full md:w-48">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Min</label>
                      <input
                        type="number"
                        value={field.min ?? ''}
                        onChange={(e) => updateField(field.name, { min: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Max</label>
                      <input
                        type="number"
                        value={field.max ?? ''}
                        onChange={(e) => updateField(field.name, { max: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm"
                        placeholder="100"
                      />
                    </div>
                  </div>
                )}

                <div className="flex-shrink-0 self-end md:self-center">
                  <button
                    onClick={() => removeField(field.name)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            <div className="pt-4 flex flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase self-center mr-2">Add more:</span>
              {columns.filter(c => !schema.find(f => f.name === c)).map(col => (
                <button
                  key={col}
                  onClick={() => addField(col)}
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 rounded text-[10px] font-bold transition-colors"
                >
                  + {col}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
