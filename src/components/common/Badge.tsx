import React from 'react';
import type { VerificationStatus } from '../../types';
import { CheckCircle2, AlertTriangle, Clock, HelpCircle } from 'lucide-react';

interface VerificationBadgeProps {
  status: VerificationStatus;
  isDemonstration?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  isDemonstration,
  className = '',
}) => {
  if (isDemonstration || status === 'demonstration') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        title="Demonstration offer for testing and benchmarking only"
      >
        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
        Demo Data
      </span>
    );
  }

  switch (status) {
    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
          title="Verified against official bank published rate sheet"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          Verified
        </span>
      );
    case 'stale':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
          title="Rate verification older than 30 days"
        >
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          Pending Review
        </span>
      );
    case 'expired':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 ${className}`}
          title="Offer period has expired"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
          Expired
        </span>
      );
    default:
      return null;
  }
};

interface GeneralBadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'teal' | 'emerald' | 'amber';
  className?: string;
}

export const Badge: React.FC<GeneralBadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const styles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
