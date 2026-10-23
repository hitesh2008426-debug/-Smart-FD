import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const banks = pgTable('banks', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: text('name').notNull(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  officialWebsite: text('official_website').notNull(),
  officialFdRatePage: text('official_fd_rate_page').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const fdOffers = pgTable('fd_offers', {
  id: varchar('id', { length: 64 }).primaryKey(),
  bankId: varchar('bank_id', { length: 64 })
    .notNull()
    .references(() => banks.id, { onDelete: 'cascade' }),
  productName: text('product_name').notNull(),
  minTenureMonths: integer('min_tenure_months').notNull(),
  maxTenureMonths: integer('max_tenure_months').notNull(),
  minDeposit: numeric('min_deposit', { precision: 14, scale: 2 }).notNull(),
  maxDeposit: numeric('max_deposit', { precision: 14, scale: 2 }),
  regularRate: numeric('regular_rate', { precision: 5, scale: 2 }).notNull(),
  seniorCitizenRate: numeric('senior_citizen_rate', { precision: 5, scale: 2 }).notNull(),
  compoundingFrequency: varchar('compounding_frequency', { length: 32 }).default('quarterly').notNull(),
  payoutOptions: jsonb('payout_options').$type<string[]>().notNull(),
  prematureWithdrawalAllowed: boolean('premature_withdrawal_allowed').default(true).notNull(),
  prematureWithdrawalPenalty: text('premature_withdrawal_penalty').notNull(),
  effectiveStartDate: date('effective_start_date').notNull(),
  effectiveEndDate: date('effective_end_date'),
  sourceUrl: text('source_url').notNull(),
  lastVerifiedDate: date('last_verified_date').notNull(),
  verificationStatus: varchar('verification_status', { length: 32 }).default('verified').notNull(),
  isDemonstration: boolean('is_demonstration').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const rateHistory = pgTable('rate_history', {
  id: varchar('id', { length: 64 }).primaryKey(),
  offerId: varchar('offer_id', { length: 64 })
    .notNull()
    .references(() => fdOffers.id, { onDelete: 'cascade' }),
  regularRate: numeric('regular_rate', { precision: 5, scale: 2 }).notNull(),
  seniorCitizenRate: numeric('senior_citizen_rate', { precision: 5, scale: 2 }).notNull(),
  changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),
  changeReason: text('change_reason'),
  sourceUrl: text('source_url'),
});

export const adminUsers = pgTable('admin_users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).default('rate_manager').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});

export const banksRelations = relations(banks, ({ many }) => ({
  offers: many(fdOffers),
}));

export const fdOffersRelations = relations(fdOffers, ({ one, many }) => ({
  bank: one(banks, {
    fields: [fdOffers.bankId],
    references: [banks.id],
  }),
  history: many(rateHistory),
}));

export const rateHistoryRelations = relations(rateHistory, ({ one }) => ({
  offer: one(fdOffers, {
    fields: [rateHistory.offerId],
    references: [fdOffers.id],
  }),
}));
