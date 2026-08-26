import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StorageService } from '../../lib/storage';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, Phone, ThumbsUp, ThumbsDown, UserCheck } from 'lucide-react';

interface FraudCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FraudCheckerModal: React.FC<FraudCheckerModalProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    const data = StorageService.checkCustomerTrustScore(phone.trim());
    setResult(data);
    setSearched(true);
  };

  const sampleDemoPhones = ['01711223344', '01855667788', '01999887766'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Delivery Trust & Return Checker" maxWidth="md">
      <div className="space-y-5">
        <p className="text-xs text-slate-500">
          Check a customer's historical parcel acceptance rate across Bangladesh courier networks before shipping to avoid fake orders & return costs.
        </p>

        {/* Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01711223344"
              className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-slate-50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Check Phone
          </button>
        </form>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">Try demo numbers:</span>
          {sampleDemoPhones.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPhone(p);
                const data = StorageService.checkCustomerTrustScore(p);
                setResult(data);
                setSearched(true);
              }}
              className="text-blue-600 font-mono hover:underline font-bold"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Result presentation */}
        {searched && result && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Customer Profile Check
                </span>
                <h4 className="font-bold text-sm text-slate-900 font-mono">{phone}</h4>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  result.riskLevel === 'LOW_RISK'
                    ? 'bg-emerald-100 text-emerald-800'
                    : result.riskLevel === 'MEDIUM_RISK'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {result.riskLevel === 'LOW_RISK' && <ShieldCheck className="w-3.5 h-3.5" />}
                {result.riskLevel === 'MEDIUM_RISK' && <AlertTriangle className="w-3.5 h-3.5" />}
                {result.riskLevel === 'HIGH_RISK' && <ShieldAlert className="w-3.5 h-3.5" />}
                {result.riskLevel.replace('_', ' ')}
              </span>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Total Orders</span>
                <span className="text-base font-black text-slate-900">{result.totalOrders}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] text-emerald-600 font-bold block">Delivered</span>
                <span className="text-base font-black text-emerald-700">{result.deliveredCount}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] text-rose-600 font-bold block">Returned</span>
                <span className="text-base font-black text-rose-700">{result.returnedCount}</span>
              </div>
            </div>

            {/* Progress bar representation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Acceptance Rate:</span>
                <span className={result.successRate >= 80 ? 'text-emerald-600' : 'text-rose-600'}>
                  {result.successRate}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    result.successRate >= 80 ? 'bg-emerald-500' : result.successRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${result.successRate}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
              <b>Recommendation:</b> {result.recommendation}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
