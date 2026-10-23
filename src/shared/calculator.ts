import Decimal from 'decimal.js';
import type {
  CalculationInput,
  CalculationResult,
  CustomerCategory,
  DepositType,
  PayoutFrequency,
  CompoundingFrequency,
  FDOffer,
} from '../types';

// Configure Decimal precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface CalculationOptions {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  depositType: DepositType;
  payoutFrequency: PayoutFrequency;
  compoundingFrequency?: CompoundingFrequency;
  customerCategory?: CustomerCategory;
  offer?: Partial<FDOffer>;
}

/**
 * Validates calculation arguments for safety and financial bounds
 */
export function validateCalculationParams(params: {
  principal: number;
  annualRate: number;
  tenureMonths: number;
}): void {
  const { principal, annualRate, tenureMonths } = params;

  if (typeof principal !== 'number' || !Number.isFinite(principal) || principal <= 0) {
    throw new Error('Principal must be a positive finite number');
  }
  if (principal < 100 || principal > 1_000_000_000) {
    throw new Error('Principal is out of supported range (₹100 to ₹100 Crore)');
  }

  if (typeof annualRate !== 'number' || !Number.isFinite(annualRate) || annualRate <= 0) {
    throw new Error('Annual interest rate must be a positive finite number');
  }
  if (annualRate > 30) {
    throw new Error('Annual interest rate exceeds realistic bank limits (max 30%)');
  }

  if (typeof tenureMonths !== 'number' || !Number.isFinite(tenureMonths) || tenureMonths <= 0) {
    throw new Error('Tenure in months must be a positive finite number');
  }
  if (tenureMonths > 240) {
    throw new Error('Tenure exceeds supported maximum duration (20 years / 240 months)');
  }
}

/**
 * Formats currency in Indian numbering format (e.g. ₹1,25,000)
 */
export function formatIndianCurrency(amount: number, includeDecimals = false): string {
  if (!Number.isFinite(amount)) return '₹0';
  const rounded = includeDecimals ? amount.toFixed(2) : Math.round(amount).toString();
  const parts = rounded.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.substring(1);

  // Indian number formatting: 3 digits from right, then groups of 2
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}₹${formattedInteger}${decimalPart}`;
}

/**
 * Calculate maturity and interest for Fixed Deposits
 */
export function calculateFixedDeposit(options: CalculationOptions): CalculationResult {
  const {
    principal,
    annualRate,
    tenureMonths,
    depositType,
    payoutFrequency,
    compoundingFrequency = 'quarterly',
    customerCategory = 'regular',
    offer,
  } = options;

  validateCalculationParams({ principal, annualRate, tenureMonths });

  const p = new Decimal(principal);
  const r = new Decimal(annualRate);
  const months = new Decimal(tenureMonths);
  const years = months.dividedBy(12);

  let maturityAmount = new Decimal(0);
  let interestEarned = new Decimal(0);
  let periodicPayoutAmount: number | undefined;
  let numberOfPayouts: number | undefined;
  let compoundingMethod = '';
  let formulaDescription = '';

  // Determine calculation path
  if (depositType === 'cumulative') {
    // For tenures under 6 months (180 days), Indian banks universally apply Simple Interest per RBI rules
    if (tenureMonths < 6 || compoundingFrequency === 'simple') {
      // Simple Interest: I = P * r * t / 100
      interestEarned = p.times(r).times(years).dividedBy(100);
      maturityAmount = p.plus(interestEarned);
      compoundingMethod = 'Simple interest (applicable for tenure < 6 months per RBI norms)';
      formulaDescription = 'A = P + (P × r × t / 100)';
    } else if (compoundingFrequency === 'quarterly') {
      // Standard Quarterly Compounding: A = P * (1 + r/400)^(4t)
      // 4t = 4 * (months / 12) = months / 3
      const numQuarters = months.dividedBy(3);
      const ratePerQuarter = r.dividedBy(400);
      const multiplier = new Decimal(1).plus(ratePerQuarter).pow(numQuarters.toNumber());

      maturityAmount = p.times(multiplier);
      interestEarned = maturityAmount.minus(p);
      compoundingMethod = 'Quarterly compounding (standard Indian banking convention)';
      formulaDescription = 'A = P × (1 + r/400)^(4t)';
    } else if (compoundingFrequency === 'monthly') {
      // Monthly Compounding: A = P * (1 + r/1200)^(12t)
      const numMonths = months.toNumber();
      const ratePerMonth = r.dividedBy(1200);
      const multiplier = new Decimal(1).plus(ratePerMonth).pow(numMonths);

      maturityAmount = p.times(multiplier);
      interestEarned = maturityAmount.minus(p);
      compoundingMethod = 'Monthly compounding';
      formulaDescription = 'A = P × (1 + r/1200)^(12t)';
    } else if (compoundingFrequency === 'annual') {
      // Annual Compounding: A = P * (1 + r/100)^t
      const multiplier = new Decimal(1).plus(r.dividedBy(100)).pow(years.toNumber());
      maturityAmount = p.times(multiplier);
      interestEarned = maturityAmount.minus(p);
      compoundingMethod = 'Annual compounding';
      formulaDescription = 'A = P × (1 + r/100)^t';
    } else {
      // Fallback quarterly compounding
      const numQuarters = months.dividedBy(3);
      const ratePerQuarter = r.dividedBy(400);
      const multiplier = new Decimal(1).plus(ratePerQuarter).pow(numQuarters.toNumber());
      maturityAmount = p.times(multiplier);
      interestEarned = maturityAmount.minus(p);
      compoundingMethod = 'Quarterly compounding';
      formulaDescription = 'A = P × (1 + r/400)^(4t)';
    }
  } else {
    // Non-cumulative Fixed Deposit: Interest is paid out periodically
    // Principal P remains constant and is refunded upon maturity.
    switch (payoutFrequency) {
      case 'monthly': {
        // Standard discounted monthly interest formula per Indian banks:
        // Monthly interest = P * r / 1200 (simple prorated) or discounted quarterly equivalent
        // In practice, Indian banks pay simple prorated monthly interest: P * (r / 1200)
        numberOfPayouts = Math.floor(tenureMonths);
        const monthlyPayout = p.times(r).dividedBy(1200);
        periodicPayoutAmount = monthlyPayout.toDecimalPlaces(2).toNumber();
        interestEarned = monthlyPayout.times(numberOfPayouts);
        maturityAmount = p; // Principal returned at end
        compoundingMethod = 'Non-cumulative monthly payout';
        formulaDescription = 'Monthly Payout = P × r / 1200; Principal refunded at maturity';
        break;
      }
      case 'quarterly': {
        // Quarterly payout: P * r / 400
        numberOfPayouts = Math.floor(tenureMonths / 3);
        const quarterlyPayout = p.times(r).dividedBy(400);
        periodicPayoutAmount = quarterlyPayout.toDecimalPlaces(2).toNumber();
        interestEarned = quarterlyPayout.times(numberOfPayouts);
        maturityAmount = p; // Principal returned at end
        compoundingMethod = 'Non-cumulative quarterly payout';
        formulaDescription = 'Quarterly Payout = P × r / 400; Principal refunded at maturity';
        break;
      }
      case 'annual': {
        // Annual payout: P * r / 100
        numberOfPayouts = Math.floor(tenureMonths / 12);
        const annualPayout = p.times(r).dividedBy(100);
        periodicPayoutAmount = annualPayout.toDecimalPlaces(2).toNumber();
        interestEarned = annualPayout.times(numberOfPayouts);
        maturityAmount = p; // Principal returned at end
        compoundingMethod = 'Non-cumulative annual payout';
        formulaDescription = 'Annual Payout = P × r / 100; Principal refunded at maturity';
        break;
      }
      default: {
        // Default to quarterly payout if undefined
        numberOfPayouts = Math.floor(tenureMonths / 3);
        const quarterlyPayout = p.times(r).dividedBy(400);
        periodicPayoutAmount = quarterlyPayout.toDecimalPlaces(2).toNumber();
        interestEarned = quarterlyPayout.times(numberOfPayouts);
        maturityAmount = p;
        compoundingMethod = 'Non-cumulative periodic payout';
        formulaDescription = 'Payout = P × r / (m × 100); Principal refunded at maturity';
        break;
      }
    }
  }

  // Calculate rounded values
  const roundedInterest = interestEarned.toDecimalPlaces(2).toNumber();
  const roundedMaturity = maturityAmount.toDecimalPlaces(2).toNumber();

  // TDS estimate disclosure
  const annualInterest = roundedInterest / (tenureMonths / 12);
  const tdsThreshold = customerCategory === 'senior_citizen' ? 50000 : 40000;
  let tdsEstimateNote = 'Estimated interest is gross pre-tax. ';

  if (annualInterest > tdsThreshold) {
    tdsEstimateNote += `Projected annual interest (~₹${Math.round(annualInterest).toLocaleString('en-IN')}) exceeds the ₹${tdsThreshold.toLocaleString('en-IN')} threshold under Section 194A/80TTB. TDS of 10% (approx ₹${Math.round(annualInterest * 0.1).toLocaleString('en-IN')}/year) may be deducted by the bank unless Form 15G/15H is submitted.`;
  } else {
    tdsEstimateNote += `Estimated annual interest (~₹${Math.round(annualInterest).toLocaleString('en-IN')}) is within the ₹${tdsThreshold.toLocaleString('en-IN')} TDS exemption limit. No TDS is expected under Section 194A/80TTB.`;
  }

  return {
    offerId: offer?.id,
    bankId: offer?.bankId,
    bankName: offer?.bankName,
    productName: offer?.productName,
    principal,
    annualRate,
    tenureMonths,
    tenureYears: Number(years.toFixed(2)),
    depositType,
    payoutFrequency,
    interestEarned: roundedInterest,
    maturityAmount: roundedMaturity,
    periodicPayoutAmount,
    numberOfPayouts,
    compoundingMethod,
    tdsEstimateNote,
    isEstimate: true,
    formulaDescription,
    prematureWithdrawalPenalty: offer?.prematureWithdrawalPenalty,
    verificationStatus: offer?.verificationStatus,
    isDemonstration: offer?.isDemonstration,
    sourceUrl: offer?.sourceUrl,
    lastVerifiedDate: offer?.lastVerifiedDate,
    effectiveStartDate: offer?.effectiveStartDate,
  };
}

/**
 * Normalizes user tenure input into months
 */
export function convertTenureToMonths(value: number, unit: 'months' | 'years'): number {
  return unit === 'years' ? value * 12 : value;
}

/**
 * Calculates results for a user input across an offer
 */
export function calculateForOffer(
  offer: FDOffer,
  input: CalculationInput
): CalculationResult {
  const tenureMonths = convertTenureToMonths(input.tenureValue, input.tenureUnit);
  const applicableRate =
    input.customerCategory === 'senior_citizen'
      ? offer.seniorCitizenRate
      : offer.regularRate;

  return calculateFixedDeposit({
    principal: input.investmentAmount,
    annualRate: applicableRate,
    tenureMonths,
    depositType: input.depositType,
    payoutFrequency: input.payoutFrequency,
    compoundingFrequency: offer.compoundingFrequency,
    customerCategory: input.customerCategory,
    offer,
  });
}
