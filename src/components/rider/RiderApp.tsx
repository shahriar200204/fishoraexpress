import React, { useState, useEffect } from 'react';
import { Rider, Parcel, ParcelStatus } from '../../types';
import { StorageService } from '../../lib/storage';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ProofOfDeliveryModal } from './ProofOfDeliveryModal';
import { RiderLiveLocationTracker } from './RiderLiveLocationTracker';
import { QrCodeScannerModal } from './QrCodeScannerModal';
import {
  Bike,
  Phone,
  MapPin,
  Package,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Scan,
  Camera,
  AlertCircle,
  LogOut,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RiderAppProps {
  rider: Rider;
  onLogout: () => void;
  onTrackParcel: (trackingId: string) => void;
}

export const RiderApp: React.FC<RiderAppProps> = ({ rider, onLogout, onTrackParcel }) => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [filterTab, setFilterTab] = useState<'deliveries' | 'pickups' | 'map' | 'history'>('deliveries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParcelForPod, setSelectedParcelForPod] = useState<Parcel | null>(null);
  const [selectedParcelForReturn, setSelectedParcelForReturn] = useState<Parcel | null>(null);
  const [selectedParcelForScan, setSelectedParcelForScan] = useState<Parcel | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Customer Unreachable');
  const [customReturnReason, setCustomReturnReason] = useState('');
  const [cashCollectedToday, setCashCollectedToday] = useState(0);

  const loadData = () => {
    const all = StorageService.getParcels();
    // Rider parcels: assigned to this rider or relevant to rider's zone
    const myParcels = all.filter(
      (p) =>
        p.assignedRiderId === rider.id ||
        (rider.zone.toLowerCase().includes(p.district.toLowerCase()) && p.status !== 'delivered')
    );
    setParcels(myParcels);

    // Calculate today's cash collected
    const collectedToday = all
      .filter((p) => p.assignedRiderId === rider.id && p.isCodCollected)
      .reduce((sum, p) => sum + p.codAmount, 0);
    setCashCollectedToday(collectedToday);
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('fishora_storage_change', handleStorageChange);
    return () => window.removeEventListener('fishora_storage_change', handleStorageChange);
  }, [rider.id]);

  // Sub-lists
  const activeDeliveries = parcels.filter(
    (p) => p.status === 'out_for_delivery' || p.status === 'in_transit'
  );
  const pendingPickups = parcels.filter(
    (p) => p.status === 'pending' || p.status === 'confirmed' || p.status === 'pickup_assigned'
  );
  const completedToday = parcels.filter((p) => p.status === 'delivered');

  // Handle Mark Picked Up
  const handleMarkPickup = (parcel: Parcel) => {
    StorageService.updateParcelStatus(parcel.id, 'picked_up', {
      title: 'Picked Up by Rider',
      description: `Rider ${rider.name} collected parcel from merchant ${parcel.merchantName}.`,
      location: `${parcel.area}, Dhaka Hub`,
      updatedBy: rider.name,
      riderId: rider.id,
      riderName: rider.name,
    });
    // Immediately set to in_transit / out_for_delivery
    StorageService.updateParcelStatus(parcel.id, 'out_for_delivery', {
      title: 'Out for Delivery',
      description: `Rider ${rider.name} is on the way to customer address.`,
      location: parcel.area,
      updatedBy: rider.name,
      riderId: rider.id,
      riderName: rider.name,
    });
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    loadData();
  };

  // Handle Complete Delivery via POD (Proof of Delivery)
  const handleConfirmDeliveryWithPod = (data: {
    collectedCod: number;
    securityCode: string;
    photoUrl?: string;
    signatureUrl?: string;
    note?: string;
  }) => {
    if (!selectedParcelForPod) return;

    StorageService.deliverParcelWithProof(selectedParcelForPod.id, rider.id, rider.name, {
      collectedCod: data.collectedCod,
      securityCode: data.securityCode,
      photoUrl: data.photoUrl,
      signatureUrl: data.signatureUrl,
      note: data.note,
    });

    setSelectedParcelForPod(null);
    loadData();
  };

  // Handle Mark Return / Failed
  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelForReturn) return;

    const finalReason = returnReason === 'Other' ? customReturnReason : returnReason;

    StorageService.updateParcelStatus(selectedParcelForReturn.id, 'return_requested', {
      title: 'Delivery Attempt Failed / Return Requested',
      description: `Reason: ${finalReason}. Package being returned to Dhaka Central Sorting Hub.`,
      location: `${selectedParcelForReturn.area}`,
      updatedBy: rider.name,
      riderId: rider.id,
      riderName: rider.name,
    });

    setSelectedParcelForReturn(null);
    loadData();
  };

  // Filtered deliveries for search
  const filteredDeliveries = activeDeliveries.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.trackingId.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.customerPhone.includes(q) ||
      p.area.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Mobile-first Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 sticky top-16 z-30 shadow-md">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight">{rider.name}</h1>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE GPS ONLINE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Zone: {rider.zone} • ID: {rider.id}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
              title="Logout Rider"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Cash in Hand & Daily Metric Ribbon */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                Cash in Hand (Today's COD)
              </span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                ৳{cashCollectedToday.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Ready for Hub Settlement</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                Assigned Queue
              </span>
              <div className="text-xl font-black text-white mt-0.5">
                {activeDeliveries.length} Packages
              </div>
              <span className="text-[10px] text-slate-400">{completedToday.length} completed today</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-800 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterTab('deliveries')}
              className={`py-2 rounded-lg transition text-center ${
                filterTab === 'deliveries'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Deliveries ({activeDeliveries.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('pickups')}
              className={`py-2 rounded-lg transition text-center ${
                filterTab === 'pickups'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pickups ({pendingPickups.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('map')}
              className={`py-2 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                filterTab === 'map'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Live GPS
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('history')}
              className={`py-2 rounded-lg transition text-center ${
                filterTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Done ({completedToday.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* LIVE GPS MAP TAB */}
        {filterTab === 'map' && (
          <div className="space-y-4">
            <RiderLiveLocationTracker rider={rider} activeParcels={activeDeliveries} />
          </div>
        )}

        {/* TAB 1: ACTIVE DELIVERIES */}
        {filterTab === 'deliveries' && (
          <div className="space-y-3">
            {/* Search Bar inside rider app */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parcel ID or customer phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-white text-xs font-semibold rounded-2xl border border-slate-200 shadow-2xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {filteredDeliveries.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl p-6 border border-slate-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">All Deliveries Complete!</h3>
                <p className="text-xs text-slate-500">
                  You have no pending deliveries assigned in your bag right now.
                </p>
              </div>
            ) : (
              filteredDeliveries.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 hover:border-blue-300 transition"
                >
                  {/* Top Bar: Parcel ID + OTP Badge */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Parcel ID</span>
                      <div className="text-base font-black text-blue-600 font-mono flex items-center gap-1.5">
                        {p.id}
                        {p.deliverySecurityCode && (
                          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                            OTP: {p.deliverySecurityCode}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Collect COD</span>
                      <div className="text-lg font-black text-emerald-700">৳{p.codAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Customer Information with Call & Map buttons */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{p.customerName}</div>
                        <div className="text-xs text-slate-500">{p.productName} ({p.weight} kg)</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            p.fullAddress + ', ' + p.area + ', Dhaka'
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center gap-1"
                          title="Open Google Maps Navigation"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          Map
                        </a>
                        <a
                          href={`tel:${p.customerPhone}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2 text-xs text-slate-700">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">{p.fullAddress}</div>
                        <div className="text-slate-500 text-[11px]">{p.area}, {p.district}</div>
                        {p.deliveryNote && (
                          <div className="mt-1 text-amber-700 bg-amber-50 p-1 rounded text-[11px] font-semibold">
                            Note: {p.deliveryNote}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Deliver via POD vs Return Request */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedParcelForReturn(p);
                        setReturnReason('Customer Unreachable');
                      }}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Failed / Return
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedParcelForPod(p)}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Deliver with POD
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PENDING PICKUPS FROM MERCHANTS */}
        {filterTab === 'pickups' && (
          <div className="space-y-3">
            {/* Quick QR Scanner Action Header */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 rounded-3xl border border-blue-800 shadow-md flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-black text-sm text-blue-300">
                  <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Camera Optical QR Scanner
                </div>
                <p className="text-[11px] text-slate-300">
                  Quickly scan parcel barcodes / QR codes at merchant pickup locations
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedParcelForScan(null);
                  setIsQrScannerOpen(true);
                }}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-md shadow-blue-600/30 flex items-center gap-1.5 shrink-0 transition"
              >
                <Camera className="w-4 h-4" />
                Scan Label
              </button>
            </div>

            {pendingPickups.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl p-6 border border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">All Pickups Collected!</h4>
                <p className="text-xs text-slate-400 mt-0.5">No merchant pickups pending in this zone.</p>
              </div>
            ) : (
              pendingPickups.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Merchant Pickup</span>
                      <div className="font-bold text-slate-900">{p.merchantName}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {p.id}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {p.merchantPhone}
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{p.pickupAddress}</span>
                    </div>
                    <div className="text-slate-500 pt-1">
                      Deliver to: <b>{p.customerName}</b> ({p.area}) • COD: <b>৳{p.codAmount}</b>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedParcelForScan(p);
                        setIsQrScannerOpen(true);
                      }}
                      className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <Scan className="w-4 h-4" />
                      Scan & Confirm Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkPickup(p)}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Quick Confirm
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: COMPLETED DELIVERIES */}
        {filterTab === 'history' && (
          <div className="space-y-3">
            {completedToday.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{p.id}</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Delivered
                    </span>
                    {p.deliverySecurityCode && (
                      <span className="text-[10px] font-mono text-slate-500">
                        OTP #{p.deliverySecurityCode}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-emerald-700">৳{p.codAmount}</div>
                    <span className="text-[10px] text-emerald-600 font-semibold">COD Collected</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  {p.customerName} • {p.area}
                </div>

                {/* Show POD indicators */}
                {(p.deliveryProofPhotoUrl || p.deliverySignatureUrl) && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    {p.deliveryProofPhotoUrl && (
                      <img
                        src={p.deliveryProofPhotoUrl}
                        alt="Proof"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                    )}
                    {p.deliverySignatureUrl && (
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        ✍️ Signed by customer
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR CODE & BARCODE SCANNER MODAL */}
      <QrCodeScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => {
          setIsQrScannerOpen(false);
          setSelectedParcelForScan(null);
        }}
        targetParcel={selectedParcelForScan}
        allPendingParcels={pendingPickups}
        onConfirmPickup={handleMarkPickup}
      />

      {/* PROOF OF DELIVERY CONFIRMATION MODAL */}
      <ProofOfDeliveryModal
        parcel={selectedParcelForPod}
        isOpen={!!selectedParcelForPod}
        onClose={() => setSelectedParcelForPod(null)}
        onConfirmDelivery={handleConfirmDeliveryWithPod}
      />

      {/* FAILED / RETURN REQUEST MODAL */}
      {selectedParcelForReturn && (
        <Modal
          isOpen={!!selectedParcelForReturn}
          onClose={() => setSelectedParcelForReturn(null)}
          title="Report Delivery Failure / Return"
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmReturn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Failure Reason *</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-600 bg-white"
              >
                <option value="Customer Unreachable">Customer Phone Switched Off / Unreachable</option>
                <option value="Customer Refused">Customer Refused Delivery / Cancelled Order</option>
                <option value="Wrong Address">Wrong / Incomplete Address</option>
                <option value="Customer Requested Reschedule">Customer Requested Another Date</option>
                <option value="Damaged in Transit">Package Damaged</option>
                <option value="Other">Other Reason</option>
              </select>
            </div>

            {returnReason === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specify Details *</label>
                <input
                  type="text"
                  required
                  value={customReturnReason}
                  onChange={(e) => setCustomReturnReason(e.target.value)}
                  placeholder="Explain why parcel couldn't be delivered..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedParcelForReturn(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Mark Return Request
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
