import React, { useRef } from 'react';
import { Parcel } from '../../types';
import { Modal } from './Modal';
import { Logo } from './Logo';
import { Printer, MapPin, Phone, User, Package, Calendar, Clock, CheckCircle } from 'lucide-react';

interface BarcodeInvoiceModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeInvoiceModal: React.FC<BarcodeInvoiceModalProps> = ({ parcel, isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!parcel) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shipping Label & Invoice" maxWidth="2xl">
      <div className="space-y-6">
        {/* Printable Area */}
        <div
          ref={printRef}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white text-slate-900 shadow-xs printable-container"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <Logo size="md" />
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-slate-400">Parcel ID</span>
              <div className="text-xl font-black tracking-tight text-blue-600">{parcel.id}</div>
              <div className="text-[11px] text-slate-500">{new Date(parcel.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Barcode & QR Code Graphic */}
          <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Parcel Barcode & Tracking</span>
              <div className="flex items-center space-x-1 h-12 w-full max-w-xs justify-center sm:justify-start">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 4, 1, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2].map((w, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 h-full rounded-xs"
                    style={{ width: `${w * 2.2}px`, opacity: i % 2 === 0 ? 1 : 0.85 }}
                  />
                ))}
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-700">
                *{parcel.trackingId}*
              </span>
            </div>

            {/* Scannable Optical QR Code for Rider Scan */}
            <div className="flex flex-col items-center p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(parcel.id)}&margin=4`}
                alt={`QR Code ${parcel.id}`}
                className="w-20 h-20 object-contain"
                crossOrigin="anonymous"
              />
              <span className="text-[9px] font-mono font-bold text-slate-500 mt-0.5">SCAN FOR PICKUP</span>
            </div>
          </div>

          {/* Sender & Receiver Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 pb-4 text-sm">
            {/* Sender */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">From (Merchant)</span>
              <div className="font-bold text-slate-900 mt-1">{parcel.merchantName}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {parcel.merchantPhone}
              </div>
              <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{parcel.pickupAddress}</span>
              </div>
            </div>

            {/* Receiver */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">To (Customer)</span>
              <div className="font-bold text-slate-900 mt-1">{parcel.customerName}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mt-0.5">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                {parcel.customerPhone}
              </div>
              <div className="flex items-start gap-1.5 text-xs text-slate-700 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>{parcel.fullAddress}, {parcel.area}, {parcel.district}</span>
              </div>
              {parcel.deliveryNote && (
                <div className="mt-1 text-[11px] text-amber-700 bg-amber-50 p-1 rounded font-medium">
                  Note: {parcel.deliveryNote}
                </div>
              )}
            </div>
          </div>

          {/* Package & COD Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Item</span>
              <div className="font-bold text-xs text-slate-800 truncate">{parcel.productName}</div>
              <div className="text-[11px] text-slate-500">Qty: {parcel.quantity} | {parcel.weight} kg</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Type</span>
              <div className="font-bold text-xs text-slate-800 capitalize">{parcel.parcelType}</div>
              <div className="text-[11px] text-slate-500 capitalize">{parcel.deliveryType.replace('_', ' ')}</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Delivery Fee</span>
              <div className="font-bold text-sm text-slate-900">৳{parcel.deliveryCharge}</div>
              {parcel.deliverySecurityCode && (
                <div className="text-[11px] text-blue-600 font-mono font-bold">OTP: #{parcel.deliverySecurityCode}</div>
              )}
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase font-extrabold">COD Amount</span>
              <div className="font-extrabold text-lg text-emerald-700">৳{parcel.codAmount.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Collect from receiver</div>
            </div>
          </div>

          {/* Proof of Delivery Section if Delivered */}
          {(parcel.deliveryProofPhotoUrl || parcel.deliverySignatureUrl) && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 my-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">Verified Proof of Delivery (POD)</span>
              <div className="flex items-center gap-4">
                {parcel.deliveryProofPhotoUrl && (
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">Delivered Photo</span>
                    <img
                      src={parcel.deliveryProofPhotoUrl}
                      alt="Delivery Photo"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                    />
                  </div>
                )}
                {parcel.deliverySignatureUrl && (
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">Customer Signature</span>
                    <img
                      src={parcel.deliverySignatureUrl}
                      alt="Signature"
                      className="h-14 bg-white p-1 rounded-lg border border-slate-300"
                    />
                  </div>
                )}
                <div className="text-xs text-slate-600">
                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Handed to {parcel.customerName}
                  </div>
                  <div className="text-[11px] text-slate-500">{parcel.deliveredAt ? new Date(parcel.deliveredAt).toLocaleString() : 'Delivered'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Security Stamp */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            <span>FISHORA Express Courier Services • Hotline: +880 9612-445566</span>
            <span className="font-mono">Est: {parcel.estimatedDeliveryDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Shipping Label
          </button>
        </div>
      </div>
    </Modal>
  );
};
