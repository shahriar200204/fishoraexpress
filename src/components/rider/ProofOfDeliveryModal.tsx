import React, { useState, useRef, useEffect } from 'react';
import { Parcel } from '../../types';
import { Modal } from '../common/Modal';
import {
  CheckCircle2,
  Camera,
  Upload,
  RotateCcw,
  KeyRound,
  DollarSign,
  AlertCircle,
  Sparkles,
  MapPin,
  FileSignature
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProofOfDeliveryModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelivery: (data: {
    collectedCod: number;
    securityCode: string;
    photoUrl?: string;
    signatureUrl?: string;
    note?: string;
  }) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  parcel,
  isOpen,
  onClose,
  onConfirmDelivery,
}) => {
  const [collectedCod, setCollectedCod] = useState<number>(0);
  const [enteredSecurityCode, setEnteredSecurityCode] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  useEffect(() => {
    if (parcel) {
      setCollectedCod(parcel.codAmount);
      setEnteredSecurityCode('');
      setPhotoPreview(null);
      setDeliveryNote('');
      setError('');
      setHasSignature(false);
    }
  }, [parcel]);

  // Set up signature canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!parcel) return null;

  // Handle Photo Upload / Capture
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Signature Pad Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If parcel has a security code, verify matching or allow admin override
    if (parcel.deliverySecurityCode && enteredSecurityCode.trim()) {
      if (enteredSecurityCode.trim() !== parcel.deliverySecurityCode.trim()) {
        setError(`Incorrect Delivery OTP Code. (Expected ${parcel.deliverySecurityCode} or ask customer for SMS code).`);
        return;
      }
    }

    let signatureDataUrl: string | undefined = undefined;
    if (hasSignature && canvasRef.current) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    onConfirmDelivery({
      collectedCod,
      securityCode: enteredSecurityCode.trim() || parcel.deliverySecurityCode || 'VERIFIED',
      photoUrl: photoPreview || undefined,
      signatureUrl: signatureDataUrl,
      note: deliveryNote.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Proof of Delivery (POD) Confirmation" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer & Package Summary */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Parcel ID: {parcel.id}</span>
            <div className="font-extrabold text-sm text-slate-900">{parcel.customerName}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {parcel.area}, {parcel.district}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">COD Due</span>
            <div className="text-xl font-black text-emerald-700">৳{parcel.codAmount.toLocaleString()}</div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. OTP Security Code Entry */}
        <div className="space-y-1.5 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-blue-950 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-600" />
              1. Customer Delivery Security Code (OTP)
            </label>
            {parcel.deliverySecurityCode && (
              <span className="text-[11px] font-mono font-bold bg-white text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                Expected: {parcel.deliverySecurityCode}
              </span>
            )}
          </div>
          <p className="text-[11px] text-blue-800">
            Ask customer for the 4-digit verification code sent via SMS/order receipt.
          </p>
          <input
            type="text"
            maxLength={6}
            value={enteredSecurityCode}
            onChange={(e) => setEnteredSecurityCode(e.target.value)}
            placeholder={parcel.deliverySecurityCode ? `Enter ${parcel.deliverySecurityCode}` : 'e.g. 8492'}
            className="w-full px-3.5 py-2.5 bg-white font-mono text-center tracking-widest text-base font-bold text-slate-900 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* 2. Photo Proof of Delivery (Camera / Upload) */}
        <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-blue-600" />
            2. Package Delivery Photo Proof (Optional / Recommended)
          </label>
          <p className="text-[11px] text-slate-500">
            Snap a photo of the parcel handed to customer or at doorstep.
          </p>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-2 shadow-2xs transition">
              <Upload className="w-4 h-4 text-blue-600" />
              Take Photo / Upload
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <div className="flex items-center gap-2">
                <img
                  src={photoPreview}
                  alt="Delivery Proof"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Digital Signature Pad */}
        <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <FileSignature className="w-4 h-4 text-blue-600" />
              3. Customer Digital Signature
            </label>
            {hasSignature && (
              <button
                type="button"
                onClick={clearSignature}
                className="text-[11px] text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-300 p-1 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={460}
              height={110}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-28 cursor-crosshair touch-none"
            />
            {!hasSignature && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-300 font-semibold">
                Sign with finger or stylus here
              </div>
            )}
          </div>
        </div>

        {/* 4. Cash COD Collection Counter */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Cash COD Collected (৳ BDT) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-600 text-sm">৳</span>
            <input
              type="number"
              required
              min="0"
              value={collectedCod}
              onChange={(e) => setCollectedCod(Number(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-2.5 text-base font-black text-slate-900 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Delivery & COD
          </button>
        </div>
      </form>
    </Modal>
  );
};
