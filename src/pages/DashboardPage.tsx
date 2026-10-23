import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalculatorForm } from '../components/calculator/CalculatorForm';
import { QuickResultCard } from '../components/calculator/QuickResultCard';
import { Alert } from '../components/common/Alert';
import type { CalculationInput, CalculationResult, FDOffer } from '../types';
import { api } from '../services/api';
import { calculateFixedDeposit, convertTenureToMonths, formatIndianCurrency } from '../shared/calculator';
import {
  ShieldCheck,
  TrendingUp,
  Percent,
  Landmark,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_CALC_INPUT: CalculationInput = {
  investmentAmount: 100000,
  tenureValue: 1,
  tenureUnit: 'years',
  depositType: 'cumulative',
  customerCategory: 'regular',
  payoutFrequency: 'cumulative',
  primaryGoal: 'highest_maturity',
  prematureWithdrawalFlexibility: false,
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [calcInput, setCalcInput] = useState<CalculationInput>(DEFAULT_CALC_INPUT);
  const [quickResult, setQuickResult] = useState<CalculationResult | null>(null);
  const [featuredOffers, setFeaturedOffers] = useState<FDOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Compute live preview whenever input changes
  useEffect(() => {
    try {
      const tenureMonths = convertTenureToMonths(calcInput.tenureValue, calcInput.tenureUnit);
      const rate = calcInput.customerCategory === 'senior_citizen' ? 7.60 : 7.10;

      const res = calculateFixedDeposit({
        principal: calcInput.investmentAmount,
        annualRate: rate,
        tenureMonths,
        depositType: calcInput.depositType,
        payoutFrequency: calcInput.payoutFrequency,
        compoundingFrequency: 'quarterly',
        customerCategory: calcInput.customerCategory,
      });
      setQuickResult(res);
    } catch {
      // Incomplete or invalid input during user typing
    }
  }, [calcInput]);

  useEffect(() => {
    api
      .getOffers(false)
      .then((offers) => {
        setFeaturedOffers(offers.slice(0, 4));
      })
      .finally(() => setLoadingOffers(false));
  }, []);

  const handleFormSubmit = (data: CalculationInput) => {
    // Store in session and navigate to compare
    sessionStorage.setItem('smart_fd_current_input', JSON.stringify(data));
    navigate('/compare', { state: { input: data } });
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <Alert variant="info" title="Verified Banking Data Standard">
        Interest rates are verified directly from published retail term deposit circulars of scheduled commercial banks. All estimates assume quarterly compounding for cumulative growth per RBI standards. Taxes and TDS are excluded from the displayed figures.
      </Alert>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
            Independent Financial Tool
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Compare Indian Bank Fixed Deposit Rates
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Accurate quarterly compounding calculations, regular vs. senior citizen rate spreads, and explainable recommendations across leading commercial banks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right border-l md:border-l border-slate-200 pl-4">
            <span className="text-xs text-slate-500 font-medium block">Top Public Sector Rate</span>
            <span className="text-lg font-bold text-slate-900">Up to 7.85% p.a.</span>
            <span className="text-[11px] text-teal-800 font-medium block">Senior Citizens</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Calculator Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <CalculatorForm
            initialValues={calcInput}
            onValuesChange={setCalcInput}
            onSubmit={handleFormSubmit}
          />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <QuickResultCard result={quickResult} />

          {/* Quick CTA to recommendation */}
          <div className="bg-teal-900 text-white rounded-lg p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-300" />
              <h3 className="font-bold text-sm tracking-tight">Need a Personalized Recommendation?</h3>
            </div>
            <p className="text-xs text-teal-100 leading-relaxed">
              Our explainable engine evaluates liquidity, tenure ceilings, deposit brackets, and senior citizen premiums to recommend the optimal match.
            </p>
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('smart_fd_current_input', JSON.stringify(calcInput));
                navigate('/recommend', { state: { input: calcInput } });
              }}
              className="w-full py-2 px-3 rounded bg-teal-700 hover:bg-teal-600 font-semibold text-xs text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Get Personalized Recommendation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Benchmark Bank Offers Overview */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-teal-800" />
              Verified Bank Rate Benchmarks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current published rates for domestic retail term deposits under ₹2 Crore.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/compare')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
          >
            <span>View All Comparison Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingOffers ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading verified rates...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredOffers.map((offer) => (
              <div
                key={offer.id}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {offer.bankName}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">
                    {offer.productName}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {offer.regularRate.toFixed(2)}%
                    </span>
                    <span className="text-xs text-slate-500">p.a. (Regular)</span>
                  </div>
                  <div className="text-xs font-semibold text-teal-800 mt-0.5">
                    {offer.seniorCitizenRate.toFixed(2)}% p.a. (Senior Citizen)
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Tenure: {offer.minTenureMonths}–{offer.maxTenureMonths} mo
                  </span>
                  <a
                    href={offer.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-800 hover:underline flex items-center gap-0.5 font-medium"
                  >
                    Rate Sheet <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational & Trust Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1.5">
          <div className="w-8 h-8 rounded bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold mb-2">
            <Percent className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Quarterly Compounding Formula</h3>
          <p className="text-slate-600 leading-relaxed">
            In India, commercial banks calculate cumulative interest as <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">A = P × (1 + r/400)^(4t)</code>. This compounding produces higher yield than simple annual rate multiplication.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1.5">
          <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">DICGC Insurance Guarantee</h3>
          <p className="text-slate-600 leading-relaxed">
            Every depositor in an Indian commercial bank is insured up to ₹5,00,000 across both principal and accrued interest by the RBI subsidiary DICGC.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1.5">
          <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">TDS & Form 15G / 15H</h3>
          <p className="text-slate-600 leading-relaxed">
            TDS applies @ 10% under Section 194A if total bank interest exceeds ₹40,000 (₹50,000 for seniors). Individuals with income below the taxable threshold can submit Form 15G/15H to prevent deductions.
          </p>
        </div>
      </div>
    </div>
  );
};
