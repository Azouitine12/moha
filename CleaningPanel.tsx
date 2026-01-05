
import React, { useState } from 'react';
import { CleaningOptions, SchemaField, AIProvider } from '../types';

interface CleaningPanelProps {
  onStart: (options: CleaningOptions) => void;
  isLoading: boolean;
  disabled: boolean;
  schema?: SchemaField[];
}

const MODELS = {
  gemini: [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Fast)', intelligence: 'Standard' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Smart)', intelligence: 'Ultra' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', intelligence: 'High' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', intelligence: 'Fast' },
  ]
};

export const CleaningPanel: React.FC<CleaningPanelProps> = ({ onStart, isLoading, disabled, schema = [] }) => {
  const [options, setOptions] = useState<CleaningOptions>({
    removeDuplicates: true,
    trimSpaces: true,
    standardizeCase: true,
    fixDates: true,
    validateEmails: true,
    useAI: true,
    aiProvider: 'gemini',
    aiModel: 'gemini-3-flash-preview',
    validateSchema: schema.length > 0
  });

  const toggleOption = (key: keyof CleaningOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProviderChange = (provider: AIProvider) => {
    setOptions(prev => ({
      ...prev,
      aiProvider: provider,
      aiModel: MODELS[provider][0].id
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 sticky top-24">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Intelligence Engine</h3>
        <p className="text-sm text-slate-500">Choose your cleaning logic.</p>
      </div>

      <div className="space-y-4">
        {/* Model Selector */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">AI Provider</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleProviderChange('gemini')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                  options.aiProvider === 'gemini' 
                  ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm' 
                  : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                Google Gemini
              </button>
              <button
                onClick={() => handleProviderChange('openai')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                  options.aiProvider === 'openai' 
                  ? 'bg-white border-slate-900 text-slate-900 shadow-sm' 
                  : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                OpenAI GPT
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Model Variant</label>
            <select
              value={options.aiModel}
              onChange={(e) => setOptions(prev => ({ ...prev, aiModel: e.target.value }))}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
            >
              {MODELS[options.aiProvider].map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-start cursor-pointer group">
          <div className="flex items-center h-5">
            <input 
              type="checkbox" 
              checked={options.removeDuplicates} 
              onChange={() => toggleOption('removeDuplicates')}
              disabled={disabled}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition">Remove Duplicates</span>
          </div>
        </label>

        <label className="flex items-start cursor-pointer group">
          <div className="flex items-center h-5">
            <input 
              type="checkbox" 
              checked={options.trimSpaces} 
              onChange={() => toggleOption('trimSpaces')}
              disabled={disabled}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition">Trim Whitespace</span>
          </div>
        </label>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <label className="flex items-start cursor-pointer group">
            <div className="flex items-center h-5">
              <input 
                type="checkbox" 
                checked={options.validateSchema} 
                onChange={() => toggleOption('validateSchema')}
                disabled={disabled || schema.length === 0}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>
            <div className="ml-3 text-sm">
              <span className={`font-bold ${schema.length > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>Schema Validation</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Matches custom rules</p>
            </div>
          </label>

          <label className="flex items-start cursor-pointer group">
            <div className="flex items-center h-5">
              <input 
                type="checkbox" 
                checked={options.useAI} 
                onChange={() => toggleOption('useAI')}
                disabled={disabled}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-bold text-indigo-600">Smart Scan (AI)</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Deep anomaly detection</p>
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={() => onStart({ ...options, schema })}
        disabled={disabled || isLoading}
        className={`w-full py-3 px-4 rounded-xl font-bold transition-all shadow-md flex items-center justify-center ${
          isLoading 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-slate-900 text-white hover:bg-black active:scale-[0.98]'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scanning...
          </div>
        ) : 'Execute Prep'}
      </button>
    </div>
  );
};
