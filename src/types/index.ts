export type DepositType = 'cumulative' | 'non_cumulative';
export type CustomerCategory = 'regular' | 'senior_citizen';
export type PayoutFrequency = 'cumulative' | 'monthly' | 'quarterly' | 'annual';
export type PrimaryGoal = 'highest_maturity' | 'interest_payout';
export type VerificationStatus = 'verified' | 'stale' | 'expired' | 'demonstration';
export type CompoundingFrequency = 'quarterly' | 'monthly' | 'annual' | 'simple';

export interface Bank {
  id: string;
  name: string;
  code: string;
  officialWebsite: string;
  officialFdRatePage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FDOffer {
  id: string;
  bankId: string;
  bankName: string;
  productName: string;
  minTenureMonths: number;
  maxTenureMonths: number;
  minDeposit: number;
  maxDeposit?: number | null;
  regularRate: number;
  seniorCitizenRate: number;
  compoundingFrequency: CompoundingFrequency;
  payoutOptions: PayoutFrequency[];
  prematureWithdrawalAllowed: boolean;
  prematureWithdrawalPenalty: string;
  effectiveStartDate: string;
  effectiveEndDate?: string | null;
  sourceUrl: string;
  lastVerifiedDate: string;
  verificationStatus: VerificationStatus;
  isDemonstration: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RateHistoryRecord {
  id: string;
  offerId: string;
  regularRate: number;
  seniorCitizenRate: number;
  changedAt: string;
  changeReason?: string;
  sourceUrl?: string;
}

export interface CalculationInput {
  investmentAmount: number;
  tenureValue: number;
  tenureUnit: 'months' | 'years';
  depositType: DepositType;
  customerCategory: CustomerCategory;
  payoutFrequency: PayoutFrequency;
  preferredBanks?: string[];
  minInterestRate?: number;
  primaryGoal: PrimaryGoal;
  prematureWithdrawalFlexibility?: boolean;
}

export interface CalculationResult {
  offerId?: string;
  bankId?: string;
  bankName?: string;
  productName?: string;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  tenureYears: number;
  depositType: DepositType;
  payoutFrequency: PayoutFrequency;
  interestEarned: number;
  maturityAmount: number;
  periodicPayoutAmount?: number;
  numberOfPayouts?: number;
  compoundingMethod: string;
  tdsEstimateNote: string;
  isEstimate: boolean;
  formulaDescription: string;
  prematureWithdrawalPenalty?: string;
  verificationStatus?: VerificationStatus;
  isDemonstration?: boolean;
  sourceUrl?: string;
  lastVerifiedDate?: string;
  effectiveStartDate?: string;
}

export interface OfferComparisonResult {
  offer: FDOffer;
  calculation: CalculationResult;
  isEligible: boolean;
  ineligibilityReasons?: string[];
}

export interface RecommendationResult {
  recommendedOffer: FDOffer;
  calculation: CalculationResult;
  selectionReasons: string[];
  nextBestAlternatives: {
    offer: FDOffer;
    calculation: CalculationResult;
    differenceAmount: number;
    differencePercentage: number;
  }[];
  transparencyNotes: string[];
  caveatsAndRestrictions: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'rate_manager';
  lastLogin?: string;
}
