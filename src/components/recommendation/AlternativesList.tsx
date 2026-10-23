import React from 'react';
import type { RecommendationResult } from '../../types';
import { formatIndianCurrency } from '../../shared/calculator';
import { VerificationBadge } from '../common/Badge';
import { ExternalLink } from 'lucide-react';

interface AlternativesListProps {
  alternatives: RecommendationResult['nextBestAlternatives'];
}

export const AlternativesList: React.FC<AlternativesListProps> = ({ alternatives }) => {
  if (alternatives.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">
          Next-Best Eligible Alternatives
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Benchmark comparison with closely trailing eligible bank offers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alternatives.map((alt, idx) => (
          <div
            key={alt.offer.id}
            className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  Alternative #{idx + 1}
                </span>
                <VerificationBadge
                  status={alt.offer.verificationStatus}
                  isDemonstration={alt.offer.isDemonstration}
                />
              </div>

              <h4 className="font-bold text-slate-900 text-sm">
                {alt.offer.bankName}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-1">{alt.offer.productName}</p>
            </div>

            <div className="space-y-1.5 py-2 border-y border-slate-200/60 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicable Rate:</span>
                <span className="font-semibold text-slate-800">
                  {alt.calculation.annualRate.toFixed(2)}% p.a.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Maturity:</span>
                <span className="font-bold text-slate-900">
                  {formatIndianCurrency(alt.calculation.maturityAmount)}
                </span>
              </div>
              <div className="flex justify-between text-amber-800 font-medium">
                <span>Difference:</span>
                <span>
                  -{formatIndianCurrency(alt.differenceAmount)} (-{alt.differencePercentage}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                Penalty: {alt.offer.prematureWithdrawalAllowed ? 'Allowed' : 'Strict lock-in'}
              </span>
              <a
                href={alt.offer.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-800 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                Rates <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
