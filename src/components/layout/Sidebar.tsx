import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calculator,
  Scale,
  Sparkles,
  ShieldCheck,
  FileText,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const mainNav = [
    {
      to: '/',
      label: 'Dashboard & Calculator',
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      to: '/compare',
      label: 'Bank Comparison',
      icon: <Scale className="w-4 h-4" />,
    },
    {
      to: '/recommend',
      label: 'Recommendation',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      to: '/admin/rates',
      label: 'Rate Management',
      icon: <Lock className="w-4 h-4" />,
    },
  ];

  const legalNav = [
    {
      to: '/privacy',
      label: 'Privacy Policy',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      to: '/terms',
      label: 'Terms & Disclaimer',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-teal-800 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
              FD
            </div>
            <div>
              <span className="font-semibold text-slate-900 tracking-tight text-sm block">
                Smart FD
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Rate & Yield Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
              Core Platform
            </span>
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-900 font-semibold border-l-2 border-teal-700 pl-[10px]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
              Legal & Disclosures
            </span>
            <nav className="space-y-1">
              {legalNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Official Reference Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div className="flex items-center justify-between mb-1.5 font-medium text-slate-700">
            <span>DICGC Protection</span>
            <span className="text-teal-800 font-semibold">₹5,00,000</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal mb-2">
            Bank deposits are insured under RBI&apos;s DICGC Act per depositor per bank.
          </p>
          <a
            href="https://www.rbi.org.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-teal-800 hover:underline font-medium"
          >
            RBI Official Portal <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    </>
  );
};
