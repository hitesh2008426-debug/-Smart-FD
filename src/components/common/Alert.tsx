import React from 'react';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-slate-50 border-slate-200 text-slate-800',
      icon: <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />,
      titleColor: 'text-slate-900',
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />,
      titleColor: 'text-amber-950',
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />,
      titleColor: 'text-emerald-950',
    },
  };

  const current = styles[variant];

  return (
    <div
      role="region"
      aria-label={title || 'Notice'}
      className={`border rounded-lg p-3.5 flex items-start gap-3 text-sm ${current.bg} ${className}`}
    >
      {current.icon}
      <div className="flex-1">
        {title && <h4 className={`font-semibold mb-0.5 ${current.titleColor}`}>{title}</h4>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
