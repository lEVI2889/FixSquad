import React from 'react';
import { Layers, Database, Code, BookOpen } from 'lucide-react';

export default function Navbar({ onOpenContract }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-white tracking-tight">Global Category Manager</h1>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Feature 12
              </span>
            </div>
            <p className="text-xs text-slate-400">Week 1 Implementation • Raw SQL Backend • React UI</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
            <Database className="w-3.5 h-3.5 mr-1" />
            <span>Raw SQL Active (mysql2)</span>
          </div>

          <button
            onClick={onOpenContract}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>View Team Contract</span>
          </button>
        </div>
      </div>
    </header>
  );
}
