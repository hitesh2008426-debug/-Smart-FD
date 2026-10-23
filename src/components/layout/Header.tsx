import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-teal-700"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            Smart FD Calculator
          </h1>
          <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            India Retail Term Deposits
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Quarterly Compounding Verified</span>
        </div>

        <Link
          to="/compare"
          className="text-xs font-semibold px-3 py-1.5 rounded-md bg-teal-800 text-white hover:bg-teal-900 transition-colors focus:ring-2 focus:ring-teal-700 shadow-sm"
        >
          Compare All Rates
        </Link>
      </div>
    </header>
  );
};
