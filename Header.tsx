
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  onLogoClick: () => void;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick, activeView, onViewChange }) => {
  const navItems = [
    { label: 'Tool', view: AppView.TOOL },
    { label: 'Dashboard', view: AppView.DASHBOARD },
    { label: 'Usage', view: AppView.USAGE },
    { label: 'Pricing', view: AppView.PRICING },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={onLogoClick}
        >
          <div className="bg-indigo-600 p-2.5 rounded-xl group-hover:rotate-6 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.283a2 2 0 01-1.186.12l-2.02-.404a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 000 2.828l.647.647a2 2 0 002.828 0l2.387-2.387a2 2 0 00.547-1.022l.477-2.387a6 6 0 00-.517-3.86l-.283-.628a2 2 0 01-.12-1.186l.404-2.02a2 2 0 00-.547-1.022l-2.387-2.387a2 2 0 00-2.828 0l-.647.647a2 2 0 000 2.828l2.387 2.387z" />
            </svg>
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">
            CleanseAI
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl">
          {navItems.map((item) => (
            <button 
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeView === item.view 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onViewChange(AppView.ACCOUNT)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              activeView === AppView.ACCOUNT ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeView === AppView.ACCOUNT ? 'bg-indigo-500' : 'bg-slate-200 text-slate-600'}`}>JS</div>
            <span className="text-sm font-bold hidden sm:inline">My Account</span>
          </button>
        </div>
      </div>
    </header>
  );
};
