import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { calculationInputSchema, type ValidatedCalculationInput } from '../../shared/validation';
import type { Bank, CalculationInput } from '../../types';
import { api } from '../../services/api';
import { ArrowRight, HelpCircle } from 'lucide-react';

interface CalculatorFormProps {
  initialValues?: Partial<CalculationInput>;
  onValuesChange?: (values: CalculationInput) => void;
  onSubmit: (values: CalculationInput) => void;
}

const DEFAULT_VALUES: CalculationInput = {
  investmentAmount: 100000,
  tenureValue: 1,
  tenureUnit: 'years',
  depositType: 'cumulative',
  customerCategory: 'regular',
  payoutFrequency: 'cumulative',
  primaryGoal: 'highest_maturity',
  prematureWithdrawalFlexibility: false,
  preferredBanks: [],
};

const QUICK_AMOUNTS = [
  { label: '₹50K', value: 50000 },
  { label: '₹1 Lakh', value: 100000 },
  { label: '₹2 Lakh', value: 200000 },
  { label: '₹5 Lakh', value: 500000 },
  { label: '₹10 Lakh', value: 1000000 },
];

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  initialValues,
  onValuesChange,
  onSubmit,
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    api.getBanks().then(setBanks).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ValidatedCalculationInput>({
    resolver: zodResolver(calculationInputSchema) as any,
    defaultValues: {
      ...DEFAULT_VALUES,
      ...initialValues,
    },
    mode: 'onChange',
  });

  const formValues = watch();
  const depositType = watch('depositType');

  // Trigger live updates when values change
  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(formValues as CalculationInput);
    }
  }, [JSON.stringify(formValues), onValuesChange]);

  // Adjust payout frequency when deposit type switches
  const handleDepositTypeChange = (type: 'cumulative' | 'non_cumulative') => {
    setValue('depositType', type);
    if (type === 'cumulative') {
      setValue('payoutFrequency', 'cumulative');
    } else {
      setValue('payoutFrequency', 'quarterly');
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data as CalculationInput))}
      className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm space-y-5"
      noValidate
    >
      <div>
        <h2 className="text-base font-semibold text-slate-900">Fixed Deposit Requirements</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Specify your investment parameters to calculate yield and compare live bank offers.
        </p>
      </div>

      {/* Investment Amount */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="investmentAmount" className="text-xs font-semibold text-slate-700">
            Investment Amount (₹)
          </label>
          <span className="text-[11px] text-slate-500">Min ₹1,000 – Max ₹10 Cr</span>
        </div>

        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-semibold text-sm">
            ₹
          </div>
          <input
            id="investmentAmount"
            type="number"
            step="1000"
            {...register('investmentAmount', { valueAsNumber: true })}
            className={`block w-full pl-8 pr-3 py-2 text-sm rounded-md border ${
              errors.investmentAmount
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 focus:border-teal-700 focus:ring-teal-700'
            } text-slate-900 font-medium`}
            placeholder="100000"
            aria-invalid={!!errors.investmentAmount}
            aria-describedby={errors.investmentAmount ? 'amount-error' : undefined}
          />
        </div>

        {errors.investmentAmount && (
          <p id="amount-error" className="text-xs text-rose-600 mt-1 font-medium">
            {errors.investmentAmount.message}
          </p>
        )}

        {/* Quick amount chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q.value}
              type="button"
              onClick={() => setValue('investmentAmount', q.value, { shouldValidate: true })}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                formValues.investmentAmount === q.value
                  ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tenure & Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tenureValue" className="text-xs font-semibold text-slate-700 block mb-1.5">
            Tenure Duration
          </label>
          <div className="flex rounded-md shadow-sm">
            <input
              id="tenureValue"
              type="number"
              min="1"
              max={formValues.tenureUnit === 'years' ? 10 : 120}
              {...register('tenureValue', { valueAsNumber: true })}
              className={`block w-full rounded-l-md border ${
                errors.tenureValue ? 'border-rose-300' : 'border-slate-300'
              } px-3 py-2 text-sm text-slate-900 font-medium focus:border-teal-700 focus:ring-teal-700`}
            />
            <select
              {...register('tenureUnit')}
              aria-label="Tenure Unit"
              className="rounded-r-md border border-l-0 border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-700 focus:ring-teal-700"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
          </div>
          {errors.tenureValue && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.tenureValue.message}</p>
          )}
        </div>

        {/* Customer Category */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Customer Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue('customerCategory', 'regular', { shouldValidate: true })}
              className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-colors ${
                formValues.customerCategory === 'regular'
                  ? 'bg-teal-50 border-teal-700 text-teal-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Regular Citizen
            </button>
            <button
              type="button"
              onClick={() => setValue('customerCategory', 'senior_citizen', { shouldValidate: true })}
              className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-colors ${
                formValues.customerCategory === 'senior_citizen'
                  ? 'bg-teal-50 border-teal-700 text-teal-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Senior Citizen (60+)
            </button>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Senior citizens receive +0.50% to +0.80% preferential rate.
          </span>
        </div>
      </div>

      {/* Deposit Type & Payout Frequency */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Deposit Growth Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDepositTypeChange('cumulative')}
              className={`p-3 text-left rounded-md border transition-colors ${
                depositType === 'cumulative'
                  ? 'bg-teal-50 border-teal-700 text-teal-900 ring-1 ring-teal-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-semibold">Cumulative FD</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Interest reinvested quarterly. Paid at maturity.
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDepositTypeChange('non_cumulative')}
              className={`p-3 text-left rounded-md border transition-colors ${
                depositType === 'non_cumulative'
                  ? 'bg-teal-50 border-teal-700 text-teal-900 ring-1 ring-teal-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-semibold">Non-Cumulative FD</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Regular periodic interest payouts for income.
              </div>
            </button>
          </div>
        </div>

        {/* Payout Frequency (only if non-cumulative) */}
        {depositType === 'non_cumulative' && (
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Interest Payout Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['monthly', 'quarterly', 'annual'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setValue('payoutFrequency', freq, { shouldValidate: true })}
                  className={`py-1.5 px-2 text-xs font-medium rounded border capitalize transition-colors ${
                    formValues.payoutFrequency === freq
                      ? 'bg-teal-800 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
            {errors.payoutFrequency && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.payoutFrequency.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Primary Goal */}
      <div className="pt-2 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          Primary Financial Goal
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label
            className={`flex items-start gap-2 p-2.5 rounded-md border cursor-pointer text-xs ${
              formValues.primaryGoal === 'highest_maturity'
                ? 'bg-teal-50 border-teal-700 text-teal-900'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <input
              type="radio"
              value="highest_maturity"
              {...register('primaryGoal')}
              className="mt-0.5 text-teal-700 focus:ring-teal-700"
            />
            <div>
              <span className="font-semibold block">Maximum Maturity Value</span>
              <span className="text-[11px] text-slate-500">Compounding growth at maturity</span>
            </div>
          </label>

          <label
            className={`flex items-start gap-2 p-2.5 rounded-md border cursor-pointer text-xs ${
              formValues.primaryGoal === 'interest_payout'
                ? 'bg-teal-50 border-teal-700 text-teal-900'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <input
              type="radio"
              value="interest_payout"
              {...register('primaryGoal')}
              className="mt-0.5 text-teal-700 focus:ring-teal-700"
            />
            <div>
              <span className="font-semibold block">Maximum Regular Income</span>
              <span className="text-[11px] text-slate-500">Frequent cash flow distribution</span>
            </div>
          </label>
        </div>
      </div>

      {/* Advanced filters toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-1"
        >
          <span>{showAdvanced ? '− Hide' : '+ Show'} Optional Bank & Rate Preferences</span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3 text-xs">
            {/* Premature withdrawal flexibility preference */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('prematureWithdrawalFlexibility')}
                  className="rounded text-teal-700 focus:ring-teal-700"
                />
                <span className="text-slate-800 font-medium">
                  Prioritize offers with flexible premature withdrawal
                </span>
              </label>
              <span className="text-[11px] text-slate-500 block ml-5">
                Excludes or penalizes strict lock-in non-callable schemes.
              </span>
            </div>

            {/* Minimum Acceptable Rate */}
            <div>
              <label htmlFor="minInterestRate" className="font-semibold text-slate-700 block mb-1">
                Minimum Acceptable Interest Rate (% p.a.)
              </label>
              <input
                id="minInterestRate"
                type="number"
                step="0.1"
                min="0"
                max="15"
                {...register('minInterestRate', { valueAsNumber: true })}
                placeholder="e.g. 7.0"
                className="w-full sm:w-48 px-3 py-1.5 text-xs rounded border border-slate-300 focus:border-teal-700"
              />
            </div>

            {/* Preferred Banks */}
            {banks.length > 0 && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Filter by Specific Banks (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <Controller
                    name="preferredBanks"
                    control={control}
                    render={({ field }) => {
                      const selected = field.value || [];
                      return (
                        <>
                          {banks.map((b) => {
                            const isChecked = selected.includes(b.id);
                            return (
                              <label
                                key={b.id}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-teal-50 border-teal-600 text-teal-900 font-medium'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...selected, b.id]);
                                    } else {
                                      field.onChange(selected.filter((id: string) => id !== b.id));
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <span>{b.code}</span>
                              </label>
                            );
                          })}
                        </>
                      );
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary CTA */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-md bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors focus:ring-2 focus:ring-teal-700"
        >
          <span>Compare FD Rates Across Banks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-slate-500 justify-center">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>No registration or personal information required. Basic calculator is 100% free.</span>
      </div>
    </form>
  );
};
