import React, { useEffect, useState } from 'react';
import type { FDOffer, RateHistoryRecord } from '../../types';
import { api } from '../../services/api';
import { History, X } from 'lucide-react';

interface RateHistoryModalProps {
  offer: FDOffer | null;
  onClose: () => void;
}

export const RateHistoryModal: React.FC<RateHistoryModalProps> = ({ offer, onClose }) => {
  const [history, setHistory] = useState<RateHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (offer) {
      setLoading(true);
      api
        .getRateHistory(offer.id)
        .then(setHistory)
        .finally(() => setLoading(false));
    }
  }, [offer]);

  if (!offer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-800" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rate Change Audit History</h3>
              <p className="text-xs text-slate-500">{offer.bankName} – {offer.productName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading audit history...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No historical rate revisions recorded yet for this offer.
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
            {history.map((record, index) => (
              <div
                key={record.id}
                className="p-3 rounded border border-slate-200 bg-slate-50/60 space-y-1.5"
              >
                <div className="flex justify-between items-center font-medium">
                  <span className="text-slate-800">Revision #{history.length - index}</span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(record.changedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4 text-slate-700">
                  <span>
                    Regular Rate:{' '}
                    <strong className="text-slate-900">{record.regularRate}%</strong>
                  </span>
                  <span>
                    Senior Rate:{' '}
                    <strong className="text-slate-900">{record.seniorCitizenRate}%</strong>
                  </span>
                </div>
                {record.changeReason && (
                  <p className="text-slate-500 italic text-[11px]">
                    Reason: {record.changeReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
