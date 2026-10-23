import React from 'react';
import { AlertCircle, Scale, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-10 shadow-sm space-y-6 max-w-4xl mx-auto text-slate-800 text-sm">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
          Regulatory Notices & Legal Terms
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Terms of Use & Financial Disclaimer
        </h1>
        <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026</p>
      </div>

      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-900 text-xs">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="block font-bold mb-1">Financial Calculation Disclaimer:</strong>
          All interest earned and maturity values displayed on this platform are mathematical estimates based on published bank circulars and the standard quarterly compounding formula <code className="bg-amber-100/60 px-1 py-0.5 rounded font-mono">A = P × (1 + r/400)^(4t)</code>. Actual rates, rounding mechanisms, and terms applied by individual banks may vary slightly upon final deposit placement.
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-teal-800" />
          1. Platform Role & Non-Intermediary Status
        </h2>
        <p className="leading-relaxed text-slate-600">
          Smart FD Calculator is an independent, non-commercial analytical tool. We do not act as an agent, broker, distributor, or depository for any bank or non-banking financial company (NBFC). We do not accept funds, handle financial transactions, or book deposits on behalf of users.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-800" />
          2. Gross Pre-Tax Calculations & TDS Notice
        </h2>
        <p className="leading-relaxed text-slate-600">
          All calculated maturity amounts and interest proceeds are displayed on a gross pre-tax basis:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs leading-relaxed">
          <li>
            <strong>Tax Deducted at Source (TDS):</strong> Under Section 194A of the Income Tax Act, 1961, banks deduct TDS @ 10% (or 20% if PAN is not submitted) when total interest income across all branch deposits exceeds ₹40,000 in a financial year for regular individuals.
          </li>
          <li>
            <strong>Senior Citizens (Section 80TTB):</strong> For senior citizens (age 60 and above), the statutory TDS threshold is ₹50,000 per financial year.
          </li>
          <li>
            <strong>Form 15G / Form 15H:</strong> Eligible depositors whose total estimated annual income is below the taxable threshold may submit Form 15G (or Form 15H for senior citizens) to avoid TDS deductions.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">3. DICGC Deposit Insurance Coverage</h2>
        <p className="leading-relaxed text-slate-600">
          Under the provisions of the Deposit Insurance and Credit Guarantee Corporation (DICGC) Act, deposits (inclusive of savings, current, recurring, and fixed deposits) held across all branches of each insured commercial bank are guaranteed up to a maximum ceiling of ₹5,00,000 (Five Lakh Rupees) per depositor. Deposits exceeding ₹5 Lakh carry credit risk associated with the issuing institution.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">4. Premature Liquidation & Penalties</h2>
        <p className="leading-relaxed text-slate-600">
          Premature withdrawal terms vary by institution. In most commercial banks, premature liquidation attracts a penalty ranging between 0.50% and 1.00% deducted from the contracted interest rate for the actual duration the deposit remained active. Certain high-yield non-callable schemes (e.g. PNB Uttam or SBI Special Non-Callable) enforce strict lock-in periods with zero premature withdrawal flexibility.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability</h2>
        <p className="leading-relaxed text-slate-600">
          While we strive to keep interest rate sheets updated and accurately verified against official bank publications, interest rates change at the sole discretion of respective banks. Smart FD Calculator and its creators shall not be liable for any financial decisions, loss of interest, or discrepancies arising from external bank rate revisions.
        </p>
      </section>
    </div>
  );
};
