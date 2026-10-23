import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ComparisonTable } from '../components/comparison/ComparisonTable';
import { FilterBar } from '../components/comparison/FilterBar';
import { Alert } from '../components/common/Alert';
import type { CalculationInput, OfferComparisonResult } from '../types';
import { api } from '../services/api';
import { formatIndianCurrency } from '../shared/calculator';
import { Sparkles, ArrowRight } from 'lucide-react';

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

export const ComparePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Load initial input from router state or session
  const [currentInput, setCurrentInput] = useState<CalculationInput>(() => {
    if (location.state?.input) return location.state.input;
    const stored = sessionStorage.getItem('smart_fd_current_input');
    return stored ? JSON.parse(stored) : DEFAULT_CALC_INPUT;
  });

  const [comparisonResults, setComparisonResults] = useState<OfferComparisonResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDemoData, setShowDemoData] = useState(false);

  // Fetch evaluated comparison results whenever requirements change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .compare(currentInput)
      .then((res) => {
        if (!isMounted) return;
        setComparisonResults(res.results);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(currentInput)]);

  const handleFilterChange = (updates: Partial<CalculationInput>) => {
    const updated = { ...currentInput, ...updates };
    setCurrentInput(updated);
    sessionStorage.setItem('smart_fd_current_input', JSON.stringify(updated));
  };

  const handleReset = () => {
    setCurrentInput(DEFAULT_CALC_INPUT);
    sessionStorage.setItem('smart_fd_current_input', JSON.stringify(DEFAULT_CALC_INPUT));
  };

  // Filter based on demo data toggle
  const displayedResults = comparisonResults.filter((r) => {
    if (!showDemoData && (r.offer.isDemonstration || r.offer.verificationStatus === 'demonstration')) {
      return false;
    }
    return r.isEligible;
  });

  const handleGoToRecommendation = () => {
    navigate('/recommend', { state: { input: currentInput } });
  };

  return (
    <div className="space-y-6">
      {/* Header and Recommendation link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
            Multi-Bank Term Deposit Evaluation
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Compare Bank Fixed Deposit Rates
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Comparing returns on {formatIndianCurrency(currentInput.investmentAmount)} for{' '}
            {currentInput.tenureValue} {currentInput.tenureUnit} ({currentInput.customerCategory === 'senior_citizen' ? 'Senior Citizen' : 'Regular Customer'}).
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoToRecommendation}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-teal-300" />
          <span>View Recommended Choice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Notice */}
      <Alert variant="info">
        Table rows display pre-tax estimated returns calculated deterministically based on each bank&apos;s published compounding terms and tenure criteria. Click &quot;Inspect&quot; on any offer to see official rate sheet links and penalty policies.
      </Alert>

      {/* Dynamic Requirements Filter Bar */}
      <FilterBar
        input={currentInput}
        onChange={handleFilterChange}
        onReset={handleReset}
        showDemoData={showDemoData}
        onToggleDemoData={setShowDemoData}
      />

      {/* Comparison Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500">
          Evaluating bank rates across eligibility parameters...
        </div>
      ) : (
        <ComparisonTable results={displayedResults} />
      )}
    </div>
  );
};
