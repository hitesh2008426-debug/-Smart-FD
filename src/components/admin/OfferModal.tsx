import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { offerInputSchema, type ValidatedOfferInput } from '../../shared/validation';
import type { Bank, FDOffer } from '../../types';
import { X, AlertCircle } from 'lucide-react';

interface OfferModalProps {
  isOpen: boolean;
  banks: Bank[];
  offerToEdit?: FDOffer | null;
  onClose: () => void;
  onSave: (data: ValidatedOfferInput, changeReason?: string) => Promise<void>;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  banks,
  offerToEdit,
  onClose,
  onSave,
}) => {
  const isEditing = !!offerToEdit;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ValidatedOfferInput>({
    resolver: zodResolver(offerInputSchema) as any,
    defaultValues: offerToEdit
      ? {
          bankId: offerToEdit.bankId,
          productName: offerToEdit.productName,
          minTenureMonths: offerToEdit.minTenureMonths,
          maxTenureMonths: offerToEdit.maxTenureMonths,
          minDeposit: offerToEdit.minDeposit,
          maxDeposit: offerToEdit.maxDeposit ?? null,
          regularRate: offerToEdit.regularRate,
          seniorCitizenRate: offerToEdit.seniorCitizenRate,
          compoundingFrequency: offerToEdit.compoundingFrequency,
          payoutOptions: offerToEdit.payoutOptions,
          prematureWithdrawalAllowed: offerToEdit.prematureWithdrawalAllowed,
          prematureWithdrawalPenalty: offerToEdit.prematureWithdrawalPenalty,
          effectiveStartDate: offerToEdit.effectiveStartDate,
          effectiveEndDate: offerToEdit.effectiveEndDate ?? null,
          sourceUrl: offerToEdit.sourceUrl,
          verificationStatus: offerToEdit.verificationStatus,
          isDemonstration: offerToEdit.isDemonstration,
          isActive: offerToEdit.isActive,
          notes: offerToEdit.notes ?? '',
        }
      : {
          bankId: banks[0]?.id || '',
          productName: '',
          minTenureMonths: 12,
          maxTenureMonths: 24,
          minDeposit: 10000,
          maxDeposit: 20000000,
          regularRate: 7.0,
          seniorCitizenRate: 7.5,
          compoundingFrequency: 'quarterly',
          payoutOptions: ['cumulative', 'monthly', 'quarterly', 'annual'],
          prematureWithdrawalAllowed: true,
          prematureWithdrawalPenalty: '1.00% penalty on applicable rate',
          effectiveStartDate: new Date().toISOString().split('T')[0],
          effectiveEndDate: null,
          sourceUrl: 'https://',
          verificationStatus: 'verified',
          isDemonstration: false,
          isActive: true,
          notes: '',
        },
  });

  const selectedPayouts = watch('payoutOptions') || [];

  const togglePayout = (val: 'cumulative' | 'monthly' | 'quarterly' | 'annual') => {
    if (selectedPayouts.includes(val)) {
      if (selectedPayouts.length > 1) {
        setValue(
          'payoutOptions',
          selectedPayouts.filter((p) => p !== val),
          { shouldValidate: true }
        );
      }
    } else {
      setValue('payoutOptions', [...selectedPayouts, val], { shouldValidate: true });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'Edit FD Offer' : 'Add New Bank FD Offer'}
            </h3>
            <p className="text-xs text-slate-500">
              Configure rates, tenure limits, and official source links.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(async (data) => {
            await onSave(data);
            onClose();
          })}
          className="space-y-4 text-xs"
        >
          {/* Bank & Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bank</label>
              <select
                {...register('bankId')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              {errors.bankId && (
                <p className="text-rose-600 mt-0.5">{errors.bankId.message}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Product Scheme Name</label>
              <input
                type="text"
                {...register('productName')}
                placeholder="e.g. Regular Domestic Term Deposit"
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
              {errors.productName && (
                <p className="text-rose-600 mt-0.5">{errors.productName.message}</p>
              )}
            </div>
          </div>

          {/* Rates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Regular Rate (%)</label>
              <input
                type="number"
                step="0.05"
                {...register('regularRate', { valueAsNumber: true })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold text-slate-900"
              />
              {errors.regularRate && (
                <p className="text-rose-600 mt-0.5">{errors.regularRate.message}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Senior Rate (%)</label>
              <input
                type="number"
                step="0.05"
                {...register('seniorCitizenRate', { valueAsNumber: true })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold text-teal-800"
              />
              {errors.seniorCitizenRate && (
                <p className="text-rose-600 mt-0.5">{errors.seniorCitizenRate.message}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Min Tenure (Mo)</label>
              <input
                type="number"
                {...register('minTenureMonths', { valueAsNumber: true })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Max Tenure (Mo)</label>
              <input
                type="number"
                {...register('maxTenureMonths', { valueAsNumber: true })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Deposit Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Min Deposit (₹)</label>
              <input
                type="number"
                step="1000"
                {...register('minDeposit', { valueAsNumber: true })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Max Deposit (₹, optional)</label>
              <input
                type="number"
                step="10000"
                {...register('maxDeposit', { valueAsNumber: true })}
                placeholder="Leave blank if unlimited"
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Compounding & Payout options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Compounding Frequency
              </label>
              <select
                {...register('compoundingFrequency')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
              >
                <option value="quarterly">Quarterly (Commercial Standard)</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="simple">Simple (Short term &lt;6 mo)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Supported Payout Options
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['cumulative', 'monthly', 'quarterly', 'annual'] as const).map((p) => {
                  const isChecked = selectedPayouts.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePayout(p)}
                      className={`px-2 py-1 rounded border text-[11px] capitalize transition-colors ${
                        isChecked
                          ? 'bg-teal-800 text-white border-teal-800 font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Premature withdrawal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Liquidity Flexibility
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  {...register('prematureWithdrawalAllowed')}
                  className="rounded text-teal-800"
                />
                <span className="text-slate-700">Premature withdrawal allowed</span>
              </label>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Premature Penalty Description
              </label>
              <input
                type="text"
                {...register('prematureWithdrawalPenalty')}
                placeholder="e.g. 1.00% penalty on contracted rate"
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Source URL & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Official Bank Rate Sheet URL
              </label>
              <input
                type="url"
                {...register('sourceUrl')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
              {errors.sourceUrl && (
                <p className="text-rose-600 mt-0.5">{errors.sourceUrl.message}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Effective Start Date
              </label>
              <input
                type="date"
                {...register('effectiveStartDate')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Verification Status & Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Verification Status
              </label>
              <select
                {...register('verificationStatus')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
              >
                <option value="verified">Verified (Official)</option>
                <option value="stale">Stale (Review Needed)</option>
                <option value="expired">Expired</option>
                <option value="demonstration">Demonstration Only</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-4 mt-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isDemonstration')}
                  className="rounded text-amber-700"
                />
                <span className="text-slate-700">Flag as Demonstration Data</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="rounded text-teal-800"
                />
                <span className="text-slate-700 font-semibold">Active in Public Calculator</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-teal-800 hover:bg-teal-900 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Offer...' : isEditing ? 'Update Offer & Audit' : 'Create Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
