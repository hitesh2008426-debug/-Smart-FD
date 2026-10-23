import { z } from 'zod';

export const calculationInputSchema = z
  .object({
    investmentAmount: z
      .number()
      .positive('Investment amount must be greater than zero')
      .min(1000, 'Minimum investment amount is ₹1,000')
      .max(100000000, 'Maximum investment amount is ₹10,00,00,000 (₹10 Crore)')
      .finite('Investment amount must be a finite number'),
    tenureValue: z
      .number()
      .positive('Tenure must be greater than zero')
      .min(1, 'Minimum tenure is 1 month or 1 year')
      .max(120, 'Maximum tenure is 10 years (120 months)')
      .finite('Tenure must be a finite number'),
    tenureUnit: z.enum(['months', 'years']),
    depositType: z.enum(['cumulative', 'non_cumulative']),
    customerCategory: z.enum(['regular', 'senior_citizen']),
    payoutFrequency: z.enum(['cumulative', 'monthly', 'quarterly', 'annual']),
    preferredBanks: z.array(z.string()).optional(),
    minInterestRate: z.number().min(0).max(20).optional(),
    primaryGoal: z.enum(['highest_maturity', 'interest_payout']),
    prematureWithdrawalFlexibility: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      // If non-cumulative is selected, payout frequency cannot be 'cumulative'
      if (data.depositType === 'non_cumulative' && data.payoutFrequency === 'cumulative') {
        return false;
      }
      return true;
    },
    {
      message:
        'Non-cumulative deposits require a periodic payout frequency (monthly, quarterly, or annual)',
      path: ['payoutFrequency'],
    }
  );

export const offerInputSchema = z
  .object({
    bankId: z.string().min(1, 'Bank is required'),
    productName: z.string().min(2, 'Product name is required'),
    minTenureMonths: z.number().min(1, 'Min tenure must be at least 1 month'),
    maxTenureMonths: z.number().max(120, 'Max tenure cannot exceed 120 months'),
    minDeposit: z.number().min(100, 'Min deposit must be at least ₹100'),
    maxDeposit: z.number().optional().nullable(),
    regularRate: z
      .number()
      .min(1.0, 'Regular rate must be at least 1%')
      .max(20.0, 'Regular rate cannot exceed 20%'),
    seniorCitizenRate: z
      .number()
      .min(1.0, 'Senior citizen rate must be at least 1%')
      .max(20.0, 'Senior citizen rate cannot exceed 20%'),
    compoundingFrequency: z.enum(['quarterly', 'monthly', 'annual', 'simple']),
    payoutOptions: z
      .array(z.enum(['cumulative', 'monthly', 'quarterly', 'annual']))
      .min(1, 'At least one payout option required'),
    prematureWithdrawalAllowed: z.boolean(),
    prematureWithdrawalPenalty: z.string().min(1, 'Penalty terms must be specified'),
    effectiveStartDate: z.string().min(10, 'Valid effective date required (YYYY-MM-DD)'),
    effectiveEndDate: z.string().optional().nullable(),
    sourceUrl: z.string().url('Must be a valid URL pointing to official bank rate sheet'),
    verificationStatus: z.enum(['verified', 'stale', 'expired', 'demonstration']),
    isDemonstration: z.boolean(),
    isActive: z.boolean(),
    notes: z.string().optional(),
  })
  .refine((data) => data.minTenureMonths <= data.maxTenureMonths, {
    message: 'Minimum tenure cannot exceed maximum tenure',
    path: ['minTenureMonths'],
  });

export const bankInputSchema = z.object({
  name: z.string().min(2, 'Bank name is required'),
  code: z.string().min(2, 'Bank code is required').toUpperCase(),
  officialWebsite: z.string().url('Must be a valid URL'),
  officialFdRatePage: z.string().url('Must be a valid rate page URL'),
  isActive: z.boolean().default(true),
});

export type ValidatedCalculationInput = z.infer<typeof calculationInputSchema>;
export type ValidatedOfferInput = z.infer<typeof offerInputSchema>;
export type ValidatedBankInput = z.infer<typeof bankInputSchema>;
