import type {
  CalculationInput,
  FDOffer,
  OfferComparisonResult,
  RecommendationResult,
} from '../types';
import { calculateForOffer, convertTenureToMonths, formatIndianCurrency } from './calculator';

export interface EvaluateOffersOptions {
  offers: FDOffer[];
  input: CalculationInput;
}

/**
 * Filter and evaluate all offers against user requirements
 */
export function evaluateOffers(options: EvaluateOffersOptions): OfferComparisonResult[] {
  const { offers, input } = options;
  const tenureMonths = convertTenureToMonths(input.tenureValue, input.tenureUnit);

  return offers.map((offer) => {
    const ineligibilityReasons: string[] = [];

    // Check active status
    if (!offer.isActive) {
      ineligibilityReasons.push('This FD offer is currently inactive or discontinued.');
    }

    // Check tenure bounds
    if (tenureMonths < offer.minTenureMonths) {
      ineligibilityReasons.push(
        `Requested tenure (${tenureMonths} mo) is below minimum required (${offer.minTenureMonths} mo).`
      );
    }
    if (tenureMonths > offer.maxTenureMonths) {
      ineligibilityReasons.push(
        `Requested tenure (${tenureMonths} mo) exceeds maximum supported (${offer.maxTenureMonths} mo).`
      );
    }

    // Check deposit amount bounds
    if (input.investmentAmount < offer.minDeposit) {
      ineligibilityReasons.push(
        `Investment amount (${formatIndianCurrency(input.investmentAmount)}) is below the required minimum deposit of ${formatIndianCurrency(offer.minDeposit)}.`
      );
    }
    if (offer.maxDeposit && input.investmentAmount > offer.maxDeposit) {
      ineligibilityReasons.push(
        `Investment amount exceeds the maximum ceiling of ${formatIndianCurrency(offer.maxDeposit)} for this scheme.`
      );
    }

    // Check payout compatibility
    if (input.depositType === 'cumulative') {
      if (!offer.payoutOptions.includes('cumulative')) {
        ineligibilityReasons.push('This offer does not support cumulative growth option.');
      }
    } else {
      // Non-cumulative
      if (!offer.payoutOptions.includes(input.payoutFrequency)) {
        ineligibilityReasons.push(
          `Offer does not support requested ${input.payoutFrequency} payout frequency.`
        );
      }
    }

    // Check preferred banks filter (if user selected specific banks)
    if (input.preferredBanks && input.preferredBanks.length > 0) {
      if (!input.preferredBanks.includes(offer.bankId)) {
        ineligibilityReasons.push('Bank was not included in your selected preferred banks list.');
      }
    }

    // Check minimum interest rate filter
    const applicableRate =
      input.customerCategory === 'senior_citizen'
        ? offer.seniorCitizenRate
        : offer.regularRate;

    if (input.minInterestRate !== undefined && applicableRate < input.minInterestRate) {
      ineligibilityReasons.push(
        `Rate of ${applicableRate}% is below your minimum threshold of ${input.minInterestRate}%.`
      );
    }

    // Check premature withdrawal flexibility if user strictly preferred it
    if (input.prematureWithdrawalFlexibility && !offer.prematureWithdrawalAllowed) {
      ineligibilityReasons.push('Offer does not allow premature withdrawal (strict lock-in).');
    }

    const isEligible = ineligibilityReasons.length === 0;
    const calculation = calculateForOffer(offer, input);

    return {
      offer,
      calculation,
      isEligible,
      ineligibilityReasons: isEligible ? undefined : ineligibilityReasons,
    };
  });
}

/**
 * Generate deterministic, explainable recommendation based on user goals
 */
export function generateRecommendation(
  evaluatedOffers: OfferComparisonResult[],
  input: CalculationInput
): RecommendationResult | null {
  const eligible = evaluatedOffers.filter((item) => item.isEligible);

  if (eligible.length === 0) {
    return null;
  }

  // Sort eligible offers based on primary goal and flexibility
  const sorted = [...eligible].sort((a, b) => {
    // If premature withdrawal flexibility is preferred, favor allowed offers
    if (input.prematureWithdrawalFlexibility) {
      if (a.offer.prematureWithdrawalAllowed && !b.offer.prematureWithdrawalAllowed) return -1;
      if (!a.offer.prematureWithdrawalAllowed && b.offer.prematureWithdrawalAllowed) return 1;
    }

    if (input.primaryGoal === 'highest_maturity') {
      // Compare maturity amount
      const diffMaturity = b.calculation.maturityAmount - a.calculation.maturityAmount;
      if (Math.abs(diffMaturity) > 0.01) {
        return diffMaturity;
      }
    } else {
      // Primary goal: interest payout
      if (input.depositType === 'non_cumulative') {
        const payoutA = a.calculation.periodicPayoutAmount || 0;
        const payoutB = b.calculation.periodicPayoutAmount || 0;
        const diffPayout = payoutB - payoutA;
        if (Math.abs(diffPayout) > 0.01) {
          return diffPayout;
        }
      }
      // Fallback or cumulative comparison by interest earned
      const diffInterest = b.calculation.interestEarned - a.calculation.interestEarned;
      if (Math.abs(diffInterest) > 0.01) {
        return diffInterest;
      }
    }

    // Secondary tie-breaker: annual rate
    const diffRate = b.calculation.annualRate - a.calculation.annualRate;
    if (Math.abs(diffRate) > 0.001) {
      return diffRate;
    }

    // Tertiary tie-breaker: prefer verified live data over demonstration data
    if (a.offer.verificationStatus === 'verified' && b.offer.verificationStatus !== 'verified') {
      return -1;
    }
    if (a.offer.verificationStatus !== 'verified' && b.offer.verificationStatus === 'verified') {
      return 1;
    }

    return a.offer.bankName.localeCompare(b.offer.bankName);
  });

  const best = sorted[0];
  const alternatives = sorted.slice(1, 4).map((alt) => {
    const diffAmount = best.calculation.maturityAmount - alt.calculation.maturityAmount;
    const diffPercentage =
      alt.calculation.maturityAmount > 0
        ? (diffAmount / alt.calculation.maturityAmount) * 100
        : 0;

    return {
      offer: alt.offer,
      calculation: alt.calculation,
      differenceAmount: Math.round(diffAmount),
      differencePercentage: Number(diffPercentage.toFixed(2)),
    };
  });

  // Construct deterministic, explainable reasons
  const selectionReasons: string[] = [];
  const rateLabel = `${best.calculation.annualRate}% p.a.`;

  if (input.primaryGoal === 'highest_maturity') {
    selectionReasons.push(
      `Provides the highest estimated maturity value of ${formatIndianCurrency(
        best.calculation.maturityAmount
      )} at an annual interest rate of ${rateLabel}.`
    );
  } else {
    selectionReasons.push(
      `Delivers the highest regular periodic payout of ${formatIndianCurrency(
        best.calculation.periodicPayoutAmount || best.calculation.interestEarned
      )} on your chosen ${input.payoutFrequency} schedule at ${rateLabel}.`
    );
  }

  if (best.calculation.compoundingMethod.includes('Quarterly')) {
    selectionReasons.push(
      'Applies quarterly compounding on cumulative growth, maximizing total compound yield over the tenure.'
    );
  }

  if (input.customerCategory === 'senior_citizen') {
    const regularRate = best.offer.regularRate;
    const bonus = Number((best.offer.seniorCitizenRate - regularRate).toFixed(2));
    if (bonus > 0) {
      selectionReasons.push(
        `Includes senior citizen premium of +${bonus}% p.a. over the regular customer rate (${regularRate}%).`
      );
    }
  }

  if (input.prematureWithdrawalFlexibility && best.offer.prematureWithdrawalAllowed) {
    selectionReasons.push(
      `Permits premature withdrawal with documented policy: ${best.offer.prematureWithdrawalPenalty}.`
    );
  }

  if (alternatives.length > 0) {
    const nextBest = alternatives[0];
    const diff = formatIndianCurrency(nextBest.differenceAmount);
    selectionReasons.push(
      `Yields ${diff} more total returns than the closest competing option (${nextBest.offer.bankName}).`
    );
  }

  // Transparency notes
  const transparencyNotes: string[] = [];
  if (best.offer.isDemonstration || best.offer.verificationStatus === 'demonstration') {
    transparencyNotes.push(
      'This recommendation is based on realistic demonstration bank rate data for testing. Verify rates on the official bank portal before investing.'
    );
  } else {
    transparencyNotes.push(
      `Rate verified from official bank published rate sheet as of ${best.offer.lastVerifiedDate}. Source: ${best.offer.sourceUrl}`
    );
  }

  transparencyNotes.push(
    `Deposit is covered up to ₹5,00,000 per depositor under DICGC (Deposit Insurance and Credit Guarantee Corporation) regulations.`
  );

  // Caveats and restrictions
  const caveatsAndRestrictions: string[] = [];
  caveatsAndRestrictions.push(best.calculation.tdsEstimateNote);

  if (best.offer.prematureWithdrawalAllowed) {
    caveatsAndRestrictions.push(
      `Premature liquidation condition: ${best.offer.prematureWithdrawalPenalty}`
    );
  } else {
    caveatsAndRestrictions.push(
      'This product has a strict lock-in; premature withdrawal is not permitted before maturity.'
    );
  }

  return {
    recommendedOffer: best.offer,
    calculation: best.calculation,
    selectionReasons,
    nextBestAlternatives: alternatives,
    transparencyNotes,
    caveatsAndRestrictions,
  };
}
