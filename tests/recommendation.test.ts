import { describe, it, expect } from 'vitest';
import { evaluateOffers, generateRecommendation } from '../src/shared/recommendation';
import { INITIAL_OFFERS } from '../src/data/demoData';
import type { CalculationInput, FDOffer } from '../src/types';

describe('Recommendation & Eligibility Engine', () => {
  const baseInput: CalculationInput = {
    investmentAmount: 100000,
    tenureValue: 1,
    tenureUnit: 'years',
    depositType: 'cumulative',
    customerCategory: 'regular',
    payoutFrequency: 'cumulative',
    primaryGoal: 'highest_maturity',
    prematureWithdrawalFlexibility: false,
  };

  it('filters out offers with tenure bounds outside the requested duration', () => {
    // 6-month tenure (below 12-month minimum of standard offers)
    const shortInput: CalculationInput = {
      ...baseInput,
      tenureValue: 6,
      tenureUnit: 'months',
    };

    const evaluated = evaluateOffers({ offers: INITIAL_OFFERS, input: shortInput });
    const sbiOffer = evaluated.find((e) => e.offer.id === 'offer-sbi-1y');

    expect(sbiOffer).toBeDefined();
    expect(sbiOffer?.isEligible).toBe(false);
    expect(sbiOffer?.ineligibilityReasons?.[0]).toContain('below minimum required');
  });

  it('filters out non-callable offers when deposit is below minimum threshold', () => {
    // PNB Uttam requires min ₹15,00,000
    const smallDepositInput: CalculationInput = {
      ...baseInput,
      investmentAmount: 50000, // ₹50k is below ₹15L
    };

    const evaluated = evaluateOffers({ offers: INITIAL_OFFERS, input: smallDepositInput });
    const pnbUttam = evaluated.find((e) => e.offer.id === 'offer-pnb-uttam');

    expect(pnbUttam).toBeDefined();
    expect(pnbUttam?.isEligible).toBe(false);
    expect(pnbUttam?.ineligibilityReasons?.[0]).toContain('below the required minimum deposit');
  });

  it('filters out non-callable offers when user demands premature withdrawal flexibility', () => {
    const flexibleInput: CalculationInput = {
      ...baseInput,
      investmentAmount: 2000000, // ₹20 Lakh meets min deposit
      prematureWithdrawalFlexibility: true,
    };

    const evaluated = evaluateOffers({ offers: INITIAL_OFFERS, input: flexibleInput });
    const pnbUttam = evaluated.find((e) => e.offer.id === 'offer-pnb-uttam');

    expect(pnbUttam).toBeDefined();
    expect(pnbUttam?.isEligible).toBe(false);
    expect(pnbUttam?.ineligibilityReasons?.[0]).toContain('strict lock-in');
  });

  it('ranks by highest maturity value for highest_maturity goal', () => {
    const evaluated = evaluateOffers({ offers: INITIAL_OFFERS, input: baseInput });
    const recommendation = generateRecommendation(evaluated, baseInput);

    expect(recommendation).not.toBeNull();
    // Highest eligible rate among 1-year commercial bank offers
    expect(recommendation?.recommendedOffer.regularRate).toBeGreaterThanOrEqual(7.0);
    expect(recommendation?.selectionReasons.length).toBeGreaterThan(0);
    expect(recommendation?.nextBestAlternatives.length).toBeGreaterThan(0);
  });

  it('awards senior citizen rate bonuses correctly', () => {
    const seniorInput: CalculationInput = {
      ...baseInput,
      customerCategory: 'senior_citizen',
    };

    const evaluated = evaluateOffers({ offers: INITIAL_OFFERS, input: seniorInput });
    const recommendation = generateRecommendation(evaluated, seniorInput);

    expect(recommendation).not.toBeNull();
    expect(recommendation?.calculation.annualRate).toBeGreaterThan(
      recommendation?.recommendedOffer.regularRate || 0
    );
    expect(
      recommendation?.selectionReasons.some((r) => r.includes('senior citizen'))
    ).toBe(true);
  });

  it('returns null when no offers meet filter criteria', () => {
    const impossibleInput: CalculationInput = {
      ...baseInput,
      minInterestRate: 15.0, // No bank offers 15%
    };

    const evaluated = evaluateOffers({ offers: INITIAL_OFFERS, input: impossibleInput });
    const recommendation = generateRecommendation(evaluated, impossibleInput);

    expect(recommendation).toBeNull();
  });
});
