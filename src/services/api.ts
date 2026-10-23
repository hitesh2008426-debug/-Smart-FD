import type {
  Bank,
  CalculationInput,
  CalculationResult,
  FDOffer,
  OfferComparisonResult,
  RateHistoryRecord,
  RecommendationResult,
} from '../types';
import { dbService } from '../database/db';
import { calculateFixedDeposit, convertTenureToMonths } from '../shared/calculator';
import { evaluateOffers, generateRecommendation } from '../shared/recommendation';
import { calculationInputSchema, offerInputSchema } from '../shared/validation';

const API_BASE = '/.netlify/functions';

// Storage key for admin token
const ADMIN_TOKEN_KEY = 'smart_fd_admin_token';
const ADMIN_USER_KEY = 'smart_fd_admin_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  getUser(): { email: string; role: string } | null {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user: { email: string; role: string }) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
};

export const api = {
  /**
   * Fetch all registered banks
   */
  async getBanks(): Promise<Bank[]> {
    try {
      const res = await fetch(`${API_BASE}/banks`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // Fallback to local dbService
    }
    return dbService.getBanks();
  },

  /**
   * Fetch all FD offers (active or all)
   */
  async getOffers(showAll = false): Promise<FDOffer[]> {
    try {
      const res = await fetch(`${API_BASE}/fd-offers${showAll ? '?all=true' : ''}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // Fallback to local dbService
    }
    return dbService.getOffers(!showAll);
  },

  /**
   * Calculate returns for user input
   */
  async calculate(input: CalculationInput): Promise<CalculationResult> {
    try {
      const res = await fetch(`${API_BASE}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // Fallback
    }

    // Local execution with validation
    const parsed = calculationInputSchema.parse(input);
    const tenureMonths = convertTenureToMonths(parsed.tenureValue, parsed.tenureUnit);
    const rate = parsed.customerCategory === 'senior_citizen' ? 7.50 : 7.00;

    return calculateFixedDeposit({
      principal: parsed.investmentAmount,
      annualRate: rate,
      tenureMonths,
      depositType: parsed.depositType,
      payoutFrequency: parsed.payoutFrequency,
      compoundingFrequency: 'quarterly',
      customerCategory: parsed.customerCategory,
    });
  },

  /**
   * Compare all eligible bank FD offers
   */
  async compare(input: CalculationInput): Promise<{
    results: OfferComparisonResult[];
    totalOffers: number;
    eligibleOffers: number;
  }> {
    try {
      const res = await fetch(`${API_BASE}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // Fallback
    }

    // Local execution
    const parsed = calculationInputSchema.parse(input);
    const offers = await dbService.getOffers(true);
    const results = evaluateOffers({ offers, input: parsed });

    return {
      results,
      totalOffers: offers.length,
      eligibleOffers: results.filter((r) => r.isEligible).length,
    };
  },

  /**
   * Get personalized recommendation
   */
  async recommend(input: CalculationInput): Promise<RecommendationResult | null> {
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // Fallback
    }

    // Local execution
    const parsed = calculationInputSchema.parse(input);
    const offers = await dbService.getOffers(true);
    const evaluated = evaluateOffers({ offers, input: parsed });
    return generateRecommendation(evaluated, parsed);
  },

  /**
   * Administrator Login
   */
  async adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Authentication failed' };
    } catch {
      // Local development fallback
      if (password === 'AdminFD@2026!' || password === 'admin') {
        const token = `local_mock_token_${Date.now()}`;
        authStorage.setToken(token);
        authStorage.setUser({ email, role: 'rate_manager' });
        return { success: true };
      }
      return { success: false, error: 'Invalid password. (Default dev password is: AdminFD@2026!)' };
    }
  },

  /**
   * Admin: Create Offer
   */
  async createOffer(offerData: unknown): Promise<{ success: boolean; data?: FDOffer; error?: string }> {
    const token = authStorage.getToken();
    if (!token) return { success: false, error: 'Unauthorized: Admin login required' };

    try {
      const res = await fetch(`${API_BASE}/admin-offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(offerData),
      });
      const data = await res.json();
      if (res.ok && data.success) return { success: true, data: data.data };
      return { success: false, error: data.error };
    } catch {
      // Local fallback
      try {
        const parsed = offerInputSchema.parse(offerData);
        // @ts-expect-error valid format
        const created = await dbService.createOffer(parsed);
        return { success: true, data: created };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to save offer' };
      }
    }
  },

  /**
   * Admin: Update Offer
   */
  async updateOffer(
    id: string,
    updates: Partial<FDOffer>,
    reason?: string
  ): Promise<{ success: boolean; data?: FDOffer; error?: string }> {
    const token = authStorage.getToken();
    if (!token) return { success: false, error: 'Unauthorized: Admin login required' };

    try {
      const res = await fetch(`${API_BASE}/admin-offers?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...updates, id, changeReason: reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) return { success: true, data: data.data };
      return { success: false, error: data.error };
    } catch {
      // Local fallback
      const updated = await dbService.updateOffer(id, updates, reason);
      if (updated) return { success: true, data: updated };
      return { success: false, error: 'Offer not found' };
    }
  },

  /**
   * Admin: Disable Offer
   */
  async disableOffer(id: string): Promise<{ success: boolean; error?: string }> {
    const token = authStorage.getToken();
    if (!token) return { success: false, error: 'Unauthorized: Admin login required' };

    try {
      const res = await fetch(`${API_BASE}/admin-offers?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) return { success: true };
      return { success: false, error: data.error };
    } catch {
      // Local fallback
      const success = await dbService.disableOffer(id);
      return { success };
    }
  },

  /**
   * Admin: Get Rate History
   */
  async getRateHistory(offerId: string): Promise<RateHistoryRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/admin-offers?historyFor=${offerId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // Local fallback
    }
    return dbService.getRateHistory(offerId);
  },
};
