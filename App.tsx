
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { CleaningPanel } from './components/CleaningPanel';
import { ReportCard } from './components/ReportCard';
import { Dashboard } from './components/Dashboard';
import { Pricing } from './components/Pricing';
import { UsageHistory } from './components/UsageHistory';
import { SchemaBuilder } from './components/SchemaBuilder';
import { AppState, DataRow, CleaningReport, CleaningOptions, Anomaly, AppView, SchemaField } from './types';
import { performStandardCleaning, performAICleaning, validateAgainstSchema } from './services/cleaningService';
import { getHistory, saveReport } from './services/storageService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.TOOL);
  const [state, setState] = useState<AppState>(AppState.UPLOAD);
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [report, setReport] = useState<CleaningReport | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<CleaningReport[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [schema, setSchema] = useState<SchemaField[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, [activeView, state]);

  const handleFileUpload = (parsedData: DataRow[], detectedColumns: string[], fileName: string) => {
    setData(parsedData);
    setColumns(detectedColumns);
    setUploadedFileName(fileName);
    setSchema([]); // Reset schema for new file
    setState(AppState.PREVIEW);
  };

  const handleStartCleaning = async (options: CleaningOptions) => {
    setIsProcessing(true);
    setState(AppState.CLEANING);

    try {
      // 1. Rule-based cleaning
      const { cleanedData, report: ruleReport } = performStandardCleaning(data, options);
      
      let finalData = cleanedData;
      let finalAnomalies: Anomaly[] = [];
      let combinedReportData = { ...ruleReport };

      // 2. Schema Validation
      if (options.validateSchema && options.schema) {
        const schemaIssues = validateAgainstSchema(finalData, options.schema);
        finalAnomalies = [...finalAnomalies, ...schemaIssues];
        combinedReportData.validationIssuesCount = schemaIssues.length;
        combinedReportData.totalChanges += schemaIssues.length;
      }

      // 3. AI Scan (Gemini or OpenAI)
      if (options.useAI) {
        const aiResults = await performAICleaning(finalData, columns, options);
        finalAnomalies = [...finalAnomalies, ...aiResults.anomalies];
        combinedReportData.anomaliesDetected = aiResults.anomalies.length;
        combinedReportData.totalChanges += aiResults.anomalies.length;
      }

      const finalReport: CleaningReport = {
        ...combinedReportData,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        fileName: uploadedFileName || 'Untitled.csv',
        rowCount: data.length
      };

      setData(finalData);
      setAnomalies(finalAnomalies);
      setReport(finalReport);
      saveReport(finalReport);
      setState(AppState.REPORT);
    } catch (error) {
      console.error("Cleaning failed", error);
      alert("Something went wrong during the cleaning process.");
      setState(AppState.PREVIEW);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setData([]);
    setColumns([]);
    setReport(null);
    setAnomalies([]);
    setUploadedFileName('');
    setSchema([]);
    setState(AppState.UPLOAD);
    setActiveView(AppView.TOOL);
  };

  const renderTool = () => {
    if (state === AppState.UPLOAD) {
      return (
        <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-black text-slate-900 mb-4 text-center">
            Clean your data in seconds
          </h1>
          <p className="text-slate-600 mb-8 text-center text-lg">
            Upload your CSV and let our AI handle the messy parts. 
            We'll find duplicates, fix formats, and detect anomalies automatically.
          </p>
          <FileUpload onUpload={(d, c, f) => handleFileUpload(d, c, f || 'data.csv')} />
        </div>
      );
    }

    if (state === AppState.PREVIEW || state === AppState.CLEANING) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-300">
          <div className="lg:col-span-3 space-y-6">
            <SchemaBuilder 
              columns={columns} 
              schema={schema} 
              onChange={setSchema} 
            />
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-slate-800">Raw Data Preview</h2>
                  <p className="text-xs text-slate-500">{uploadedFileName} • {data.length} rows</p>
                </div>
                {state === AppState.CLEANING && (
                  <div className="flex items-center text-indigo-600 font-bold text-sm">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Intelligence Engine Active
                  </div>
                )}
              </div>
              <div className="overflow-x-auto h-[600px] custom-scrollbar">
                <DataTable data={data} columns={columns} anomalies={anomalies} />
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <CleaningPanel 
              onStart={handleStartCleaning} 
              isLoading={isProcessing} 
              disabled={state === AppState.CLEANING}
              schema={schema}
            />
          </div>
        </div>
      );
    }

    if (state === AppState.REPORT && report) {
      return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Analysis Complete!</h2>
              <p className="text-slate-600">Review validation results and download your cleaned dataset.</p>
            </div>
            <div className="space-x-4">
              <button 
                onClick={reset}
                className="px-6 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition"
              >
                Reset
              </button>
              <button 
                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg"
              >
                Export CSV
              </button>
            </div>
          </div>

          <ReportCard report={report} anomalies={anomalies} />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Cleaned Data Output</h3>
            </div>
            <div className="overflow-x-auto h-[400px] custom-scrollbar">
              <DataTable data={data} columns={columns} anomalies={anomalies} />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header 
        onLogoClick={reset} 
        activeView={activeView} 
        onViewChange={(v) => {
          setActiveView(v);
          if (v !== AppView.TOOL) setState(AppState.UPLOAD);
        }} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {activeView === AppView.TOOL && renderTool()}
        {activeView === AppView.DASHBOARD && (
          <Dashboard history={history} onStartNew={() => setActiveView(AppView.TOOL)} />
        )}
        {activeView === AppView.USAGE && <UsageHistory history={history} />}
        {activeView === AppView.PRICING && <Pricing />}
        {activeView === AppView.ACCOUNT && (
          <div className="max-w-2xl mx-auto text-center py-20 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-xl shadow-indigo-100">👤</div>
            <h1 className="text-3xl font-black mb-2 tracking-tight">User Account</h1>
            <p className="text-slate-500 mb-8">System preferences and billing settings.</p>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 text-left">
              <div className="flex justify-between items-center py-5 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Email Address</span>
                <span className="text-slate-900 font-bold">demo.user@cleanseai.io</span>
              </div>
              <div className="flex justify-between items-center py-5 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Active Plan</span>
                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-full shadow-lg shadow-indigo-100 uppercase">Starter Pro</span>
              </div>
              <div className="flex justify-between items-center py-5 border-b border-slate-100">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Processing Credits</span>
                <span className="text-slate-900 font-bold">14,200 remaining</span>
              </div>
              <div className="mt-8">
                <button className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-red-50 hover:text-red-500 transition-colors">
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-slate-300 text-sm mb-6 md:mb-0">
            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <span>v1.2.4-stable • Enterprise Grade Data Prep</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Data Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Trust Center</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">SLA Agreement</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Dev Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
