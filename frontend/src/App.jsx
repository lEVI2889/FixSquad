import React, { useState } from 'react';
import Navbar from './components/Navbar';
import GlobalCategoryManager from './pages/GlobalCategoryManager';
import ContractInspectorModal from './components/ContractInspectorModal';

export default function App() {
  const [isContractOpen, setIsContractOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onOpenContract={() => setIsContractOpen(true)} />
      <main className="flex-1">
        <GlobalCategoryManager />
      </main>
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Feature 12: Global Category Manager • Built with Raw SQL & React</p>
          <p className="font-mono text-indigo-400">Team Contract: categories(id INT PK, name VARCHAR)</p>
        </div>
      </footer>

      <ContractInspectorModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
      />
    </div>
  );
}
