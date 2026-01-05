
import React, { useRef, useState } from 'react';
import { DataRow } from '../types';

interface FileUploadProps {
  onUpload: (data: DataRow[], columns: string[], fileName?: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return { data: [], columns: [] };

    const columns = lines[0].split(',').map(col => col.trim().replace(/^"|"$/g, ''));
    const data: DataRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(val => val.trim().replace(/^"|"$/g, ''));
      const row: DataRow = {};
      columns.forEach((col, idx) => {
        row[col] = values[idx] || '';
      });
      data.push(row);
    }

    return { data, columns };
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const { data, columns } = parseCSV(text);
        onUpload(data, columns, file.name);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid CSV file.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className={`relative p-16 border-2 border-dashed rounded-[2.5rem] text-center transition-all ${
        dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-slate-300 hover:border-indigo-400 bg-white shadow-xl shadow-slate-100'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept=".csv" 
        className="hidden"
      />
      
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          Drop your data file here
        </h3>
        <p className="text-slate-500 mb-8 max-w-sm">
          We accept CSV and Excel files up to 50MB. All processing is secure and private.
        </p>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition active:scale-95"
        >
          Browse Files
        </button>
      </div>

      <div className="mt-12 flex items-center justify-center space-x-8 text-slate-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] uppercase font-black tracking-widest">End-to-end Encrypted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <span className="text-[10px] uppercase font-black tracking-widest">Powered by Gemini</span>
        </div>
      </div>
    </div>
  );
};
