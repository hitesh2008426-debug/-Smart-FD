import React from 'react';
import { ShieldCheck, Lock, EyeOff, Database } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-10 shadow-sm space-y-6 max-w-4xl mx-auto text-slate-800 text-sm">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
          Transparency & Data Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">Effective Date: October 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
          <EyeOff className="w-5 h-5 text-teal-800" />
          <h3 className="font-bold text-slate-900 text-xs">No Personal Data Harvested</h3>
          <p className="text-[11px] text-slate-600">
            We do not require account registration, mobile numbers, PAN numbers, or email addresses from public calculator users.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
          <Database className="w-5 h-5 text-teal-800" />
          <h3 className="font-bold text-slate-900 text-xs">Stateless Calculations</h3>
          <p className="text-[11px] text-slate-600">
            Investment parameters (principal, tenure, customer category) are processed in real-time and not tied to user identities.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
          <Lock className="w-5 h-5 text-teal-800" />
          <h3 className="font-bold text-slate-900 text-xs">Secure Admin Access</h3>
          <p className="text-[11px] text-slate-600">
            Administrator accounts are authenticated using cryptographically signed HMAC Bearer tokens with strict role-based access.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">1. Information We Do Not Collect</h2>
        <p className="leading-relaxed text-slate-600">
          Smart FD Calculator is designed as an open, accessible financial information and comparison platform. We deliberately avoid collecting personally identifiable information (PII) such as your legal name, permanent account number (PAN), Aadhaar, phone number, physical address, or bank account credentials.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">2. Financial Inputs & Calculation Data</h2>
        <p className="leading-relaxed text-slate-600">
          When you enter financial parameters such as principal investment amount, tenure duration, deposit type, and customer category (regular or senior citizen), these parameters are utilized solely for computing mathematical projections and filtering bank offer eligibility. We do not store or sell your financial inquiry data to commercial third parties or telemarketers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">3. Local Browser Storage Usage</h2>
        <p className="leading-relaxed text-slate-600">
          We use browser session storage exclusively to maintain your active requirement filters (such as your chosen investment amount and tenure) as you navigate between the Calculator, Bank Comparison Table, and Recommendation pages. This data resides solely on your client device and may be cleared by you at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">4. Third-Party Links to Bank Websites</h2>
        <p className="leading-relaxed text-slate-600">
          Our comparison tables and recommendation cards provide outbound hyperlinks directing users to official published rate sheets of scheduled commercial banks. Once you exit our application via an external link, your interactions are governed by the respective bank&apos;s privacy practices and terms.
        </p>
      </section>

      <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>For inquiries regarding our technical data practices, contact privacy@smartfd.internal.</span>
      </div>
    </div>
  );
};
