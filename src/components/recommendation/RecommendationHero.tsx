import React from 'react';
import type { RecommendationResult } from '../../types';
import { formatIndianCurrency } from '../../shared/calculator';
import { VerificationBadge } from '../common/Badge';
import {
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface RecommendationHeroProps {
  recommendation: RecommendationResult;
}

export const RecommendationHero: React.FC<RecommendationHeroProps> = ({ recommendation }) => {
  const {
    recommendedOffer,
    calculation,
    selectionReasons,
    transparencyNotes,
    caveatsAndRestrictions,
  } = recommendation;

  return (
    <div className="bg-white border-2 border-teal-700/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-teal-800 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Recommended Offer
            </span>
            <VerificationBadge
              status={recommendedOffer.verificationStatus}
              isDemonstration={recommendedOffer.isDemonstration}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {recommendedOffer.bankName}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">{recommendedOffer.productName}</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block font-medium">Applicable Interest Rate</span>
          <div className="text-3xl font-extrabold text-teal-800 tracking-tight">
            {calculation.annualRate.toFixed(2)}%
            <span className="text-xs font-normal text-slate-500 ml-1">p.a.</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {calculation.compoundingMethod}
          </span>
        </div>
      </div>

      {/* Main financial figures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Principal Investment
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatIndianCurrency(calculation.principal)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Tenure: {calculation.tenureMonths} Months ({calculation.tenureYears} Years)
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Total Interest Earned
          </span>
          <div className="text-xl font-bold text-emerald-800 mt-1">
            +{formatIndianCurrency(calculation.interestEarned)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            {calculation.periodicPayoutAmount !== undefined
              ? `Periodic payout: ${formatIndianCurrency(calculation.periodicPayoutAmount)} / ${calculation.payoutFrequency}`
              : 'Reinvested quarterly'}
          </span>
        </div>

        <div className="bg-teal-900 text-white rounded-lg p-4 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-teal-200 uppercase tracking-wider block">
              Estimated Maturity Value
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatIndianCurrency(calculation.maturityAmount)}
            </div>
          </div>
          <span className="text-[11px] text-teal-200 mt-2 block">
            Gross pre-tax estimated return
          </span>
        </div>
      </div>

      {/* Why this offer was selected (Explainable reasoning) */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <CheckCircle2 className="w-4 h-4 text-teal-800" />
          Why This Offer Was Selected
        </h3>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
          {selectionReasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-800 shrink-0 mt-2" />
              <span className="leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Official Source & Transparency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="border border-slate-200 rounded-lg p-4 space-y-2">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Rate Verification & Regulatory Coverage
          </h4>
          <ul className="space-y-1.5 text-slate-600">
            {transparencyNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span className="leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <a
              href={recommendedOffer.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal-800 hover:underline font-semibold"
            >
              Verify on {recommendedOffer.bankName} Official Site{' '}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 space-y-2">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            Important Terms & Tax Disclosures
          </h4>
          <ul className="space-y-1.5 text-slate-600">
            {caveatsAndRestrictions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Actual maturity proceeds subject to bank confirmation at time of deposit creation.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
