-- Initial PostgreSQL Schema for Smart FD Calculator

CREATE TABLE IF NOT EXISTS banks (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  code VARCHAR(32) NOT NULL UNIQUE,
  official_website TEXT NOT NULL,
  official_fd_rate_page TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS fd_offers (
  id VARCHAR(64) PRIMARY KEY,
  bank_id VARCHAR(64) NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  min_tenure_months INTEGER NOT NULL,
  max_tenure_months INTEGER NOT NULL,
  min_deposit NUMERIC(14, 2) NOT NULL,
  max_deposit NUMERIC(14, 2),
  regular_rate NUMERIC(5, 2) NOT NULL,
  senior_citizen_rate NUMERIC(5, 2) NOT NULL,
  compounding_frequency VARCHAR(32) DEFAULT 'quarterly' NOT NULL,
  payout_options JSONB NOT NULL,
  premature_withdrawal_allowed BOOLEAN DEFAULT TRUE NOT NULL,
  premature_withdrawal_penalty TEXT NOT NULL,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  source_url TEXT NOT NULL,
  last_verified_date DATE NOT NULL,
  verification_status VARCHAR(32) DEFAULT 'verified' NOT NULL,
  is_demonstration BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_history (
  id VARCHAR(64) PRIMARY KEY,
  offer_id VARCHAR(64) NOT NULL REFERENCES fd_offers(id) ON DELETE CASCADE,
  regular_rate NUMERIC(5, 2) NOT NULL,
  senior_citizen_rate NUMERIC(5, 2) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  change_reason TEXT,
  source_url TEXT
);

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'rate_manager' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fd_offers_bank_id ON fd_offers(bank_id);
CREATE INDEX IF NOT EXISTS idx_fd_offers_rates ON fd_offers(regular_rate, senior_citizen_rate);
CREATE INDEX IF NOT EXISTS idx_rate_history_offer ON rate_history(offer_id);
