import React, { useState, useEffect } from 'react';
import type { Bank, FDOffer } from '../types';
import { api, authStorage } from '../services/api';
import { AdminAuthModal } from '../components/admin/AdminAuthModal';
import { OfferModal } from '../components/admin/OfferModal';
import { RateHistoryModal } from '../components/admin/RateHistoryModal';
import { VerificationBadge } from '../components/common/Badge';
import { formatIndianCurrency } from '../shared/calculator';
import type { ValidatedOfferInput } from '../shared/validation';
import {
  Plus,
  Edit2,
  PowerOff,
  History,
  Lock,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const AdminRatesPage: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [offers, setOffers] = useState<FDOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Modals state
  const [offerToEdit, setOfferToEdit] = useState<FDOffer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [historyOffer, setHistoryOffer] = useState<FDOffer | null>(null);

  // Status message
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const checkAuth = () => {
    const token = authStorage.getToken();
    setIsAuthenticated(!!token);
    return !!token;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [banksData, offersData] = await Promise.all([
        api.getBanks(),
        api.getOffers(true), // load all offers including inactive
      ]);
      setBanks(banksData);
      setOffers(offersData);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authed = checkAuth();
    loadData();
    if (!authed) {
      setShowAuthModal(true);
    }
  }, []);

  const handleLogout = () => {
    authStorage.clear();
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };

  const handleOpenAddOffer = () => {
    if (!checkAuth()) {
      setShowAuthModal(true);
      return;
    }
    setOfferToEdit(null);
    setShowOfferModal(true);
  };

  const handleOpenEditOffer = (offer: FDOffer) => {
    if (!checkAuth()) {
      setShowAuthModal(true);
      return;
    }
    setOfferToEdit(offer);
    setShowOfferModal(true);
  };

  const handleSaveOffer = async (data: ValidatedOfferInput) => {
    if (offerToEdit) {
      // Update
      const res = await api.updateOffer(offerToEdit.id, data, 'Administrator update');
      if (res.success) {
        setActionNotice(`Successfully updated "${data.productName}". Rate revision logged to history.`);
      }
    } else {
      // Create
      const res = await api.createOffer(data);
      if (res.success) {
        setActionNotice(`Successfully added "${data.productName}" to the database.`);
      }
    }
    await loadData();
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleToggleOfferStatus = async (offer: FDOffer) => {
    if (!checkAuth()) {
      setShowAuthModal(true);
      return;
    }
    if (offer.isActive) {
      await api.disableOffer(offer.id);
      setActionNotice(`Offer "${offer.productName}" has been decommissioned.`);
    } else {
      await api.updateOffer(offer.id, { isActive: true }, 'Reactivated by admin');
      setActionNotice(`Offer "${offer.productName}" has been reactivated.`);
    }
    await loadData();
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Auth State */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Protected Administrator Console
            </span>
            {isAuthenticated && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Session Authenticated
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bank FD Rate & Offer Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain official bank circular rates, verify sources, and decommission expired deposit products.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={handleOpenAddOffer}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bank Offer</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Sign In</span>
            </button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Offers Management Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            All Bank Term Deposit Offers ({offers.length} Total)
          </span>
          <span className="text-[11px] text-slate-500">
            Changes automatically propagate to public calculation engine.
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading offer records...</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Bank & Product</th>
                  <th className="py-3 px-4 text-right">Regular Rate</th>
                  <th className="py-3 px-4 text-right">Senior Rate</th>
                  <th className="py-3 px-4 text-center">Tenure Range</th>
                  <th className="py-3 px-4 text-center">Data Status</th>
                  <th className="py-3 px-4 text-center">Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {offers.map((offer) => (
                  <tr
                    key={offer.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      !offer.isActive ? 'opacity-60 bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{offer.bankName}</span>
                      <span className="text-[11px] text-slate-600 block">{offer.productName}</span>
                      <a
                        href={offer.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-teal-800 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        Official Source Sheet <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {offer.regularRate.toFixed(2)}%
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-teal-800">
                      {offer.seniorCitizenRate.toFixed(2)}%
                    </td>

                    <td className="py-3 px-4 text-center text-slate-600">
                      {offer.minTenureMonths} – {offer.maxTenureMonths} mo
                    </td>

                    <td className="py-3 px-4 text-center">
                      <VerificationBadge
                        status={offer.verificationStatus}
                        isDemonstration={offer.isDemonstration}
                      />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          offer.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={offer.isActive ? 'Active' : 'Inactive'}
                      />
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setHistoryOffer(offer)}
                        className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="View rate change audit history"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditOffer(offer)}
                        className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="Edit offer details & rates"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleOfferStatus(offer)}
                        className={`p-1.5 rounded border ${
                          offer.isActive
                            ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={offer.isActive ? 'Decommission Offer' : 'Reactivate Offer'}
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Banks Overview */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal-800" />
          <h2 className="text-sm font-bold text-slate-900">Registered Commercial Banks ({banks.length})</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {banks.map((b) => (
            <div key={b.id} className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-900 block">{b.code}</span>
              <span className="text-[11px] text-slate-600 block truncate">{b.name}</span>
              <a
                href={b.officialFdRatePage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-teal-800 hover:underline inline-flex items-center gap-0.5 mt-1"
              >
                Rate Portal <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AdminAuthModal
        isOpen={showAuthModal}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowAuthModal(false);
          loadData();
        }}
        onCancel={() => setShowAuthModal(false)}
      />

      <OfferModal
        isOpen={showOfferModal}
        banks={banks}
        offerToEdit={offerToEdit}
        onClose={() => setShowOfferModal(false)}
        onSave={handleSaveOffer}
      />

      <RateHistoryModal offer={historyOffer} onClose={() => setHistoryOffer(null)} />
    </div>
  );
};
