# Smart FD & Bank Interest Comparison Platform

**Smart FD Calculator** is a production-oriented financial calculation and multi-bank fixed deposit comparison platform. It provides mathematically rigorous quarterly compounding calculations, regular versus senior citizen rate spreads, liquidity penalty evaluations, deterministic explainable recommendations, and a protected administrator rate management interface.

---

## 1. Key Features

- **Dashboard & Interactive FD Calculator (`/`)**:
  - Live benchmark calculation preview with instant feedback.
  - Multi-parameter inputs: Principal (₹), Tenure (Months / Years), Category (Regular / Senior Citizen), Growth Type (Cumulative / Non-Cumulative), Periodic Payout Schedules (Monthly, Quarterly, Annual), Minimum Acceptable Rate, Preferred Bank Filters, and Premature Liquidity Preferences.
  - Full client-side and server-side Zod validation with accessible error labels.
- **Bank Comparison Engine (`/compare`)**:
  - Side-by-side evaluation table across verified scheduled commercial banks (SBI, HDFC, ICICI, PNB, BOB, Axis, Kotak, IndusInd).
  - Sort by estimated maturity amount, annual interest rate, and tenure duration.
  - In-place requirement modification bar without losing state.
  - Expandable offer details displaying official rate sheet URLs, effective dates, verification timestamps, and premature withdrawal penalties.
- **Personalized Recommendation Engine (`/recommend`)**:
  - Deterministic and explainable allocation algorithm ranking offers by user goals (*Maximum Maturity Growth* vs *Regular Income Stream*).
  - Clear bullet-point reasoning for why the winner was selected.
  - Recharts comparative yield analysis (side-by-side projected maturity amounts and principal-versus-interest breakdown).
  - Next-best alternatives benchmark showing exact rupee and percentage yield differences.
- **Protected Administrator Console (`/admin/rates`)**:
  - Cryptographically secured HMAC Bearer token authentication.
  - Full CRUD for bank fixed deposit offers.
  - Ability to adjust regular and senior rates, modify tenure brackets, update official source links, and toggle verification statuses (*Verified*, *Stale*, *Expired*, *Demonstration*).
  - Decommission obsolete schemes without deleting historical records.
  - Rate revision audit trail modal tracking previous rates, timestamps, and reason logs.
- **Legal & Regulatory Transparency (`/privacy`, `/terms`)**:
  - Zero-PII privacy policy.
  - Gross pre-tax estimation notices and Section 194A / 80TTB TDS thresholds (₹40,000 for regular; ₹50,000 for senior citizens).
  - DICGC insurance ceiling disclosure (₹5,00,000 per depositor per bank).

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Hook Form, Zod, React Router.
- **Backend / Serverless**: Netlify Functions (TypeScript), RESTful endpoints, shared financial calculation and validation modules.
- **Database**: PostgreSQL (Supabase-hosted preferred), Drizzle ORM schemas and migration scripts.
- **Testing**: Vitest, React Testing Library, JSDOM.
- **Deployment**: Netlify configuration (`netlify.toml`), SPA client-side fallback redirects, security headers.

---

## 3. Financial Calculation Formulas

### Cumulative Fixed Deposits (Quarterly Compounding)
Commercial banks in India apply quarterly compounding on cumulative fixed deposits:
$$\mathbf{A = P \times \left(1 + \frac{r}{400}\right)^{4t}}$$
Where:
- $P$ = Principal deposit amount in Indian Rupees (₹)
- $r$ = Annual nominal interest rate expressed as a percentage (e.g. 7.5 for 7.5%)
- $t$ = Investment duration in years ($t = \text{months} / 12$)
- $4t = \text{months} / 3$ (number of quarterly compounding cycles)
- $A$ = Estimated gross maturity amount
- Interest earned = $A - P$

*Note: For deposits with tenures under 6 months (180 days), Indian banks universally apply Simple Interest per RBI norms: $I = P \times r \times t / 100$.*

### Non-Cumulative Deposits (Periodic Income)
- **Monthly Payout**: Paid out periodically: $P \times r / 1200$. Principal refunded upon maturity.
- **Quarterly Payout**: Paid out periodically: $P \times r / 400$. Principal refunded upon maturity.
- **Annual Payout**: Paid out periodically: $P \times r / 100$. Principal refunded upon maturity.

---

## 4. Project Structure

```
project-x/
├── netlify/
│   └── functions/
│       ├── admin-auth.ts      # POST: Administrator sign-in & session token generation
│       ├── admin-offers.ts    # POST/PUT/PATCH/GET: Protected offer management & audit
│       ├── banks.ts           # GET: Active bank records
│       ├── calculate.ts       # POST: Server-side validated FD calculation
│       ├── compare.ts         # POST: Multi-bank eligibility & comparison engine
│       └── fd-offers.ts       # GET: Registered FD offers
│       └── recommend.ts       # POST: Deterministic recommendation engine
├── drizzle/
│   └── 0000_initial_schema.sql# PostgreSQL DDL migration
├── src/
│   ├── components/
│   │   ├── admin/             # OfferModal, AdminAuthModal, RateHistoryModal
│   │   ├── calculator/        # CalculatorForm, QuickResultCard
│   │   ├── common/            # Badge, VerificationBadge, Alert
│   │   ├── comparison/        # ComparisonTable, FilterBar
│   │   ├── layout/            # AppLayout, Header, Sidebar
│   │   └── recommendation/    # RecommendationHero, MaturityChart, AlternativesList
│   ├── data/
│   │   └── demoData.ts        # Seed bank data & verified retail offers
│   ├── database/
│   │   ├── db.ts              # Database service with resilient fallback store
│   │   └── schema.ts          # Drizzle ORM PostgreSQL schema
│   ├── pages/
│   │   ├── AdminRatesPage.tsx # Protected rate management page
│   │   ├── ComparePage.tsx    # Multi-bank comparison page
│   │   ├── DashboardPage.tsx  # Dashboard & FD calculator
│   │   ├── PrivacyPolicyPage.tsx # Zero-PII privacy policy
│   │   ├── RecommendPage.tsx  # Recommendation & Recharts analysis
│   │   └── TermsPage.tsx      # Terms of use & financial disclaimers
│   ├── services/
│   │   └── api.ts             # Client API integration layer
│   ├── shared/
│   │   ├── calculator.ts      # Core mathematical calculation engine
│   │   ├── recommendation.ts  # Deterministic recommendation engine
│   │   └── validation.ts      # Shared Zod validation schemas
│   ├── types/
│   │   └── index.ts           # Core TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── calculator.test.ts     # Formula & calculation unit tests
│   ├── recommendation.test.ts # Eligibility & ranking tests
│   └── validation.test.ts     # Zod schema validation tests
├── .env.example
├── drizzle.config.ts
├── netlify.toml
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 5. Local Setup & Development

### Prerequisites
- Node.js 18+ (tested with Node.js v24.20.0 and npm 11+)

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Build production bundle
npm run build

# 4. Start local development preview server
npm run preview
# App will run at http://localhost:4173
```

---

## 6. Database Setup (Supabase / PostgreSQL)

1. Create a PostgreSQL project on [Supabase](https://supabase.com) (or any managed PostgreSQL host).
2. Copy your PostgreSQL connection string into your environment:
   ```bash
   cp .env.example .env
   ```
3. Set your connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"
   ADMIN_SECRET="AdminFD@2026!"
   TOKEN_SALT="smart_fd_auth_salt_secure_2026"
   ```
4. Run the SQL migration in `drizzle/0000_initial_schema.sql` directly inside the Supabase SQL Editor.
5. In development without a database configured, the application automatically uses the resilient in-memory verified bank data store (`src/data/demoData.ts`).

---

## 7. Administrator Credentials

To access `/admin/rates`:
- **Default Email**: `admin@smartfd.internal`
- **Default Password**: `AdminFD@2026!` (Configurable via `ADMIN_SECRET` environment variable in production)

---

## 8. Netlify Deployment Guide

1. **Connect Repository**:
   - Push code to your GitHub repository.
   - Go to [Netlify](https://app.netlify.com/) and click **"Add new site" > "Import an existing project"**.
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. **Environment Variables**:
   In Netlify Site Settings > Environment Variables, add:
   - `DATABASE_URL`: Your Supabase connection string.
   - `ADMIN_SECRET`: Your production administrator password.
   - `TOKEN_SALT`: Random 32+ character string.
   - `NODE_VERSION`: `20`
4. **Deploy**:
   - Trigger deploy. Netlify will build the Vite frontend, package the serverless TypeScript functions, and apply headers from `netlify.toml`.
5. **Verify**:
   - Open your deployed Netlify URL.
   - Test calculations on the dashboard, navigate to `/compare`, check the recommendation yield charts on `/recommend`, and verify the admin console at `/admin/rates`.
