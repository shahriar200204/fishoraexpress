import React, { useState, useEffect } from 'react';
import { Merchant, SettlementRequest, LedgerTransaction } from '../../types';
import { StorageService } from '../../lib/storage';
import { exportSettlementsToCSV, exportLedgerToCSV } from '../../lib/exportUtils';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import {
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  CreditCard,
  Building,
  Calendar,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MerchantSettlementsProps {
  merchant: Merchant;
  onRefreshMerchant: () => void;
}

export const MerchantSettlements: React.FC<MerchantSettlementsProps> = ({
  merchant,
  onRefreshMerchant,
}) => {
  const [settlements, setSettlements] = useState<SettlementRequest[]>([]);
  const [ledger, setLedger] = useState<LedgerTransaction[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(merchant.currentBalance);
  const [selectedMethod, setSelectedMethod] = useState(merchant.paymentMethod);
  const [accountDetails, setAccountDetails] = useState(merchant.paymentNumberOrAccount);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'payouts' | 'ledger'>('payouts');

  const loadData = () => {
    setSettlements(StorageService.getSettlementsByMerchant(merchant.id));
    setLedger(StorageService.getLedgerByMerchant(merchant.id));
    setWithdrawAmount(merchant.currentBalance);
  };

  useEffect(() => {
    loadData();
  }, [merchant]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (withdrawAmount <= 0) {
      setError('Withdrawal amount must be greater than 0 BDT');
      return;
    }

    if (withdrawAmount > merchant.currentBalance) {
      setError(`Withdrawal amount cannot exceed your available balance of ৳${merchant.currentBalance}`);
      return;
    }

    try {
      StorageService.requestSettlement({
        merchantId: merchant.id,
        merchantName: merchant.businessName,
        merchantPhone: merchant.phone,
        amount: Number(withdrawAmount),
        method: selectedMethod,
        accountDetails: accountDetails.trim(),
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setIsRequestModalOpen(false);
      onRefreshMerchant();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Settlement request failed.');
    }
  };

  const totalPaidOut = settlements
    .filter((s) => s.status === 'paid')
    .reduce((acc, s) => acc + s.amount, 0);

  const pendingSettlementAmount = settlements
    .filter((s) => s.status === 'pending' || s.status === 'processing')
    .reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            COD Settlements & Financial Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Real-time balance, automated ledger records, and next-day payout requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportSettlementsToCSV(settlements, `fishora_settlement_${merchant.id}`)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Settlements
          </button>
          <button
            type="button"
            onClick={() => exportLedgerToCSV(ledger, `fishora_ledger_${merchant.id}`)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Export Ledger
          </button>
        </div>
      </div>

      {/* Main Balance Cards Grid (Matching Wireframe 05) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Available Balance (Featured) */}
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl flex flex-col justify-between border border-slate-700">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available Withdrawable Balance
              </span>
              <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400">
                <DollarSign className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black text-white">
                ৳{merchant.currentBalance.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for next-day payout
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setWithdrawAmount(merchant.currentBalance);
              setIsRequestModalOpen(true);
            }}
            disabled={merchant.currentBalance <= 0}
            className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            Request Settlement Payout
          </button>
        </div>

        {/* Pending Settlements In Process */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending / In Processing
              </span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-amber-700">
                ৳{pendingSettlementAmount.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Under review / bank clearing</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium pt-4 border-t border-slate-100">
            Disbursed daily between 11 AM - 5 PM
          </div>
        </div>

        {/* Total Lifetime Paid Out */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Lifetime Disbursed
              </span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-emerald-700">
                ৳{totalPaidOut.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Direct to {merchant.paymentMethod.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium pt-4 border-t border-slate-100 truncate">
            Acc: {merchant.paymentNumberOrAccount}
          </div>
        </div>
      </div>

      {/* Tab Selector: Payout History vs Ledger */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'payouts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Settlement Payout Requests ({settlements.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'ledger'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Detailed Transaction Ledger ({ledger.length})
        </button>
      </div>

      {/* Tab 1: Payout Requests Table */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Settlement ID</th>
                  <th className="px-5 py-3.5">Requested Date</th>
                  <th className="px-5 py-3.5">Amount (BDT)</th>
                  <th className="px-5 py-3.5">Payout Method</th>
                  <th className="px-5 py-3.5">Account / Wallet</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Transaction Ref / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No settlement requests created yet.
                    </td>
                  </tr>
                ) : (
                  settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900 font-mono">{s.id}</td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {new Date(s.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-5 py-3.5 font-black text-slate-900 text-sm">৳{s.amount.toLocaleString()}</td>
                      <td className="px-5 py-3.5 uppercase font-bold text-blue-600">{s.method}</td>
                      <td className="px-5 py-3.5 text-slate-700 font-mono">{s.accountDetails}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {s.transactionReference ? (
                          <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            TxID: {s.transactionReference}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">{s.adminNote || 'Processing payout queue'}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Detailed Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Tx ID</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Amount (BDT)</th>
                  <th className="px-5 py-3.5">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No ledger transactions logged yet.
                    </td>
                  </tr>
                ) : (
                  ledger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-mono text-slate-500 font-semibold">{tx.id}</td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {new Date(tx.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                            tx.type === 'CREDIT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{tx.description}</td>
                      <td
                        className={`px-5 py-3.5 font-black text-sm ${
                          tx.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'CREDIT' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 font-mono">
                        ৳{tx.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settlement Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request COD Settlement Withdrawal"
        maxWidth="md"
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200">
            <span className="text-xs text-blue-900 font-bold block">Available Balance</span>
            <div className="text-3xl font-black text-blue-700 mt-0.5">
              ৳{merchant.currentBalance.toLocaleString()}
            </div>
            <p className="text-[11px] text-blue-600 mt-1">
              Zero transfer fee on all bKash, Nagad, and Bank disbursements.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Withdrawal Amount (BDT) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-700 text-sm">৳</span>
              <input
                type="number"
                required
                min="100"
                max={merchant.currentBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-2.5 text-base font-black text-slate-900 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payout Channel *</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white font-semibold uppercase"
            >
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account / Wallet Number or Bank Details *
            </label>
            <input
              type="text"
              required
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              placeholder="017XXXXXXXX or Bank Name, Acc No, Branch"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Payout Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
