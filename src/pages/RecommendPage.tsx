import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RecommendationHero } from '../components/recommendation/RecommendationHero';
import { MaturityChart } from '../components/recommendation/MaturityChart';
import { AlternativesList } from '../components/recommendation/AlternativesList';
import { Alert } from '../components/common/Alert';
import type { CalculationInput, OfferComparisonResult, RecommendationResult } from '../types';
import { api } from '../services/api';
import { formatIndianCurrency } from '../shared/calculator';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

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

export const RecommendPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentInput] = useState<CalculationInput>(() => {
    if (location.state?.input) return location.state.input;
    const stored = sessionStorage.getItem('smart_fd_current_input');
    return stored ? JSON.parse(stored) : DEFAULT_CALC_INPUT;
  });

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [comparisonResults, setComparisonResults] = useState<OfferComparisonResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([api.recommend(currentInput), api.compare(currentInput)])
      .then(([rec, comp]) => {
        if (!isMounted) return;
        setRecommendation(rec);
        setComparisonResults(comp.results);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(currentInput)]);

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-sm">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
            Personalized Allocation Model
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Recommended Fixed Deposit Offer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Optimized for {formatIndianCurrency(currentInput.investmentAmount)} over{' '}
            {currentInput.tenureValue} {currentInput.tenureUnit} ({currentInput.primaryGoal === 'highest_maturity' ? 'Maximum Growth' : 'Regular Income'}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/compare', { state: { input: currentInput } })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Full Comparison Table</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change Input</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-xs text-slate-500">
          Calculating deterministic yield curves and evaluating alternatives...
        </div>
      ) : !recommendation ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No Eligible Recommendation Found</h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            No bank offer satisfied all your specific filter constraints (such as minimum interest rate or preferred banks) for this tenure. Try relaxing the filter criteria in the calculator.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900"
          >
            <span>Return to Calculator</span>
          </button>
        </div>
      ) : (
        <>
          {/* Main Hero Recommendation */}
          <RecommendationHero recommendation={recommendation} />

          {/* Visual comparison chart */}
          <MaturityChart comparisonResults={comparisonResults} />

          {/* Next-best alternatives */}
          <AlternativesList alternatives={recommendation.nextBestAlternatives} />

          {/* Regulatory Disclaimer */}
          <Alert variant="info" title="Independent Calculation Disclaimer">
            The Smart FD Calculator is an independent comparison tool and is not an agent, broker, or financial intermediary of any bank. Rates are subject to revision by respective banks without notice. Investors must verify terms on the official bank site prior to deposit creation.
          </Alert>
        </>
      )}
    </div>
  );
};
