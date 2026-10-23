import { describe, it, expect } from 'vitest';
import {
  calculateFixedDeposit,
  validateCalculationParams,
  formatIndianCurrency,
  convertTenureToMonths,
} from '../src/shared/calculator';

describe('Financial Calculation Engine', () => {
  describe('Quarterly Compounding Formula: A = P × (1 + r/400)^(4t)', () => {
    it('accurately calculates 1-year cumulative FD with 8% nominal rate', () => {
      // P = 100,000, r = 8%, t = 1 yr (12 months)
      // A = 100000 * (1 + 0.02)^4 = 100000 * 1.08243216 = 108243.22
      const result = calculateFixedDeposit({
        principal: 100000,
        annualRate: 8.0,
        tenureMonths: 12,
        depositType: 'cumulative',
        payoutFrequency: 'cumulative',
        compoundingFrequency: 'quarterly',
      });

      expect(result.maturityAmount).toBeCloseTo(108243.22, 1);
      expect(result.interestEarned).toBeCloseTo(8243.22, 1);
      expect(result.principal).toBe(100000);
      expect(result.compoundingMethod).toContain('Quarterly');
    });

    it('accurately calculates 2-year cumulative FD with 7.10% nominal rate', () => {
      // P = 100,000, r = 7.1%, t = 2 yrs (24 months, 8 quarters)
      // A = 100000 * (1 + 7.1/400)^8 = 100000 * 1.15142127 = 115142.13
      const result = calculateFixedDeposit({
        principal: 100000,
        annualRate: 7.1,
        tenureMonths: 24,
        depositType: 'cumulative',
        payoutFrequency: 'cumulative',
        compoundingFrequency: 'quarterly',
      });

      expect(result.maturityAmount).toBeCloseTo(115114.20, 1);
      expect(result.interestEarned).toBeCloseTo(15114.20, 1);
    });

    it('accurately calculates 5-year cumulative FD with 7.5% nominal rate', () => {
      // P = 500,000, r = 7.5%, t = 5 yrs (60 months, 20 quarters)
      // A = 500000 * (1 + 7.5/400)^20 = 500000 * 1.44994801 = 724974.00
      const result = calculateFixedDeposit({
        principal: 500000,
        annualRate: 7.5,
        tenureMonths: 60,
        depositType: 'cumulative',
        payoutFrequency: 'cumulative',
        compoundingFrequency: 'quarterly',
      });

      expect(result.maturityAmount).toBeCloseTo(724974.0, 0);
      expect(result.interestEarned).toBeCloseTo(224974.0, 0);
    });
  });

  describe('Simple Interest for Short Duration (< 6 Months)', () => {
    it('applies simple interest for 3-month deposit per RBI guidelines', () => {
      // P = 100,000, r = 6.0%, t = 3 months (0.25 yrs)
      // I = 100000 * 6/100 * 3/12 = 1,500.00
      const result = calculateFixedDeposit({
        principal: 100000,
        annualRate: 6.0,
        tenureMonths: 3,
        depositType: 'cumulative',
        payoutFrequency: 'cumulative',
      });

      expect(result.interestEarned).toBe(1500);
      expect(result.maturityAmount).toBe(101500);
      expect(result.compoundingMethod).toContain('Simple interest');
    });
  });

  describe('Non-Cumulative Deposits with Periodic Payouts', () => {
    it('calculates monthly interest payout schedule', () => {
      // P = 100,000, r = 7.2%, tenure = 12 months
      // Monthly payout = 100000 * 7.2 / 1200 = 600.00
      const result = calculateFixedDeposit({
        principal: 100000,
        annualRate: 7.2,
        tenureMonths: 12,
        depositType: 'non_cumulative',
        payoutFrequency: 'monthly',
      });

      expect(result.periodicPayoutAmount).toBe(600);
      expect(result.numberOfPayouts).toBe(12);
      expect(result.interestEarned).toBe(7200);
      expect(result.maturityAmount).toBe(100000); // Principal refunded at maturity
    });

    it('calculates quarterly interest payout schedule', () => {
      // P = 200,000, r = 8.0%, tenure = 12 months (4 quarters)
      // Quarterly payout = 200000 * 8 / 400 = 4,000.00
      const result = calculateFixedDeposit({
        principal: 200000,
        annualRate: 8.0,
        tenureMonths: 12,
        depositType: 'non_cumulative',
        payoutFrequency: 'quarterly',
      });

      expect(result.periodicPayoutAmount).toBe(4000);
      expect(result.numberOfPayouts).toBe(4);
      expect(result.interestEarned).toBe(16000);
      expect(result.maturityAmount).toBe(200000);
    });

    it('calculates annual interest payout schedule', () => {
      // P = 100,000, r = 7.5%, tenure = 24 months (2 years)
      // Annual payout = 100000 * 7.5 / 100 = 7,500.00
      const result = calculateFixedDeposit({
        principal: 100000,
        annualRate: 7.5,
        tenureMonths: 24,
        depositType: 'non_cumulative',
        payoutFrequency: 'annual',
      });

      expect(result.periodicPayoutAmount).toBe(7500);
      expect(result.numberOfPayouts).toBe(2);
      expect(result.interestEarned).toBe(15000);
      expect(result.maturityAmount).toBe(100000);
    });
  });

  describe('Validation & Edge Cases', () => {
    it('throws error for negative principal', () => {
      expect(() =>
        validateCalculationParams({ principal: -5000, annualRate: 7.0, tenureMonths: 12 })
      ).toThrow('Principal must be a positive finite number');
    });

    it('throws error for zero principal', () => {
      expect(() =>
        validateCalculationParams({ principal: 0, annualRate: 7.0, tenureMonths: 12 })
      ).toThrow('Principal must be a positive finite number');
    });

    it('throws error for non-finite values (NaN / Infinity)', () => {
      expect(() =>
        validateCalculationParams({ principal: NaN, annualRate: 7.0, tenureMonths: 12 })
      ).toThrow();
      expect(() =>
        validateCalculationParams({ principal: 10000, annualRate: Infinity, tenureMonths: 12 })
      ).toThrow();
    });

    it('throws error for out-of-range interest rates', () => {
      expect(() =>
        validateCalculationParams({ principal: 10000, annualRate: 45.0, tenureMonths: 12 })
      ).toThrow('Annual interest rate exceeds realistic bank limits');
    });
  });

  describe('Indian Currency Number Formatting', () => {
    it('formats ₹1,000 correctly', () => {
      expect(formatIndianCurrency(1000)).toBe('₹1,000');
    });

    it('formats ₹1,00,000 (1 Lakh) correctly', () => {
      expect(formatIndianCurrency(100000)).toBe('₹1,00,000');
    });

    it('formats ₹1,00,00,000 (1 Crore) correctly', () => {
      expect(formatIndianCurrency(10000000)).toBe('₹1,00,00,000');
    });
  });

  describe('Tenure Unit Conversion', () => {
    it('converts years to months', () => {
      expect(convertTenureToMonths(2, 'years')).toBe(24);
      expect(convertTenureToMonths(1.5, 'years')).toBe(18);
    });

    it('preserves months unit', () => {
      expect(convertTenureToMonths(15, 'months')).toBe(15);
    });
  });
});
