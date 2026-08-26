import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Merchant, ParcelType, DeliveryType, Parcel } from '../../types';
import { BANGLADESH_DISTRICTS, DHAKA_AREAS } from '../../lib/constants';
import { StorageService } from '../../lib/storage';
import { Package, MapPin, User, Phone, DollarSign, Scale, FileText, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateParcelModalProps {
  merchant: Merchant;
  isOpen: boolean;
  onClose: () => void;
  onParcelCreated: (parcel: Parcel) => void;
  onPrintLabel?: (parcel: Parcel) => void;
}

export const CreateParcelModal: React.FC<CreateParcelModalProps> = ({
  merchant,
  isOpen,
  onClose,
  onParcelCreated,
  onPrintLabel,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('Mirpur');
  const [customArea, setCustomArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(1);
  const [parcelType, setParcelType] = useState<ParcelType>('standard');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [codAmount, setCodAmount] = useState<number>(1000);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [error, setError] = useState('');
  const [createdParcel, setCreatedParcel] = useState<Parcel | null>(null);

  const pricing = StorageService.getPricing();

  // Dynamic calculations
  const calculateCharges = () => {
    let baseRate = pricing.insideDhaka;
    let extraKgRate = pricing.additionalKgChargeInsideDhaka;

    if (district !== 'Dhaka') {
      baseRate = pricing.outsideDhaka;
      extraKgRate = pricing.additionalKgChargeOutsideDhaka;
    }

    const extraWeight = Math.max(0, weight - 1);
    const weightFee = extraWeight * extraKgRate;
    const expressFee = deliveryType === 'express' ? 40 : 0;
    const fragileFee = parcelType === 'fragile' ? 20 : 0;

    const deliveryCharge = baseRate + weightFee + expressFee + fragileFee;
    const codCharge = Math.round(codAmount * pricing.codPercentageFee);
    const merchantPayable = Math.max(0, codAmount - deliveryCharge - codCharge);

    return {
      baseRate,
      weightFee,
      expressFee,
      fragileFee,
      deliveryCharge,
      codCharge,
      merchantPayable,
    };
  };

  const charges = calculateCharges();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName || !customerPhone || !fullAddress || !productName) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    if (customerPhone.length < 10) {
      setError('Please enter a valid Bangladeshi customer phone number');
      return;
    }

    const selectedArea = district === 'Dhaka' ? area : (customArea || 'Sadar');

    try {
      const newParcel = StorageService.createParcel({
        merchantId: merchant.id,
        merchantName: merchant.businessName,
        merchantPhone: merchant.phone,
        pickupAddress: merchant.pickupAddress,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        district,
        area: selectedArea,
        fullAddress: fullAddress.trim(),
        productName: productName.trim(),
        quantity: Number(quantity),
        weight: Number(weight),
        parcelType,
        deliveryType,
        codAmount: Number(codAmount),
        deliveryNote: deliveryNote.trim(),
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setCreatedParcel(newParcel);
      onParcelCreated(newParcel);
    } catch (err: any) {
      setError(err.message || 'Failed to create parcel.');
    }
  };

  const handleResetAndNew = () => {
    setCustomerName('');
    setCustomerPhone('');
    setFullAddress('');
    setProductName('');
    setQuantity(1);
    setWeight(1);
    setCodAmount(1000);
    setDeliveryNote('');
    setCreatedParcel(null);
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="space-y-6">
        {/* Success confirmation overlay */}
        {createdParcel ? (
          <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider">
                Parcel Booked Successfully
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Parcel ID: {createdParcel.id}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tracking ID: <b className="font-mono text-slate-800">{createdParcel.trackingId}</b> • Receiver:{' '}
                <b>{createdParcel.customerName}</b>
              </p>
            </div>

            {/* Quick summary box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs grid grid-cols-3 gap-3 text-center max-w-lg mx-auto">
              <div>
                <span className="text-slate-400 font-bold block">COD Amount</span>
                <span className="font-extrabold text-emerald-700 text-base">৳{createdParcel.codAmount}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Delivery Fee</span>
                <span className="font-bold text-slate-800 text-base">৳{createdParcel.deliveryCharge}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Your Payable</span>
                <span className="font-extrabold text-blue-600 text-base">৳{createdParcel.merchantPayable}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {onPrintLabel && (
                <button
                  type="button"
                  onClick={() => {
                    onPrintLabel(createdParcel);
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Shipping Label / Barcode
                </button>
              )}
              <button
                type="button"
                onClick={handleResetAndNew}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                + Create Another Parcel
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Done / Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header (Matching Wireframe 04) */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                <Package className="w-4 h-4" /> Merchant Parcel Creation
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Create New Delivery Parcel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pickup from: <b>{merchant.businessName}</b> ({merchant.pickupAddress})
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Customer Details */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Customer & Delivery Location
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Customer Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="01712-XXXXXX"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white font-semibold"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d} {d === 'Dhaka' ? '(৳120 Base)' : '(৳200 Base)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Thana / Area *</label>
                    {district === 'Dhaka' ? (
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white font-semibold"
                      >
                        {DHAKA_AREAS.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={customArea}
                        onChange={(e) => setCustomArea(e.target.value)}
                        placeholder="e.g. Agrabad / Kotwali"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Customer Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <textarea
                      required
                      rows={2}
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="House No, Road No, Sector, Flat No, Landmark"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Product & Parcel Specifications */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Product & Package Attributes
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Product Description / Name *</label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Cotton Panjabi / Wireless Earbuds"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg) *</label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="30"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parcel Type</label>
                    <select
                      value={parcelType}
                      onChange={(e) => setParcelType(e.target.value as ParcelType)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white capitalize"
                    >
                      <option value="standard">Standard Box/Bag</option>
                      <option value="document">Document / Letter</option>
                      <option value="fragile">Fragile / Glass (+৳20)</option>
                      <option value="liquid">Liquid / Cosmetic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Speed SLA</label>
                    <select
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white capitalize font-semibold"
                    >
                      <option value="standard">Standard (Next-Day)</option>
                      <option value="express">Express Priority (+৳40)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Special Delivery Instructions</label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="e.g. Call before delivery / Don't deliver after 6 PM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              {/* Row 3: COD Amount & Realtime Dynamic Calculation (Matching Wireframe 04) */}
              <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-600" /> Cash on Delivery (COD) & Breakdown
                  </span>
                  <div className="text-xs text-blue-700 font-semibold">
                    Inside Dhaka Flat Rate: <b>৳{pricing.insideDhaka}</b>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Cash to Collect from Customer (BDT) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-700 text-sm">৳</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={codAmount}
                        onChange={(e) => setCodAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full pl-8 pr-3 py-2.5 text-base font-black text-slate-900 rounded-xl border border-blue-300 focus:ring-2 focus:ring-blue-600 bg-white shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Dynamic Calculation Breakdown */}
                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Charge ({district}):</span>
                      <span className="font-semibold text-slate-800">৳{charges.deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>COD Fee ({(pricing.codPercentageFee * 100).toFixed(0)}%):</span>
                      <span className="font-semibold text-slate-800">৳{charges.codCharge}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-extrabold text-blue-700 text-sm">
                      <span>Merchant Payable:</span>
                      <span>৳{charges.merchantPayable}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/30 flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Save & Generate Parcel Label
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
};
