import React, { useState } from 'react';
import { api } from '../../services/api';
import { Lock, AlertCircle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const [email, setEmail] = useState('admin@smartfd.internal');
  const [password, setPassword] = useState('AdminFD@2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await api.adminLogin(email, password);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Administrator Access</h3>
            <p className="text-xs text-slate-500">Sign in to manage official bank rate records</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:border-teal-700 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Admin Secret / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:border-teal-700 font-medium"
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              Default demo credential: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">AdminFD@2026!</code>
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-teal-800 hover:bg-teal-900 text-white font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
