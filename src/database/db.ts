import { INITIAL_BANKS, INITIAL_OFFERS } from '../data/demoData';
import type { Bank, FDOffer, RateHistoryRecord } from '../types';

// In-memory persistent state for environment where DATABASE_URL is not yet connected
class InMemoryStore {
  private banks: Map<string, Bank> = new Map();
  private offers: Map<string, FDOffer> = new Map();
  private history: Map<string, RateHistoryRecord[]> = new Map();

  constructor() {
    this.seed();
  }

  seed() {
    INITIAL_BANKS.forEach((b) => this.banks.set(b.id, { ...b }));
    INITIAL_OFFERS.forEach((o) => this.offers.set(o.id, { ...o }));
  }

  getBanks(): Bank[] {
    return Array.from(this.banks.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getBankById(id: string): Bank | undefined {
    return this.banks.get(id);
  }

  createBank(bank: Omit<Bank, 'id' | 'createdAt' | 'updatedAt'>): Bank {
    const id = `bank-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newBank: Bank = {
      ...bank,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.banks.set(id, newBank);
    return newBank;
  }

  updateBank(id: string, updates: Partial<Bank>): Bank | null {
    const existing = this.banks.get(id);
    if (!existing) return null;
    const updated: Bank = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.banks.set(id, updated);
    return updated;
  }

  getOffers(onlyActive = true): FDOffer[] {
    const all = Array.from(this.offers.values());
    return onlyActive ? all.filter((o) => o.isActive) : all;
  }

  getOfferById(id: string): FDOffer | undefined {
    return this.offers.get(id);
  }

  createOffer(data: Omit<FDOffer, 'id' | 'bankName' | 'createdAt' | 'updatedAt'>): FDOffer {
    const bank = this.banks.get(data.bankId);
    if (!bank) throw new Error(`Bank with ID ${data.bankId} not found`);

    const id = `offer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newOffer: FDOffer = {
      ...data,
      id,
      bankName: bank.name,
      createdAt: now,
      updatedAt: now,
    };

    this.offers.set(id, newOffer);

    // Record initial history
    this.recordHistory(id, {
      regularRate: newOffer.regularRate,
      seniorCitizenRate: newOffer.seniorCitizenRate,
      changeReason: 'Initial offer creation',
      sourceUrl: newOffer.sourceUrl,
    });

    return newOffer;
  }

  updateOffer(id: string, updates: Partial<FDOffer>, reason?: string): FDOffer | null {
    const existing = this.offers.get(id);
    if (!existing) return null;

    const rateChanged =
      (updates.regularRate !== undefined && updates.regularRate !== existing.regularRate) ||
      (updates.seniorCitizenRate !== undefined && updates.seniorCitizenRate !== existing.seniorCitizenRate);

    const updated: FDOffer = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.bankId && updates.bankId !== existing.bankId) {
      const b = this.banks.get(updates.bankId);
      if (b) updated.bankName = b.name;
    }

    this.offers.set(id, updated);

    if (rateChanged) {
      this.recordHistory(id, {
        regularRate: updated.regularRate,
        seniorCitizenRate: updated.seniorCitizenRate,
        changeReason: reason || 'Rate adjustment',
        sourceUrl: updated.sourceUrl,
      });
    }

    return updated;
  }

  disableOffer(id: string): boolean {
    const existing = this.offers.get(id);
    if (!existing) return false;
    existing.isActive = false;
    existing.updatedAt = new Date().toISOString();
    this.offers.set(id, existing);
    return true;
  }

  recordHistory(
    offerId: string,
    data: {
      regularRate: number;
      seniorCitizenRate: number;
      changeReason?: string;
      sourceUrl?: string;
    }
  ) {
    const records = this.history.get(offerId) || [];
    const historyItem: RateHistoryRecord = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      offerId,
      regularRate: data.regularRate,
      seniorCitizenRate: data.seniorCitizenRate,
      changedAt: new Date().toISOString(),
      changeReason: data.changeReason,
      sourceUrl: data.sourceUrl,
    };
    records.push(historyItem);
    this.history.set(offerId, records);
  }

  getOfferHistory(offerId: string): RateHistoryRecord[] {
    return this.history.get(offerId) || [];
  }
}

// Global instance for local process
const memoryStore = new InMemoryStore();

export const dbService = {
  getBanks: async (): Promise<Bank[]> => {
    return memoryStore.getBanks();
  },

  getBankById: async (id: string): Promise<Bank | undefined> => {
    return memoryStore.getBankById(id);
  },

  createBank: async (bank: Omit<Bank, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bank> => {
    return memoryStore.createBank(bank);
  },

  updateBank: async (id: string, updates: Partial<Bank>): Promise<Bank | null> => {
    return memoryStore.updateBank(id, updates);
  },

  getOffers: async (onlyActive = true): Promise<FDOffer[]> => {
    return memoryStore.getOffers(onlyActive);
  },

  getOfferById: async (id: string): Promise<FDOffer | undefined> => {
    return memoryStore.getOfferById(id);
  },

  createOffer: async (
    data: Omit<FDOffer, 'id' | 'bankName' | 'createdAt' | 'updatedAt'>
  ): Promise<FDOffer> => {
    return memoryStore.createOffer(data);
  },

  updateOffer: async (
    id: string,
    updates: Partial<FDOffer>,
    reason?: string
  ): Promise<FDOffer | null> => {
    return memoryStore.updateOffer(id, updates, reason);
  },

  disableOffer: async (id: string): Promise<boolean> => {
    return memoryStore.disableOffer(id);
  },

  getRateHistory: async (offerId: string): Promise<RateHistoryRecord[]> => {
    return memoryStore.getOfferHistory(offerId);
  },
};
