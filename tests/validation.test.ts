import { describe, it, expect } from 'vitest';
import {
  calculationInputSchema,
  offerInputSchema,
  bankInputSchema,
} from '../src/shared/validation';

describe('Zod Validation Schemas', () => {
  describe('calculationInputSchema', () => {
    it('accepts valid input', () => {
      const valid = {
        investmentAmount: 100000,
        tenureValue: 12,
        tenureUnit: 'months',
        depositType: 'cumulative',
        customerCategory: 'regular',
        payoutFrequency: 'cumulative',
        primaryGoal: 'highest_maturity',
        prematureWithdrawalFlexibility: false,
      };

      const result = calculationInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects investment amount below ₹1,000', () => {
      const invalid = {
        investmentAmount: 500,
        tenureValue: 1,
        tenureUnit: 'years',
        depositType: 'cumulative',
        customerCategory: 'regular',
        payoutFrequency: 'cumulative',
        primaryGoal: 'highest_maturity',
      };

      const result = calculationInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues || (result.error as any).errors;
        expect(issues[0].message).toContain('Minimum investment amount is ₹1,000');
      }
    });

    it('rejects investment amount above ₹10 Crore', () => {
      const invalid = {
        investmentAmount: 200000000, // 20 Cr
        tenureValue: 1,
        tenureUnit: 'years',
        depositType: 'cumulative',
        customerCategory: 'regular',
        payoutFrequency: 'cumulative',
        primaryGoal: 'highest_maturity',
      };

      const result = calculationInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues || (result.error as any).errors;
        expect(issues[0].message).toContain('Maximum investment amount');
      }
    });

    it('rejects non-cumulative deposit when payout frequency is set to cumulative', () => {
      const invalid = {
        investmentAmount: 100000,
        tenureValue: 1,
        tenureUnit: 'years',
        depositType: 'non_cumulative',
        customerCategory: 'regular',
        payoutFrequency: 'cumulative', // invalid combination
        primaryGoal: 'interest_payout',
      };

      const result = calculationInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('offerInputSchema', () => {
    it('rejects offer where minTenure > maxTenure', () => {
      const invalid = {
        bankId: 'bank-sbi',
        productName: 'Invalid Tenure Scheme',
        minTenureMonths: 24,
        maxTenureMonths: 12, // smaller than minTenure
        minDeposit: 1000,
        regularRate: 7.0,
        seniorCitizenRate: 7.5,
        compoundingFrequency: 'quarterly',
        payoutOptions: ['cumulative'],
        prematureWithdrawalAllowed: true,
        prematureWithdrawalPenalty: '1%',
        effectiveStartDate: '2026-01-01',
        sourceUrl: 'https://bank.com',
        verificationStatus: 'verified',
        isDemonstration: false,
        isActive: true,
      };

      const result = offerInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid source URL', () => {
      const invalid = {
        bankId: 'bank-sbi',
        productName: 'Invalid URL Scheme',
        minTenureMonths: 12,
        maxTenureMonths: 24,
        minDeposit: 1000,
        regularRate: 7.0,
        seniorCitizenRate: 7.5,
        compoundingFrequency: 'quarterly',
        payoutOptions: ['cumulative'],
        prematureWithdrawalAllowed: true,
        prematureWithdrawalPenalty: '1%',
        effectiveStartDate: '2026-01-01',
        sourceUrl: 'not-a-valid-url',
        verificationStatus: 'verified',
        isDemonstration: false,
        isActive: true,
      };

      const result = offerInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('bankInputSchema', () => {
    it('accepts valid bank input', () => {
      const valid = {
        name: 'State Bank of India',
        code: 'SBI',
        officialWebsite: 'https://sbi.co.in',
        officialFdRatePage: 'https://sbi.co.in/rates',
        isActive: true,
      };

      const result = bankInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
