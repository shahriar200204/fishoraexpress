import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { Parcel } from '../../types';
import { Modal } from '../common/Modal';
import {
  Scan,
  Camera,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  CheckCircle2,
  AlertCircle,
  Package,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Upload,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetParcel?: Parcel | null;
  allPendingParcels: Parcel[];
  onConfirmPickup: (parcel: Parcel) => void;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  targetParcel,
  allPendingParcels,
  onConfirmPickup,
}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isTorchSupported, setIsTorchSupported] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [matchedParcel, setMatchedParcel] = useState<Parcel | null>(null);
  const [scanSuccessAnim, setScanSuccessAnim] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const isScanningActive = useRef<boolean>(false);

  // Play crisp synthetic confirmation beep
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12); // High beep
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio not permitted or supported
    }

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
  };

  // Helper to extract parcel identifier from QR content
  const findParcelFromCode = useCallback(
    (codeText: string): Parcel | null => {
      const cleaned = codeText.trim().toUpperCase();
      if (!cleaned) return null;

      // 1. Exact match with target parcel if provided
      if (targetParcel) {
        if (
          cleaned.includes(targetParcel.id.toUpperCase()) ||
          cleaned.includes(targetParcel.trackingId.toUpperCase()) ||
          cleaned === targetParcel.id.toUpperCase()
        ) {
          return targetParcel;
        }
      }

      // 2. Search in all pending pickups
      for (const p of allPendingParcels) {
        if (
          cleaned.includes(p.id.toUpperCase()) ||
          cleaned.includes(p.trackingId.toUpperCase()) ||
          cleaned === p.id.toUpperCase() ||
          cleaned === p.trackingId.toUpperCase()
        ) {
          return p;
        }
      }

      // 3. Substring / Token matching
      for (const p of allPendingParcels) {
        const idNum = p.id.replace(/\D/g, '');
        if (idNum && idNum.length >= 3 && cleaned.includes(idNum)) {
          return p;
        }
      }

      // If target parcel exists and user scanned something, return target if requested
      if (targetParcel) {
        return targetParcel;
      }

      return null;
    },
    [targetParcel, allPendingParcels]
  );

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    isScanningActive.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
  }, []);

  // Handle scanned QR payload
  const handleQrDetected = useCallback(
    (codeData: string) => {
      if (!isScanningActive.current) return;
      isScanningActive.current = false;

      playBeep();
      setScannedCode(codeData);
      setScanSuccessAnim(true);

      const found = findParcelFromCode(codeData);
      if (found) {
        setMatchedParcel(found);
      } else if (targetParcel) {
        // Fallback to target parcel if one was actively opened
        setMatchedParcel(targetParcel);
      } else {
        setMatchedParcel(null);
      }
    },
    [findParcelFromCode, targetParcel]
  );

  // Continuous frame scanner loop
  const scanLoop = useCallback(() => {
    if (!isScanningActive.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Try decoding with jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && code.data.trim()) {
          handleQrDetected(code.data);
          return;
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(scanLoop);
  }, [handleQrDetected]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError('');
    setScannedCode(null);
    setScanSuccessAnim(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setHasCameraPermission(true);

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        setIsTorchSupported(Boolean(capabilities.torch));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        isScanningActive.current = true;
        animationFrameId.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setHasCameraPermission(false);
      setCameraError(err?.message || 'Camera permission denied or camera device is in use.');
      isScanningActive.current = false;
    }
  }, [facingMode, scanLoop, stopCamera]);

  // Toggle flashlight/torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch toggle not supported', e);
    }
  };

  // Toggle Camera Facing Mode (back / front)
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Image Upload / Snapshot Decoder
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          handleQrDetected(code.data);
        } else {
          // If decoding failed, fallback to manual code suggestion
          setCameraError('No QR code found in uploaded image. Please try another or enter ID manually.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Confirm Pickup Action
  const handleExecutePickup = (parcel: Parcel) => {
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    onConfirmPickup(parcel);
    stopCamera();
    onClose();
  };

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      if (targetParcel) {
        setMatchedParcel(targetParcel);
      } else {
        setMatchedParcel(null);
      }
      setManualCode('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera, targetParcel]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Scan & Confirm Merchant Pickup"
      subtitle="Scan the QR or barcode printed on the package label"
      maxWidth="md"
    >
      <div className="space-y-4 text-slate-900">
        {/* Active Target Ribbon */}
        {targetParcel && (
          <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-blue-700">Targeting Pickup</span>
              <div className="font-extrabold text-xs text-blue-950 font-mono flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                {targetParcel.id} • {targetParcel.merchantName}
              </div>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
              ৳{targetParcel.codAmount}
            </span>
          </div>
        )}

        {/* Live Camera Viewfinder Box */}
        <div className="relative w-full aspect-square max-h-72 sm:max-h-80 bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-xl flex items-center justify-center">
          {/* Real Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {/* Offscreen / Hidden Canvas for Frame Extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Optical Viewfinder Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            {/* Dark Mask around target zone */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border-2 border-dashed border-blue-400/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

              {/* Animated Laser Scanning Line */}
              {isScanningActive.current && (
                <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" />
              )}

              {/* Success Flash */}
              {scanSuccessAnim && (
                <div className="absolute inset-0 bg-emerald-500/30 rounded-2xl border-4 border-emerald-400 flex items-center justify-center animate-pulse">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 drop-shadow-md" />
                </div>
              )}
            </div>
          </div>

          {/* Top Controls Overlay: Flashlight, Switch Camera, Refresh */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Camera Active</span>
            </div>

            <div className="flex items-center gap-1.5">
              {isTorchSupported && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`p-2 rounded-full backdrop-blur-md text-white border transition ${
                    isTorchOn
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/30'
                      : 'bg-slate-900/80 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="Toggle Flashlight"
                >
                  {isTorchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full backdrop-blur-md border border-slate-700 transition"
                title="Switch Camera (Front/Back)"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => startCamera()}
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full backdrop-blur-md border border-slate-700 transition"
                title="Restart Scanner"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Camera Permission / Error Overlay */}
          {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center text-white space-y-3">
              <Camera className="w-10 h-10 text-rose-400" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Camera Unavailable</h4>
                <p className="text-xs text-slate-400 max-w-xs">{cameraError || 'Please allow camera permission in your browser.'}</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Retry Camera
                </button>
                <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer border border-slate-700 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* SCANNED PARCEL MATCH RESULT CARD */}
        {matchedParcel ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    ✓ Parcel Verified & Ready for Pickup
                  </span>
                  <div className="font-black text-sm text-slate-900 font-mono flex items-center gap-1.5">
                    {matchedParcel.id}
                    <span className="text-[10px] font-semibold text-slate-500">
                      ({matchedParcel.trackingId})
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">COD Value</span>
                <div className="text-base font-black text-emerald-700">৳{matchedParcel.codAmount}</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
              <div className="font-bold text-slate-900">{matchedParcel.merchantName} ({matchedParcel.merchantPhone})</div>
              <div className="flex items-start gap-1 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Pickup: {matchedParcel.pickupAddress}</span>
              </div>
              <div className="text-slate-700 text-[11px] pt-1">
                Destination: <b>{matchedParcel.customerName}</b> • {matchedParcel.area}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleExecutePickup(matchedParcel)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm Pickup & Move to My Bag
            </button>
          </div>
        ) : scannedCode ? (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Scanned Code: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">{scannedCode}</code></span>
            </div>
            <p className="text-[11px] text-amber-800">
              No matching unpicked parcel found with this ID in your current zone queue.
            </p>
            {targetParcel && (
              <button
                type="button"
                onClick={() => handleExecutePickup(targetParcel)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Confirm Pickup for {targetParcel.id} Anyway
              </button>
            )}
          </div>
        ) : null}

        {/* MANUAL INPUT OR 1-CLICK PICKUP CONTROLS */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Manual Code Lookup
            </span>
            <label className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Scan image file
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. FISH-9901 or TRK-DH-88219"
              className="flex-1 px-3 py-2 bg-slate-50 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase"
            />
            <button
              type="button"
              onClick={() => {
                if (!manualCode.trim()) return;
                const found = findParcelFromCode(manualCode);
                if (found) {
                  playBeep();
                  setMatchedParcel(found);
                } else if (targetParcel) {
                  setMatchedParcel(targetParcel);
                } else {
                  setScannedCode(manualCode);
                  setMatchedParcel(null);
                }
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
            >
              Verify
            </button>
          </div>

          {/* Quick confirmation button for target parcel */}
          {targetParcel && (
            <button
              type="button"
              onClick={() => handleExecutePickup(targetParcel)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              Skip Camera & Confirm {targetParcel.id} Directly
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
