import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { OfferComparisonResult } from '../../types';
import { formatIndianCurrency } from '../../shared/calculator';

interface MaturityChartProps {
  comparisonResults: OfferComparisonResult[];
}

export const MaturityChart: React.FC<MaturityChartProps> = ({ comparisonResults }) => {
  const [chartMode, setChartMode] = useState<'maturity' | 'stacked'>('maturity');

  // Filter eligible and take top 6 for clean visual comparison
  const eligibleData = comparisonResults
    .filter((r) => r.isEligible)
    .sort((a, b) => b.calculation.maturityAmount - a.calculation.maturityAmount)
    .slice(0, 6)
    .map((item) => ({
      name: item.offer.bankName.replace(/\s*\(.*?\)\s*/g, ''), // clean short bank name
      shortName: item.offer.bankName.split(' ')[0],
      principal: item.calculation.principal,
      interest: item.calculation.interestEarned,
      maturity: item.calculation.maturityAmount,
      rate: `${item.calculation.annualRate}%`,
    }));

  if (eligibleData.length === 0) {
    return null;
  }

  // Custom accessible tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-300 p-3 rounded shadow-md text-xs space-y-1">
          <p className="font-bold text-slate-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex justify-between gap-4 text-slate-700">
              <span className="capitalize">{entry.name}:</span>
              <span className="font-semibold">{formatIndianCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Comparative Yield Analysis (Top Eligible Banks)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side comparison of projected returns under identical investment conditions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setChartMode('maturity')}
            className={`px-2.5 py-1 rounded border font-medium transition-colors ${
              chartMode === 'maturity'
                ? 'bg-teal-800 text-white border-teal-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Maturity Value
          </button>
          <button
            type="button"
            onClick={() => setChartMode('stacked')}
            className={`px-2.5 py-1 rounded border font-medium transition-colors ${
              chartMode === 'stacked'
                ? 'bg-teal-800 text-white border-teal-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Principal vs Interest
          </button>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'maturity' ? (
            <BarChart
              data={eligibleData}
              margin={{ top: 10, right: 10, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="maturity"
                name="Maturity Amount"
                fill="#0f766e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <BarChart
              data={eligibleData}
              margin={{ top: 10, right: 10, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => (value === 'principal' ? 'Principal Investment' : 'Interest Earned')}
              />
              <Bar dataKey="principal" stackId="a" fill="#cbd5e1" name="principal" />
              <Bar dataKey="interest" stackId="a" fill="#047857" name="interest" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>Units: Indian Rupee (₹). Pre-tax gross returns based on quarterly compounding.</span>
        <span className="font-medium text-slate-600">Calculated deterministically</span>
      </div>
    </div>
  );
};
