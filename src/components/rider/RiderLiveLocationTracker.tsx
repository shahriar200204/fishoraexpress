import React, { useState, useEffect, useRef } from 'react';
import { Rider, Parcel } from '../../types';
import { StorageService } from '../../lib/storage';
import {
  Navigation,
  MapPin,
  Radio,
  Compass,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface RiderLiveLocationTrackerProps {
  rider: Rider;
  activeParcels?: Parcel[];
}

export const RiderLiveLocationTracker: React.FC<RiderLiveLocationTrackerProps> = ({
  rider,
  activeParcels = [],
}) => {
  // Default to central Dhaka coords (Banani / Gulshan / Tejgaon corridor)
  const defaultDhakaCoords = { lat: 23.7937, lng: 90.4066 };

  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    updatedAt: string;
  }>(() => {
    return (
      rider.currentLocation || {
        ...defaultDhakaCoords,
        accuracy: 12,
        speed: 22.5,
        heading: 45,
        updatedAt: new Date().toISOString(),
      }
    );
  });

  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [gpsStatus, setGpsStatus] = useState<'connected' | 'simulated' | 'searching'>('connected');
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState<string>('Just now');
  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);

  // Broadcast location update to StorageService
  const broadcastLocation = (newCoords: { lat: number; lng: number; accuracy?: number; speed?: number; heading?: number }) => {
    const updated = StorageService.updateRiderLocation(rider.id, newCoords);
    setCoords({
      ...newCoords,
      updatedAt: new Date().toISOString(),
    });
    setLastBroadcastTime(new Date().toLocaleTimeString());
  };

  // Real HTML5 Geolocation Watcher
  useEffect(() => {
    if (isLiveActive && 'geolocation' in navigator) {
      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setGpsStatus('connected');
            broadcastLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy),
              speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 24, // m/s to km/h
              heading: pos.coords.heading || 90,
            });
          },
          (err) => {
            console.warn('Geolocation access fallback to simulated GPS:', err.message);
            setGpsStatus('simulated');
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      } catch (e) {
        setGpsStatus('simulated');
      }
    } else {
      setGpsStatus('simulated');
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isLiveActive, rider.id]);

  // Simulation movement loop (allows testing rider moving across Dhaka)
  useEffect(() => {
    if (isSimulatingMovement) {
      simIntervalRef.current = setInterval(() => {
        setCoords((prev) => {
          // Slight random walk in Dhaka area
          const dLat = (Math.random() - 0.48) * 0.0008;
          const dLng = (Math.random() - 0.48) * 0.0008;
          const newLat = prev.lat + dLat;
          const newLng = prev.lng + dLng;
          const newSpeed = Math.round(15 + Math.random() * 20);
          const newHeading = Math.round((prev.heading || 0) + (Math.random() - 0.5) * 20) % 360;

          broadcastLocation({
            lat: newLat,
            lng: newLng,
            accuracy: 8,
            speed: newSpeed,
            heading: newHeading,
          });

          return {
            lat: newLat,
            lng: newLng,
            accuracy: 8,
            speed: newSpeed,
            heading: newHeading,
            updatedAt: new Date().toISOString(),
          };
        });
      }, 4000);
    } else {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isSimulatingMovement]);

  // Open in Google Maps for turn-by-turn navigation
  const openExternalNavigation = (destAddress?: string) => {
    if (destAddress) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${encodeURIComponent(
          destAddress + ', Dhaka, Bangladesh'
        )}`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`,
        '_blank'
      );
    }
  };

  // OpenStreetMap embed URL for free live map
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.02}%2C${
    coords.lat - 0.015
  }%2C${coords.lng + 0.02}%2C${coords.lat + 0.015}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Header with GPS status indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Radio className="w-5 h-5 animate-pulse text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900">Rider Live GPS Tracking</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  gpsStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {gpsStatus === 'connected' ? '⚡ LIVE GPS' : '🛰️ AUTO TRACKER'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Broadcasting live coordinates to Admin & Customer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isSimulatingMovement
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle simulated delivery route movement"
          >
            {isSimulatingMovement ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulatingMovement ? 'Simulating Drive' : 'Test Drive'}
          </button>
        </div>
      </div>

      {/* Live Map Frame (Free OpenStreetMap Leaflet Engine) */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-56 sm:h-64 shadow-inner">
        <iframe
          title="Rider Realtime GPS Map"
          src={osmEmbedUrl}
          className="w-full h-full border-0 pointer-events-auto"
          loading="lazy"
        />

        {/* Live Rider Overlay Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg border border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{rider.name} • Active in Dhaka</span>
        </div>

        {/* External Maps Navigation Button */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={() => openExternalNavigation()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Google Maps
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-blue-600" /> Current Speed
          </span>
          <div className="font-black text-sm text-slate-800 mt-0.5">{coords.speed || 24} km/h</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-600" /> Heading
          </span>
          <div className="font-black text-sm text-slate-800 mt-0.5">{coords.heading || 45}° North-East</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-600" /> Coordinates
          </span>
          <div className="font-mono font-bold text-[11px] text-slate-800 truncate mt-0.5">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> GPS Accuracy
          </span>
          <div className="font-black text-sm text-emerald-700 mt-0.5">±{coords.accuracy || 10} meters</div>
        </div>
      </div>
    </div>
  );
};
