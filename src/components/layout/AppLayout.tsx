import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 text-center sm:flex sm:justify-between sm:items-center">
          <p>© {new Date().getFullYear()} Smart FD Calculator. For informational and comparison purposes only.</p>
          <p className="mt-1 sm:mt-0">Pre-tax gross estimates. Taxes & TDS applicable as per Income Tax Act, 1961.</p>
        </footer>
      </div>
    </div>
  );
};
