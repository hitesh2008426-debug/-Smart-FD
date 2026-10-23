import React, { useState } from 'react';
import type { OfferComparisonResult } from '../../types';
import { formatIndianCurrency } from '../../shared/calculator';
import { VerificationBadge } from '../common/Badge';
import {
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComparisonTableProps {
  results: OfferComparisonResult[];
  onSelectOffer?: (result: OfferComparisonResult) => void;
}

type SortField = 'rate' | 'maturity' | 'interest' | 'bank';
type SortOrder = 'asc' | 'desc';

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ results }) => {
  const [sortField, setSortField] = useState<SortField>('maturity');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let diff = 0;
    if (sortField === 'rate') {
      diff = b.calculation.annualRate - a.calculation.annualRate;
    } else if (sortField === 'maturity') {
      diff = b.calculation.maturityAmount - a.calculation.maturityAmount;
    } else if (sortField === 'interest') {
      diff = b.calculation.interestEarned - a.calculation.interestEarned;
    } else if (sortField === 'bank') {
      diff = a.offer.bankName.localeCompare(b.offer.bankName);
    }
    return sortOrder === 'asc' ? -diff : diff;
  });

  const toggleExpand = (id: string) => {
    setExpandedOfferId(expandedOfferId === id ? null : id);
  };

  if (results.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-semibold text-slate-900">No Eligible FD Offers Found</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          No bank fixed deposits currently match all your exact constraints. Try adjusting your tenure duration, deposit amount, or removing the minimum interest rate filter.
        </p>
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-md bg-teal-800 text-white hover:bg-teal-900 mt-2"
        >
          Modify Requirements
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Table header controls */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
        <div>
          <span className="text-xs font-semibold text-slate-700">
            Showing {sortedResults.length} Evaluated Offers
          </span>
          <span className="text-[11px] text-slate-500 block">
            Click column headers to sort by maturity or interest rate.
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Quick Sort:</span>
          <button
            type="button"
            onClick={() => toggleSort('maturity')}
            className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              sortField === 'maturity'
                ? 'bg-teal-800 text-white border-teal-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Maturity Value {sortField === 'maturity' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
          </button>
          <button
            type="button"
            onClick={() => toggleSort('rate')}
            className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              sortField === 'rate'
                ? 'bg-teal-800 text-white border-teal-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Interest Rate {sortField === 'rate' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
          </button>
        </div>
      </div>

      {/* Responsive table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 text-xs uppercase tracking-wider">
              <th scope="col" className="py-3 px-4 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort('bank')}
                  className="flex items-center gap-1 hover:text-slate-900"
                >
                  Bank & Scheme
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('rate')}
                  className="flex items-center gap-1 ml-auto hover:text-slate-900"
                >
                  Rate (% p.a.)
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('interest')}
                  className="flex items-center gap-1 ml-auto hover:text-slate-900"
                >
                  Interest
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('maturity')}
                  className="flex items-center gap-1 ml-auto hover:text-slate-900"
                >
                  Maturity Amount
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-center">
                Data Status
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">
                Details
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {sortedResults.map((item, index) => {
              const isExpanded = expandedOfferId === item.offer.id;
              const isTop = index === 0 && sortField === 'maturity' && sortOrder === 'desc';

              return (
                <React.Fragment key={item.offer.id}>
                  <tr
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isTop ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Bank & Product */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2">
                        {isTop && (
                          <span
                            className="p-1 rounded bg-emerald-100 text-emerald-800 mt-0.5 shrink-0"
                            title="Highest maturity return"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          </span>
                        )}
                        <div>
                          <span className="font-semibold text-slate-900 block leading-tight">
                            {item.offer.bankName}
                          </span>
                          <span className="text-xs text-slate-500 block mt-0.5">
                            {item.offer.productName}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span>
                              Tenure: {item.offer.minTenureMonths}–{item.offer.maxTenureMonths} mo
                            </span>
                            <span>•</span>
                            <span>Min: {formatIndianCurrency(item.offer.minDeposit)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-900 text-base">
                        {item.calculation.annualRate.toFixed(2)}%
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {item.calculation.payoutFrequency === 'cumulative'
                          ? 'Quarterly Compounded'
                          : `${item.calculation.payoutFrequency} Payout`}
                      </span>
                    </td>

                    {/* Interest */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-semibold text-emerald-700 block">
                        +{formatIndianCurrency(item.calculation.interestEarned)}
                      </span>
                      {item.calculation.periodicPayoutAmount !== undefined && (
                        <span className="text-[11px] text-slate-500 block">
                          {formatIndianCurrency(item.calculation.periodicPayoutAmount)}/cycle
                        </span>
                      )}
                    </td>

                    {/* Maturity */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-base">
                      {formatIndianCurrency(item.calculation.maturityAmount)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <VerificationBadge
                        status={item.offer.verificationStatus}
                        isDemonstration={item.offer.isDemonstration}
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Verified: {item.offer.lastVerifiedDate}
                      </span>
                    </td>

                    {/* Action / Expand */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.offer.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={6} className="p-4 border-t border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Rates & Compounding */}
                          <div className="space-y-1.5 bg-white p-3 rounded border border-slate-200">
                            <h4 className="font-semibold text-slate-900 flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-slate-500" />
                              Rates & Compounding Method
                            </h4>
                            <p className="text-slate-600">
                              <span className="font-medium text-slate-700">Regular Rate:</span>{' '}
                              {item.offer.regularRate}% p.a.
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium text-slate-700">Senior Citizen Rate:</span>{' '}
                              {item.offer.seniorCitizenRate}% p.a.
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium text-slate-700">Calculation Method:</span>{' '}
                              {item.calculation.compoundingMethod}
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium text-slate-700">Formula:</span>{' '}
                              <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">
                                {item.calculation.formulaDescription}
                              </code>
                            </p>
                          </div>

                          {/* Premature Withdrawal & Terms */}
                          <div className="space-y-1.5 bg-white p-3 rounded border border-slate-200">
                            <h4 className="font-semibold text-slate-900">
                              Premature Withdrawal Policy
                            </h4>
                            <p className="text-slate-600">
                              <span className="font-medium text-slate-700">Liquidity Status:</span>{' '}
                              {item.offer.prematureWithdrawalAllowed
                                ? 'Allowed with penalty'
                                : 'Strict Lock-in (Non-callable)'}
                            </p>
                            <p className="text-slate-600 leading-normal">
                              <span className="font-medium text-slate-700">Penalty Terms:</span>{' '}
                              {item.offer.prematureWithdrawalPenalty}
                            </p>
                            {item.offer.notes && (
                              <p className="text-slate-500 text-[11px] italic">
                                Note: {item.offer.notes}
                              </p>
                            )}
                          </div>

                          {/* Verification & Official Source */}
                          <div className="space-y-2 bg-white p-3 rounded border border-slate-200 flex flex-col justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900">Official Rate Source</h4>
                              <p className="text-slate-600">
                                <span className="font-medium text-slate-700">Effective Date:</span>{' '}
                                {item.offer.effectiveStartDate}
                              </p>
                              <p className="text-slate-600">
                                <span className="font-medium text-slate-700">Verified Date:</span>{' '}
                                {item.offer.lastVerifiedDate}
                              </p>
                            </div>

                            <a
                              href={item.offer.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200 text-xs transition-colors"
                            >
                              <span>Official Rate Sheet</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
