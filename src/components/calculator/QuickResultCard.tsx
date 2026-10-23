import React from 'react';
import type { CalculationResult } from '../../types';
import { formatIndianCurrency } from '../../shared/calculator';
import { TrendingUp, ShieldAlert, Coins, HelpCircle } from 'lucide-react';

interface QuickResultCardProps {
  result: CalculationResult | null;
  isLoading?: boolean;
}

export const QuickResultCard: React.FC<QuickResultCardProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex items-center justify-center min-h-[300px]">
        <div className="text-slate-500 text-sm animate-pulse flex items-center gap-2">
          <span>Recalculating projection...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center text-slate-500">
        <HelpCircle className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium">Enter investment amount and tenure to view projection</p>
      </div>
    );
  }

  // Calculate annual yield percentage
  const totalGainPct =
    result.principal > 0
      ? ((result.interestEarned / result.principal) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Benchmark Projection
            </span>
            <span className="text-sm font-medium text-slate-700">
              {result.depositType === 'cumulative'
                ? 'Cumulative Growth (Compounded)'
                : `Non-Cumulative (${result.payoutFrequency} Payout)`}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            {result.annualRate.toFixed(2)}% p.a.
          </span>
        </div>

        {/* Big numbers */}
        <div className="py-5 space-y-4">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Estimated Maturity Value
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {formatIndianCurrency(result.maturityAmount)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-100 rounded-md p-3">
              <span className="text-xs font-medium text-slate-500 block flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-slate-500" />
                Principal
              </span>
              <span className="text-base font-semibold text-slate-800 mt-0.5 block">
                {formatIndianCurrency(result.principal)}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3">
              <span className="text-xs font-medium text-emerald-800 block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                Interest Earned
              </span>
              <span className="text-base font-bold text-emerald-800 mt-0.5 block">
                +{formatIndianCurrency(result.interestEarned)}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium block">
                ({totalGainPct}% total return)
              </span>
            </div>
          </div>

          {result.periodicPayoutAmount !== undefined && (
            <div className="bg-teal-50 border border-teal-100 rounded-md p-3 text-xs">
              <div className="flex justify-between items-center text-teal-900 font-medium">
                <span>Periodic {result.payoutFrequency} Payout:</span>
                <span className="font-bold text-sm">
                  {formatIndianCurrency(result.periodicPayoutAmount)}
                </span>
              </div>
              <span className="text-[11px] text-teal-700 block mt-0.5">
                Total of {result.numberOfPayouts} payouts over {result.tenureMonths} months. Principal is refunded upon completion.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimers & Calculation method */}
      <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
        <div className="flex items-start gap-1.5">
          <span className="font-medium text-slate-700 shrink-0">Method:</span>
          <span className="text-slate-600">{result.compoundingMethod}</span>
        </div>
        <div className="flex items-start gap-1.5">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="text-slate-600 leading-relaxed text-[11px]">
            {result.tdsEstimateNote}
          </span>
        </div>
      </div>
    </div>
  );
};
