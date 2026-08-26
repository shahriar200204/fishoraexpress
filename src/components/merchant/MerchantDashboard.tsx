import React, { useState, useEffect } from 'react';
import { Merchant, Parcel, ParcelStatus } from '../../types';
import { StorageService } from '../../lib/storage';
import { exportParcelsToCSV } from '../../lib/exportUtils';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/Badge';
import { BarcodeInvoiceModal } from '../common/BarcodeInvoiceModal';
import { CreateParcelModal } from './CreateParcelModal';
import { BulkParcelModal } from './BulkParcelModal';
import { FraudCheckerModal } from './FraudCheckerModal';
import { MerchantSettlements } from './MerchantSettlements';
import { MerchantTickets } from './MerchantTickets';
import { NotificationDropdown } from '../common/NotificationDropdown';
import {
  Package,
  CheckCircle2,
  Truck,
  DollarSign,
  Plus,
  UploadCloud,
  Search,
  Printer,
  Eye,
  ShieldAlert,
  ArrowRight,
  Filter,
  Download,
  AlertCircle,
  Clock,
  RotateCcw,
  User,
  Settings,
  HelpCircle,
  LogOut,
  MapPin,
  ChevronRight
} from 'lucide-react';

interface MerchantDashboardProps {
  merchant: Merchant;
  onLogout: () => void;
  onTrackParcel: (trackingId: string) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  merchant: initialMerchant,
  onLogout,
  onTrackParcel,
}) => {
  const [merchant, setMerchant] = useState<Merchant>(initialMerchant);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'parcels' | 'settlements' | 'tickets' | 'profile'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isFraudOpen, setIsFraudOpen] = useState(false);
  const [selectedInvoiceParcel, setSelectedInvoiceParcel] = useState<Parcel | null>(null);

  const refreshData = () => {
    const updatedMerchant = StorageService.getMerchantById(merchant.id);
    if (updatedMerchant) setMerchant(updatedMerchant);
    setParcels(StorageService.getParcelsByMerchant(merchant.id));
  };

  useEffect(() => {
    refreshData();
    const handleStorageChange = () => refreshData();
    window.addEventListener('fishora_storage_change', handleStorageChange);
    return () => window.removeEventListener('fishora_storage_change', handleStorageChange);
  }, [merchant.id]);

  // Statistics calculation
  const totalParcelsCount = parcels.length;
  const deliveredParcels = parcels.filter((p) => p.status === 'delivered');
  const inTransitParcels = parcels.filter(
    (p) => p.status === 'in_transit' || p.status === 'out_for_delivery' || p.status === 'picked_up'
  );
  const pendingParcels = parcels.filter((p) => p.status === 'pending' || p.status === 'confirmed');

  // Filtered parcels list
  const filteredParcels = parcels.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.trackingId.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.customerPhone.includes(q) ||
      p.area.toLowerCase().includes(q) ||
      p.productName.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleCancelParcel = (parcelId: string) => {
    if (window.confirm('Are you sure you want to cancel this pending parcel booking?')) {
      StorageService.updateParcelStatus(parcelId, 'cancelled', {
        title: 'Cancelled by Merchant',
        description: 'Merchant cancelled the delivery request before dispatch.',
        updatedBy: merchant.businessName,
      });
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Merchant Sub-Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Merchant Identity info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {merchant.businessName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                    {merchant.businessName}
                  </h1>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                    Merchant Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Owner: {merchant.ownerName} • {merchant.district} Hub
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              <NotificationDropdown recipientId={merchant.id} />

              <button
                type="button"
                onClick={() => setIsFraudOpen(true)}
                className="hidden sm:flex px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition items-center gap-1.5"
                title="Check customer phone delivery success rate"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Fraud Checker
              </button>

              <button
                type="button"
                onClick={() => setIsBulkOpen(true)}
                className="hidden md:flex px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Bulk CSV
              </button>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                Create Parcel
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex space-x-1 sm:space-x-4 border-t border-slate-100 py-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('parcels')}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'parcels' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Parcels ({parcels.length})
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'settlements' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              COD Settlements (৳{merchant.currentBalance.toLocaleString()})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Support Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Main Merchant Portal Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Summary Cards (Matching Wireframe 03) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Parcels"
                value={totalParcelsCount}
                subValue={`${pendingParcels.length} awaiting pickup`}
                icon={Package}
                color="blue"
                onClick={() => setActiveTab('parcels')}
              />
              <StatCard
                label="Total Delivered"
                value={deliveredParcels.length}
                subValue={`${totalParcelsCount > 0 ? ((deliveredParcels.length / totalParcelsCount) * 100).toFixed(1) : 0}% success rate`}
                icon={CheckCircle2}
                color="emerald"
                onClick={() => {
                  setStatusFilter('delivered');
                  setActiveTab('parcels');
                }}
              />
              <StatCard
                label="In Transit / Active"
                value={inTransitParcels.length}
                subValue="With delivery riders"
                icon={Truck}
                color="purple"
                onClick={() => {
                  setStatusFilter('in_transit');
                  setActiveTab('parcels');
                }}
              />
              <StatCard
                label="Available Balance"
                value={`৳${merchant.currentBalance.toLocaleString()}`}
                subValue="Click to request settlement"
                icon={DollarSign}
                color="emerald"
                onClick={() => setActiveTab('settlements')}
                className="ring-2 ring-emerald-500/20"
              />
            </div>

            {/* Quick Action Shortcuts Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setIsCreateOpen(true)}
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xs cursor-pointer hover:shadow-md transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-blue-100 font-bold uppercase">Ready to dispatch?</div>
                  <div className="text-base font-extrabold mt-0.5">+ Book Single Parcel</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>

              <div
                onClick={() => setIsBulkOpen(true)}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Got many orders?</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">Bulk CSV Upload</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
              </div>

              <div
                onClick={() => setIsFraudOpen(true)}
                className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs cursor-pointer hover:border-amber-300 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-amber-700 font-bold uppercase">Verify customer</div>
                  <div className="text-base font-bold text-amber-900 mt-0.5">Phone Fraud Checker</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Recent Parcels Section (Matching Wireframe 03) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Recent Delivery Orders</h3>
                  <p className="text-xs text-slate-500">Latest parcels booked under your merchant account</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('parcels')}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  View All Parcels →
                </button>
              </div>

              {/* Table Render */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">Parcel ID</th>
                        <th className="px-4 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Customer & Area</th>
                        <th className="px-4 py-3.5">Product</th>
                        <th className="px-4 py-3.5">COD Amount</th>
                        <th className="px-4 py-3.5">Delivery Fee</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parcels.slice(0, 6).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">
                            <span className="text-blue-600">{p.id}</span>
                            <span className="block text-[10px] text-slate-400 font-normal">{p.trackingId}</span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900">{p.customerName}</div>
                            <div className="text-slate-500 text-[11px]">{p.customerPhone} • {p.area}</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                            {p.productName} ({p.weight} kg)
                          </td>
                          <td className="px-4 py-3.5 font-black text-slate-900 text-sm">
                            ৳{p.codAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-semibold">
                            ৳{p.deliveryCharge}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={p.status} size="sm" />
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceParcel(p)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Print Sticker / Invoice"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onTrackParcel(p.trackingId)}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Live Tracking Radar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARCELS TAB */}
        {activeTab === 'parcels' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">Parcel Orders Directory</h2>
                <p className="text-xs text-slate-500">Manage all customer dispatches and download reports</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportParcelsToCSV(parcels, `fishora_parcels_${merchant.businessName}`)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Parcel
                </button>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer, phone, tracking..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
                {['all', 'pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize whitespace-nowrap transition ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Parcels Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Parcel ID</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Receiver / Location</th>
                      <th className="px-4 py-3.5">Product & Weight</th>
                      <th className="px-4 py-3.5">COD Amount</th>
                      <th className="px-4 py-3.5">Delivery Fee</th>
                      <th className="px-4 py-3.5">Payable</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredParcels.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-slate-400">
                          No parcels match your search/filter.
                        </td>
                      </tr>
                    ) : (
                      filteredParcels.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">
                            <span className="text-blue-600">{p.id}</span>
                            <span className="block text-[10px] text-slate-400 font-normal">{p.trackingId}</span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900">{p.customerName}</div>
                            <div className="text-slate-500 text-[11px]">{p.customerPhone}</div>
                            <div className="text-slate-400 text-[10px]">{p.fullAddress}, {p.area}, {p.district}</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">
                            <div className="font-medium truncate max-w-xs">{p.productName}</div>
                            <div className="text-slate-400 text-[11px]">Qty: {p.quantity} | {p.weight} kg ({p.parcelType})</div>
                          </td>
                          <td className="px-4 py-3.5 font-black text-slate-900 text-sm">
                            ৳{p.codAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-semibold">
                            ৳{p.deliveryCharge}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-emerald-700">
                            ৳{p.merchantPayable.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={p.status} size="sm" />
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceParcel(p)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-[11px] rounded-lg transition"
                              title="Print Shipping Label"
                            >
                              <Printer className="w-3.5 h-3.5 inline mr-1" /> Label
                            </button>
                            <button
                              type="button"
                              onClick={() => onTrackParcel(p.trackingId)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[11px] rounded-lg transition"
                              title="Track Delivery Status"
                            >
                              <Eye className="w-3.5 h-3.5 inline mr-1" /> Track
                            </button>
                            {p.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleCancelParcel(p.id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg transition"
                                title="Cancel Order"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SETTLEMENTS TAB */}
        {activeTab === 'settlements' && (
          <MerchantSettlements merchant={merchant} onRefreshMerchant={refreshData} />
        )}

        {/* TICKETS TAB */}
        {activeTab === 'tickets' && (
          <MerchantTickets merchant={merchant} />
        )}
      </div>

      {/* MODALS */}
      <CreateParcelModal
        merchant={merchant}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onParcelCreated={(newP) => {
          refreshData();
        }}
        onPrintLabel={(p) => setSelectedInvoiceParcel(p)}
      />

      <BulkParcelModal
        merchant={merchant}
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onBulkCreated={refreshData}
      />

      <FraudCheckerModal
        isOpen={isFraudOpen}
        onClose={() => setIsFraudOpen(false)}
      />

      <BarcodeInvoiceModal
        parcel={selectedInvoiceParcel}
        isOpen={!!selectedInvoiceParcel}
        onClose={() => setSelectedInvoiceParcel(null)}
      />
    </div>
  );
};
