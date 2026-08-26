import React, { useState, useEffect } from 'react';
import {
  Merchant,
  Parcel,
  Rider,
  SettlementRequest,
  BusinessPricingConfig,
  SupportTicket,
  AuditLog,
  ParcelStatus,
  MerchantStatus
} from '../../types';
import { StorageService } from '../../lib/storage';
import {
  exportParcelsToCSV,
  exportSettlementsToCSV,
  exportLedgerToCSV,
  exportMerchantsToCSV,
} from '../../lib/exportUtils';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { BarcodeInvoiceModal } from '../common/BarcodeInvoiceModal';
import {
  Shield,
  Package,
  Users,
  Bike,
  DollarSign,
  Settings,
  Headphones,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Plus,
  Edit2,
  Trash2,
  Activity,
  LogOut,
  MapPin,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Radio,
  ShieldCheck,
  Navigation,
  Camera,
  FileSignature
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  adminUser: any;
  onLogout: () => void;
  onTrackParcel: (trackingId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout,
  onTrackParcel,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'parcels' | 'merchants' | 'riders' | 'livemap' | 'settlements' | 'pricing' | 'tickets' | 'audit'
  >('overview');

  // Data states
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [settlements, setSettlements] = useState<SettlementRequest[]>([]);
  const [pricing, setPricing] = useState<BusinessPricingConfig>(StorageService.getPricing());
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Search & Filters
  const [parcelSearch, setParcelSearch] = useState('');
  const [parcelStatusFilter, setParcelStatusFilter] = useState('all');
  const [merchantSearch, setMerchantSearch] = useState('');

  // Modals & Action States
  const [selectedInvoiceParcel, setSelectedInvoiceParcel] = useState<Parcel | null>(null);
  const [selectedPodParcel, setSelectedPodParcel] = useState<Parcel | null>(null);
  const [settlementToApprove, setSettlementToApprove] = useState<SettlementRequest | null>(null);
  const [approvalTxRef, setApprovalTxRef] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [isNewRiderModalOpen, setIsNewRiderModalOpen] = useState(false);
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderNid, setNewRiderNid] = useState('');
  const [newRiderPassword, setNewRiderPassword] = useState('1234');
  const [newRiderAddress, setNewRiderAddress] = useState('');
  const [newRiderZone, setNewRiderZone] = useState('Mirpur & Dhanmondi, Dhaka');
  const [newRiderVehicle, setNewRiderVehicle] = useState('Motorcycle');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncFeedback, setCloudSyncFeedback] = useState('');

  // Pricing Edit form state
  const [editPricing, setEditPricing] = useState<BusinessPricingConfig>(pricing);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState('');

  const refreshAllData = () => {
    setParcels(StorageService.getParcels());
    setMerchants(StorageService.getMerchants());
    setRiders(StorageService.getRiders());
    setSettlements(StorageService.getSettlements());
    setPricing(StorageService.getPricing());
    setTickets(StorageService.getTickets());
    setAuditLogs(StorageService.getAuditLogs());
  };

  useEffect(() => {
    refreshAllData();
    const handleStorageChange = () => refreshAllData();
    window.addEventListener('fishora_storage_change', handleStorageChange);
    return () => window.removeEventListener('fishora_storage_change', handleStorageChange);
  }, []);

  const handleCloudSync = async () => {
    setIsSyncingCloud(true);
    setCloudSyncFeedback('');
    try {
      const res = await StorageService.syncAllToFirestore();
      if (res.success) {
        setCloudSyncFeedback(res.message);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });
      } else {
        setCloudSyncFeedback('Sync Notice: ' + res.message);
      }
    } catch (err: any) {
      setCloudSyncFeedback('Sync Error: ' + (err?.message || 'Failed to sync'));
    } finally {
      setIsSyncingCloud(false);
      setTimeout(() => setCloudSyncFeedback(''), 6000);
      refreshAllData();
    }
  };

  const handleResetToClean = () => {
    if (window.confirm('Are you sure you want to clear all test/demo records and start with 0 data? Only real parcels and riders you create will appear.')) {
      StorageService.clearToCleanLiveMode();
      refreshAllData();
      setCloudSyncFeedback('Database cleared! Now running on 100% clean live database.');
      setTimeout(() => setCloudSyncFeedback(''), 5000);
    }
  };

  // System Stats
  const totalParcels = parcels.length;
  const deliveredParcels = parcels.filter((p) => p.status === 'delivered');
  const totalCodCollected = parcels
    .filter((p) => p.isCodCollected)
    .reduce((sum, p) => sum + p.codAmount, 0);
  const totalDeliveryRevenue = parcels
    .filter((p) => p.status === 'delivered')
    .reduce((sum, p) => sum + p.deliveryCharge + p.codCharge, 0);
  const pendingSettlementCount = settlements.filter((s) => s.status === 'pending').length;

  // Filtered Parcels
  const filteredParcels = parcels.filter((p) => {
    const matchesStatus = parcelStatusFilter === 'all' || p.status === parcelStatusFilter;
    const q = parcelSearch.toLowerCase();
    const matchesQuery =
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.trackingId.toLowerCase().includes(q) ||
      p.merchantName.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.customerPhone.includes(q) ||
      p.area.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  // Assign Rider
  const handleAssignRider = (parcelId: string, riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;

    StorageService.assignRiderToParcel(parcelId, rider.id, rider.name);
    refreshAllData();
  };

  // Change Parcel Status
  const handleStatusChange = (parcelId: string, newStatus: ParcelStatus) => {
    StorageService.updateParcelStatus(parcelId, newStatus, {
      title: `Status Updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
      description: `Admin updated delivery status to ${newStatus}.`,
      updatedBy: 'Admin Control',
    });
    refreshAllData();
  };

  // Merchant Status Toggle
  const handleMerchantStatus = (merchantId: string, status: MerchantStatus) => {
    StorageService.updateMerchantStatus(merchantId, status);
    refreshAllData();
  };

  // Settle Payout Approval
  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementToApprove) return;

    StorageService.approveSettlement(
      settlementToApprove.id,
      approvalTxRef.trim() || `TXN-BD-${Math.floor(100000 + Math.random() * 900000)}`,
      approvalNote.trim() || 'Paid via FISHORA Corporate Banking'
    );

    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    setSettlementToApprove(null);
    setApprovalTxRef('');
    setApprovalNote('');
    refreshAllData();
  };

  // Save Pricing Changes
  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePricing(editPricing);
    setPricing(editPricing);
    setPricingSuccessMsg('Delivery charges and business pricing updated successfully!');
    setTimeout(() => setPricingSuccessMsg(''), 4000);
    refreshAllData();
  };

  // Add New Rider
  const handleCreateRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiderName || !newRiderPhone) return;

    StorageService.addRider({
      name: newRiderName.trim(),
      phone: newRiderPhone.trim(),
      email: `${newRiderName.toLowerCase().replace(/\s+/g, '')}@fishora.com`,
      zone: newRiderZone,
      vehicleType: newRiderVehicle,
      address: newRiderAddress.trim(),
      nid: newRiderNid.trim(),
      password: newRiderPassword.trim() || '1234',
      status: 'active',
    });

    setIsNewRiderModalOpen(false);
    setNewRiderName('');
    setNewRiderPhone('');
    setNewRiderNid('');
    setNewRiderAddress('');
    setNewRiderPassword('1234');
    refreshAllData();
    setCloudSyncFeedback('Rider registered successfully to database & Firebase cloud!');
    setTimeout(() => setCloudSyncFeedback(''), 5000);
  };

  const handleDeleteRider = (riderId: string, riderName: string) => {
    if (window.confirm(`Are you sure you want to remove rider ${riderName} (${riderId})?`)) {
      StorageService.deleteRider(riderId);
      refreshAllData();
    }
  };

  // Ticket Reply
  const handleTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;

    StorageService.addTicketMessage(selectedTicket.id, {
      senderId: 'admin-01',
      senderName: 'FISHORA Dispatch Support',
      senderRole: 'admin',
      message: ticketReplyText.trim(),
    });

    setTicketReplyText('');
    refreshAllData();
    const updated = StorageService.getTickets().find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Top Admin Navigation Header (Matching Wireframe 06) */}
      <div className="bg-slate-950 border-b border-slate-800 sticky top-16 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-white tracking-tight">
                    FISHORA Master Control
                  </h1>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Logged in as {adminUser?.email || 'admin@fishoraexpress.com'}
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewRiderModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md"
                title="Add New Rider"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Rider</span>
              </button>

              <button
                type="button"
                onClick={handleCloudSync}
                disabled={isSyncingCloud}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 transition flex items-center gap-1.5"
                title="Push all local state to Firebase Firestore Cloud"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">{isSyncingCloud ? 'Syncing...' : 'Cloud Sync'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToClean}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 transition"
                title="Clear demo data and start with 0 records in live mode"
              >
                <span className="hidden md:inline">🧹 Clean Live DB</span>
                <span className="md:hidden">🧹</span>
              </button>

              <button
                type="button"
                onClick={refreshAllData}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Refresh Live Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                title="Logout Admin"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cloud Sync Feedback Banner */}
          {cloudSyncFeedback && (
            <div className="bg-blue-600/90 text-white text-xs font-bold px-4 py-2 rounded-xl mb-2 flex items-center justify-between border border-blue-400/40 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                <span>{cloudSyncFeedback}</span>
              </div>
              <button onClick={() => setCloudSyncFeedback('')} className="text-white/80 hover:text-white text-sm">✕</button>
            </div>
          )}

          {/* Sub Navigation Bar Tabs */}
          <div className="flex space-x-1 sm:space-x-3 border-t border-slate-800/80 py-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('parcels')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'parcels' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Parcels Hub ({parcels.length})
            </button>
            <button
              onClick={() => setActiveTab('merchants')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'merchants' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Merchants ({merchants.length})
            </button>
            <button
              onClick={() => setActiveTab('riders')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'riders' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Riders Fleet ({riders.length})
            </button>
            <button
              onClick={() => setActiveTab('livemap')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'livemap' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Live Fleet GPS ({riders.filter((r) => r.isLiveTrackingActive).length || riders.length})
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap relative ${
                activeTab === 'settlements' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              COD Settlements
              {pendingSettlementCount > 0 && (
                <span className="ml-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {pendingSettlementCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'pricing' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Pricing & Dhaka SLA
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Tickets ({tickets.filter((t) => t.status === 'open').length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === 'audit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Audit Logs
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Live Operations Control Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-800 to-slate-800 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-black">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    Firebase Cloud Database Engine
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      LIVE PERSISTENCE ACTIVE
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Realtime sync enabled for Parcels, Riders, Settlements, and Merchant accounts
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsNewRiderModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  + Add New Rider
                </button>
                <button
                  type="button"
                  onClick={handleCloudSync}
                  disabled={isSyncingCloud}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                  {isSyncingCloud ? 'Syncing Cloud...' : '☁️ Push to Firebase'}
                </button>
                <button
                  type="button"
                  onClick={handleResetToClean}
                  className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 transition"
                >
                  🧹 Clear Demo (Start 0 Live)
                </button>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-md">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                  <span>Total System Parcels</span>
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">{totalParcels}</div>
                <div className="text-xs text-emerald-400 mt-1 font-semibold">
                  {deliveredParcels.length} delivered ({totalParcels > 0 ? ((deliveredParcels.length / totalParcels) * 100).toFixed(1) : 0}%)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-md">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                  <span>Total COD Collected</span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400 mt-2">
                  ৳{totalCodCollected.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Collected from buyer doorsteps
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-md">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                  <span>Courier Revenue</span>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-300 mt-2">
                  ৳{totalDeliveryRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Delivery fees + COD processing fees
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-md">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                  <span>Active Merchants & Fleet</span>
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">
                  {merchants.length} <span className="text-sm font-normal text-slate-400">/ {riders.length} Riders</span>
                </div>
                <div className="text-xs text-amber-400 mt-1 font-semibold">
                  {pendingSettlementCount} pending settlements to disburse
                </div>
              </div>
            </div>

            {/* Quick Summary Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Dispatches */}
              <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-white uppercase tracking-wider">
                    Recent Parcel Dispatches
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('parcels')}
                    className="text-xs text-blue-400 hover:underline font-bold"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-slate-700/60">
                  {parcels.slice(0, 5).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-blue-400">{p.id}</span>
                        <div className="text-white font-semibold mt-0.5">{p.customerName} ({p.area})</div>
                        <div className="text-slate-400 text-[11px]">Merchant: {p.merchantName}</div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={p.status} size="sm" />
                        <div className="text-emerald-400 font-bold mt-1">৳{p.codAmount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Settlements Review */}
              <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-white uppercase tracking-wider">
                    Pending COD Settlement Requests
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settlements')}
                    className="text-xs text-blue-400 hover:underline font-bold"
                  >
                    Manage Payouts →
                  </button>
                </div>

                <div className="divide-y divide-slate-700/60">
                  {settlements.filter((s) => s.status === 'pending').length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No pending settlement requests. All cleared!
                    </div>
                  ) : (
                    settlements
                      .filter((s) => s.status === 'pending')
                      .slice(0, 4)
                      .map((s) => (
                        <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono text-slate-400 font-bold">{s.id}</span>
                            <div className="text-white font-bold">{s.merchantName}</div>
                            <div className="text-slate-400 text-[11px] uppercase font-mono">
                              {s.method}: {s.accountDetails}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-base font-black text-emerald-400">৳{s.amount.toLocaleString()}</div>
                            <button
                              type="button"
                              onClick={() => {
                                setSettlementToApprove(s);
                                setApprovalTxRef(`TXN-BD-${Math.floor(100000 + Math.random() * 900000)}`);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs"
                            >
                              Approve Payout
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARCELS MANAGEMENT TAB */}
        {activeTab === 'parcels' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">All Nationwide Parcels</h2>
                <p className="text-xs text-slate-400">Full dispatch grid with rider assignment & status override</p>
              </div>

              <button
                type="button"
                onClick={() => exportParcelsToCSV(parcels, 'fishora_all_parcels')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 self-start"
              >
                <Download className="w-3.5 h-3.5" />
                Export Full CSV
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={parcelSearch}
                  onChange={(e) => setParcelSearch(e.target.value)}
                  placeholder="Search tracking, merchant, customer..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
                {['all', 'pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setParcelStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize whitespace-nowrap transition ${
                      parcelStatusFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Parcel ID</th>
                      <th className="px-4 py-3.5">Merchant</th>
                      <th className="px-4 py-3.5">Receiver & Address</th>
                      <th className="px-4 py-3.5">COD Amount</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Assign Rider</th>
                      <th className="px-4 py-3.5">Quick Override</th>
                      <th className="px-4 py-3.5 text-right">Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredParcels.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-750 transition">
                        <td className="px-4 py-3.5 font-bold font-mono">
                          <span className="text-blue-400">{p.id}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{p.trackingId}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{p.merchantName}</div>
                          <div className="text-slate-400 text-[11px]">{p.merchantPhone}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{p.customerName}</div>
                          <div className="text-slate-400 text-[11px]">{p.customerPhone} • {p.area}, {p.district}</div>
                        </td>
                        <td className="px-4 py-3.5 font-black text-emerald-400 text-sm">
                          ৳{p.codAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={p.status} size="sm" />
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={p.assignedRiderId || ''}
                            onChange={(e) => handleAssignRider(p.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 font-semibold"
                          >
                            <option value="">-- Assign Rider --</option>
                            {riders.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.zone.split(',')[0]})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p.id, e.target.value as ParcelStatus)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 capitalize"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="in_transit">In Transit</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="returned">Returned</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedPodParcel(p)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded-lg transition"
                            title="Inspect Proof of Delivery (POD) & OTP"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceParcel(p)}
                            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                            title="Print Shipping Label"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onTrackParcel(p.trackingId)}
                            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                            title="View Live Tracker"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MERCHANTS MANAGEMENT TAB */}
        {activeTab === 'merchants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Registered Merchants Directory</h2>
                <p className="text-xs text-slate-400">Account status, payout channels, and active balances</p>
              </div>

              <button
                type="button"
                onClick={() => exportMerchantsToCSV(merchants)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Merchants CSV
              </button>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Merchant ID</th>
                      <th className="px-4 py-3.5">Business Name & Owner</th>
                      <th className="px-4 py-3.5">Phone & Email</th>
                      <th className="px-4 py-3.5">Hub / Pickup Address</th>
                      <th className="px-4 py-3.5">Payout Method</th>
                      <th className="px-4 py-3.5">Current Balance</th>
                      <th className="px-4 py-3.5">Account Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {merchants.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-750 transition">
                        <td className="px-4 py-3.5 font-bold font-mono text-blue-400">{m.id}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white text-sm">{m.businessName}</div>
                          <div className="text-slate-400 text-[11px]">Owner: {m.ownerName}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-slate-200">{m.phone}</div>
                          <div className="text-slate-400 text-[11px]">{m.email}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300 max-w-xs truncate">
                          {m.pickupAddress}, {m.area}, {m.district}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold uppercase text-blue-400">{m.paymentMethod}</span>
                          <span className="block text-[11px] font-mono text-slate-400">{m.paymentNumberOrAccount}</span>
                        </td>
                        <td className="px-4 py-3.5 font-black text-emerald-400 text-sm">
                          ৳{m.currentBalance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={m.status} size="sm" />
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                          {m.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleMerchantStatus(m.id, 'suspended')}
                              className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold rounded-lg border border-amber-500/30"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMerchantStatus(m.id, 'active')}
                              className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold rounded-lg border border-emerald-500/30"
                            >
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* RIDERS FLEET TAB */}
        {activeTab === 'riders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Riders & Fleet Management</h2>
                <p className="text-xs text-slate-400">Active courier personnel across Dhaka zones</p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewRiderModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add New Rider
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riders.map((r) => {
                const riderParcels = parcels.filter((p) => p.assignedRiderId === r.id);
                const deliveredCount = riderParcels.filter((p) => p.status === 'delivered').length;
                const activeCount = riderParcels.filter((p) => p.status === 'out_for_delivery' || p.status === 'picked_up').length;
                const cashInHand = riderParcels.filter((p) => p.isCodCollected).reduce((acc, p) => acc + p.codAmount, 0);

                return (
                  <div key={r.id} className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                          <Bike className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{r.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{r.id}</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase">
                        {r.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div>Phone: <b>{r.phone}</b></div>
                      <div>Zone: <b>{r.zone}</b></div>
                      <div>Vehicle: <b>{r.vehicleType}</b></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-700/80">
                      <div className="p-2 bg-slate-900/60 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Active</span>
                        <span className="font-bold text-white text-sm">{activeCount}</span>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded-xl">
                        <span className="text-[10px] text-emerald-400 block">Delivered</span>
                        <span className="font-bold text-emerald-400 text-sm">{deliveredCount}</span>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded-xl">
                        <span className="text-[10px] text-amber-400 block">COD Held</span>
                        <span className="font-bold text-amber-400 text-xs">৳{cashInHand}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Login PIN: <b className="text-slate-200">1234</b></span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRider(r.id, r.name)}
                        className="px-2.5 py-1 text-[11px] bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 font-bold rounded-lg border border-rose-800/40 transition"
                      >
                        Remove Rider
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIVE FLEET GPS TRACKER TAB */}
        {activeTab === 'livemap' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">Live Dhaka Fleet GPS Operations</h2>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    REALTIME BROADCAST ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400">Live coordinates, speed, and active parcels assigned across Dhaka zones</p>
              </div>

              <button
                type="button"
                onClick={refreshAllData}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 self-start"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh GPS Ping
              </button>
            </div>

            {/* Main Interactive Fleet Map (OpenStreetMap Leaflet Engine centered on Dhaka Hubs) */}
            <div className="bg-slate-800 p-4 rounded-3xl border border-slate-700 space-y-4 shadow-xl">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 h-80 sm:h-96 shadow-inner">
                <iframe
                  title="Dhaka Fleet Realtime GPS Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=90.32%2C23.70%2C90.48%2C23.88&layer=mapnik"
                  className="w-full h-full border-0"
                  loading="lazy"
                />

                {/* Map Overlay Badge */}
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl text-xs font-bold shadow-xl border border-slate-700 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>FISHORA Dispatch Radar</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {riders.length} Active Riders Online • Dhaka North & South
                  </div>
                </div>
              </div>

              {/* Live Telemetry Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Rider</th>
                      <th className="px-4 py-3">Assigned Zone</th>
                      <th className="px-4 py-3">GPS Status</th>
                      <th className="px-4 py-3">Speed & Heading</th>
                      <th className="px-4 py-3">Current Coordinates</th>
                      <th className="px-4 py-3">Active In Bag</th>
                      <th className="px-4 py-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {riders.map((r) => {
                      const activeCount = parcels.filter(
                        (p) => p.assignedRiderId === r.id && (p.status === 'out_for_delivery' || p.status === 'picked_up')
                      ).length;
                      const loc = r.currentLocation || { lat: 23.7937, lng: 90.4066, speed: 22, heading: 45, accuracy: 10 };

                      return (
                        <tr key={r.id} className="hover:bg-slate-750 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white flex items-center gap-2">
                              <Bike className="w-4 h-4 text-blue-400" />
                              {r.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{r.phone}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-semibold">{r.zone}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              LIVE (±{loc.accuracy || 8}m)
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-bold">
                            {loc.speed || 24} km/h • {loc.heading || 45}°
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-blue-400">
                            {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-xs">
                              {activeCount} Parcels
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg inline-flex items-center gap-1 transition"
                            >
                              <Navigation className="w-3 h-3" />
                              Maps
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* COD SETTLEMENTS TAB */}
        {activeTab === 'settlements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">COD Settlement Approvals & Disbursements</h2>
                <p className="text-xs text-slate-400">Review withdrawal requests, confirm bKash/Bank reference numbers</p>
              </div>

              <button
                type="button"
                onClick={() => exportSettlementsToCSV(settlements, 'fishora_all_settlements')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Settlement ID</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Merchant Name</th>
                      <th className="px-4 py-3.5">Amount</th>
                      <th className="px-4 py-3.5">Payout Method & Details</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Tx Reference</th>
                      <th className="px-4 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {settlements.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-750 transition">
                        <td className="px-4 py-3.5 font-mono text-blue-400 font-bold">{s.id}</td>
                        <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{s.merchantName}</div>
                          <div className="text-slate-400 text-[11px]">{s.merchantPhone}</div>
                        </td>
                        <td className="px-4 py-3.5 font-black text-emerald-400 text-sm">
                          ৳{s.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold uppercase text-blue-400">{s.method}</span>
                          <span className="block text-slate-300 font-mono">{s.accountDetails}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={s.status} size="sm" />
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {s.transactionReference || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {s.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSettlementToApprove(s);
                                setApprovalTxRef(`TXN-BD-${Math.floor(100000 + Math.random() * 900000)}`);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-xs shadow-xs"
                            >
                              Approve & Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRICING & DHAKA SLA CONFIGURATION TAB */}
        {activeTab === 'pricing' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Delivery Charges & Business Pricing Configuration</h2>
              <p className="text-xs text-slate-400">Configure base rates, Dhaka inside rates (৳120), COD % cut, and return fees.</p>
            </div>

            {pricingSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {pricingSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSavePricing} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Inside Dhaka Base Charge (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editPricing.insideDhaka}
                    onChange={(e) => setEditPricing({ ...editPricing, insideDhaka: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm font-black text-white bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Steadfast-competitive rate</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Sub-Dhaka / Outskirts Rate (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editPricing.subDhaka}
                    onChange={(e) => setEditPricing({ ...editPricing, subDhaka: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm font-black text-white bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Savar, Gazipur, Narayanganj</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Outside Dhaka Rate (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editPricing.outsideDhaka}
                    onChange={(e) => setEditPricing({ ...editPricing, outsideDhaka: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm font-black text-white bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">64 Districts nationwide</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-700">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Extra Weight Fee (Inside Dhaka / kg)
                  </label>
                  <input
                    type="number"
                    value={editPricing.additionalKgChargeInsideDhaka}
                    onChange={(e) =>
                      setEditPricing({ ...editPricing, additionalKgChargeInsideDhaka: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs font-bold text-white bg-slate-900 border border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Extra Weight Fee (Outside Dhaka / kg)
                  </label>
                  <input
                    type="number"
                    value={editPricing.additionalKgChargeOutsideDhaka}
                    onChange={(e) =>
                      setEditPricing({ ...editPricing, additionalKgChargeOutsideDhaka: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs font-bold text-white bg-slate-900 border border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-700">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    COD Percentage Surcharge (e.g. 0.01 = 1%)
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    value={editPricing.codPercentageFee}
                    onChange={(e) =>
                      setEditPricing({ ...editPricing, codPercentageFee: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs font-bold text-white bg-slate-900 border border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Return Charge (Customer Refused at Doorstep)
                  </label>
                  <input
                    type="number"
                    value={editPricing.returnChargeInsideDhaka}
                    onChange={(e) =>
                      setEditPricing({ ...editPricing, returnChargeInsideDhaka: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs font-bold text-white bg-slate-900 border border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Save New System Pricing Configuration
              </button>
            </form>
          </div>
        )}

        {/* SUPPORT TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white">Merchant Support Desk</h2>
              <p className="text-xs text-slate-400">Resolve parcel delays, COD queries, and key account requests</p>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 divide-y divide-slate-700">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="p-4 flex items-center justify-between hover:bg-slate-750 cursor-pointer transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-blue-400 font-bold">#{t.id}</span>
                      <span className="font-bold text-white">{t.subject}</span>
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Merchant: <b>{t.merchantName}</b> • Category: {t.category.replace('_', ' ')}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-blue-400">
                    {t.messages.length} messages →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white">System Security & Financial Audit Trail</h2>
              <p className="text-xs text-slate-400">Immutable log of financial adjustments, status overrides, and logins</p>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 uppercase font-extrabold">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">User & Role</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-750">
                        <td className="px-4 py-3 text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">
                          {log.userName} ({log.userRole.toUpperCase()})
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-blue-400 font-bold">{log.action}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono">{log.entityId}</td>
                        <td className="px-4 py-3 text-slate-300">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* APPROVE SETTLEMENT MODAL */}
      {settlementToApprove && (
        <Modal
          isOpen={!!settlementToApprove}
          onClose={() => setSettlementToApprove(null)}
          title="Confirm COD Settlement Disbursement"
          maxWidth="md"
        >
          <form onSubmit={handleConfirmApproval} className="space-y-4 text-slate-900">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-800 uppercase">Payout Amount</span>
                <span className="font-mono text-xs font-bold text-slate-500">{settlementToApprove.id}</span>
              </div>
              <div className="text-3xl font-black text-emerald-700 mt-1">
                ৳{settlementToApprove.amount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-700 mt-1">
                Merchant: <b>{settlementToApprove.merchantName}</b> ({settlementToApprove.merchantPhone})
              </div>
              <div className="text-xs font-mono text-blue-700 mt-1 bg-white p-2 rounded-lg border border-emerald-100">
                Channel: <b>{settlementToApprove.method.toUpperCase()}</b> • Details: {settlementToApprove.accountDetails}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank / Mobile Financial Service (MFS) Transaction ID *
              </label>
              <input
                type="text"
                required
                value={approvalTxRef}
                onChange={(e) => setApprovalTxRef(e.target.value)}
                placeholder="e.g. 9B38K1190X or BEFTN-109283"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Audit Note (Optional)
              </label>
              <input
                type="text"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="e.g. Disbursed via City Bank Corporate Gateway"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSettlementToApprove(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Disburse Funds
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* NEW RIDER MODAL */}
      <Modal
        isOpen={isNewRiderModalOpen}
        onClose={() => setIsNewRiderModalOpen(false)}
        title="Add Field Courier Rider"
        subtitle="Register new delivery personnel. Rider can log in using their phone and PIN."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRider} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rider Full Name *</label>
            <input
              type="text"
              required
              value={newRiderName}
              onChange={(e) => setNewRiderName(e.target.value)}
              placeholder="e.g. Jahangir Alam"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
              <input
                type="tel"
                required
                value={newRiderPhone}
                onChange={(e) => setNewRiderPhone(e.target.value)}
                placeholder="01712-XXXXXX"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Login PIN / Password</label>
              <input
                type="text"
                value={newRiderPassword}
                onChange={(e) => setNewRiderPassword(e.target.value)}
                placeholder="1234"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Dhaka Zone *</label>
              <input
                type="text"
                required
                value={newRiderZone}
                onChange={(e) => setNewRiderZone(e.target.value)}
                placeholder="e.g. Uttara & Airport, Dhaka"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
              <select
                value={newRiderVehicle}
                onChange={(e) => setNewRiderVehicle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Delivery Van">Delivery Van</option>
                <option value="Electric Scooter">Electric Scooter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">National ID / NID Number (Optional)</label>
            <input
              type="text"
              value={newRiderNid}
              onChange={(e) => setNewRiderNid(e.target.value)}
              placeholder="e.g. 19942692518000XXX"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Present Address / Depot Location</label>
            <input
              type="text"
              value={newRiderAddress}
              onChange={(e) => setNewRiderAddress(e.target.value)}
              placeholder="e.g. House 14, Road 5, Mirpur-10, Dhaka"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewRiderModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save & Register Rider
            </button>
          </div>
        </form>
      </Modal>

      {/* ADMIN TICKET REPLY MODAL */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket: ${selectedTicket.subject}`}
          subtitle={`Merchant: ${selectedTicket.merchantName} • Status: ${selectedTicket.status}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-slate-900">
            <div className="max-h-80 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              {selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.senderRole === 'admin' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    <span className="font-bold text-slate-700">{m.senderName}</span>
                    <span>• {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs max-w-md ${
                      m.senderRole === 'admin'
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleTicketReply} className="flex gap-2">
              <input
                type="text"
                required
                value={ticketReplyText}
                onChange={(e) => setTicketReplyText(e.target.value)}
                placeholder="Write official resolution or response to merchant..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Send Reply
              </button>
            </form>
          </div>
        </Modal>
      )}

      {/* BARCODE INVOICE MODAL */}
      <BarcodeInvoiceModal
        parcel={selectedInvoiceParcel}
        isOpen={!!selectedInvoiceParcel}
        onClose={() => setSelectedInvoiceParcel(null)}
      />

      {/* PROOF OF DELIVERY (POD) INSPECTOR MODAL */}
      {selectedPodParcel && (
        <Modal
          isOpen={!!selectedPodParcel}
          onClose={() => setSelectedPodParcel(null)}
          title={`Proof of Delivery: ${selectedPodParcel.id}`}
          subtitle={`Tracking: ${selectedPodParcel.trackingId} • Status: ${selectedPodParcel.status}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-slate-900">
            {/* Header info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Receiver / Customer</span>
                <div className="font-extrabold text-sm text-slate-900">{selectedPodParcel.customerName}</div>
                <div className="text-xs text-slate-500">{selectedPodParcel.customerPhone} • {selectedPodParcel.area}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">COD Collected</span>
                <div className="text-lg font-black text-emerald-700">৳{selectedPodParcel.codAmount.toLocaleString()}</div>
              </div>
            </div>

            {/* OTP Security Code */}
            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700">Security Verification OTP</span>
                <div className="text-sm font-black text-blue-950 font-mono">
                  {selectedPodParcel.deliverySecurityCode ? `CODE: ${selectedPodParcel.deliverySecurityCode}` : 'Standard Signature Verification'}
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">
                {selectedPodParcel.status === 'delivered' ? '✓ VERIFIED' : 'PENDING'}
              </span>
            </div>

            {/* Photo & Signature Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  Delivered Photo Proof
                </span>
                {selectedPodParcel.deliveryProofPhotoUrl ? (
                  <img
                    src={selectedPodParcel.deliveryProofPhotoUrl}
                    alt="Proof of Delivery"
                    className="w-full h-36 object-cover rounded-xl border border-slate-200 shadow-2xs"
                  />
                ) : (
                  <div className="h-36 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                    No photo uploaded
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FileSignature className="w-3.5 h-3.5 text-blue-600" />
                  Customer Signature
                </span>
                {selectedPodParcel.deliverySignatureUrl ? (
                  <img
                    src={selectedPodParcel.deliverySignatureUrl}
                    alt="Customer Digital Signature"
                    className="w-full h-36 object-contain bg-white rounded-xl border border-slate-200 shadow-2xs p-2"
                  />
                ) : (
                  <div className="h-36 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                    No digital signature
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPodParcel(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
