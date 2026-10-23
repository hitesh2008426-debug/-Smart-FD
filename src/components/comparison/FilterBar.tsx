import React from 'react';
import type { CalculationInput, CustomerCategory, DepositType } from '../../types';
import { formatIndianCurrency } from '../../shared/calculator';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';

interface FilterBarProps {
  input: CalculationInput;
  onChange: (updates: Partial<CalculationInput>) => void;
  onReset: () => void;
  showDemoData: boolean;
  onToggleDemoData: (show: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  input,
  onChange,
  onReset,
  showDemoData,
  onToggleDemoData,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-teal-800" />
          <span>Active Requirements & Filters</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showDemoData}
              onChange={(e) => onToggleDemoData(e.target.checked)}
              className="rounded text-teal-800 focus:ring-teal-700"
            />
            <span>Include Sandbox Demo Rates</span>
          </label>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Inline controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Amount */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Principal Amount
          </label>
          <div className="relative rounded">
            <input
              type="number"
              step="1000"
              min="1000"
              value={input.investmentAmount}
              onChange={(e) =>
                onChange({ investmentAmount: Number(e.target.value) || 1000 })
              }
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-medium text-slate-900 focus:border-teal-700"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Current: {formatIndianCurrency(input.investmentAmount)}
            </span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Tenure Duration
          </label>
          <div className="flex">
            <input
              type="number"
              min="1"
              value={input.tenureValue}
              onChange={(e) =>
                onChange({ tenureValue: Math.max(1, Number(e.target.value)) })
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-l border border-slate-300 font-medium text-slate-900 focus:border-teal-700"
            />
            <select
              value={input.tenureUnit}
              onChange={(e) =>
                onChange({ tenureUnit: e.target.value as 'months' | 'years' })
              }
              className="px-2 py-1.5 text-xs rounded-r border border-l-0 border-slate-300 bg-slate-50 text-slate-700"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>

        {/* Customer Category */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Category
          </label>
          <select
            value={input.customerCategory}
            onChange={(e) =>
              onChange({ customerCategory: e.target.value as CustomerCategory })
            }
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white text-slate-800 focus:border-teal-700"
          >
            <option value="regular">Regular Citizen</option>
            <option value="senior_citizen">Senior Citizen (60+)</option>
          </select>
        </div>

        {/* Deposit Type */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Growth / Payout
          </label>
          <select
            value={input.depositType}
            onChange={(e) => {
              const val = e.target.value as DepositType;
              onChange({
                depositType: val,
                payoutFrequency: val === 'cumulative' ? 'cumulative' : 'quarterly',
              });
            }}
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white text-slate-800 focus:border-teal-700"
          >
            <option value="cumulative">Cumulative (Compounded)</option>
            <option value="non_cumulative">Non-Cumulative (Periodic Payouts)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
