import React, { useState, useEffect } from 'react';
import { Search, Package, MapPin, Clock, CheckCircle2, User, Phone, AlertCircle, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
import { Parcel } from '../../types';
import { StorageService } from '../../lib/storage';
import { StatusBadge } from '../common/Badge';

interface PublicTrackPageProps {
  initialQuery?: string;
  onOpenRegister?: () => void;
}

export const PublicTrackPage: React.FC<PublicTrackPageProps> = ({ initialQuery = '', onOpenRegister }) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchedParcel, setSearchedParcel] = useState<Parcel | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const executeSearch = (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) {
      setErrorMsg('Please enter a valid Tracking ID or Parcel ID');
      setSearchedParcel(null);
      setHasSearched(true);
      return;
    }
    setErrorMsg('');
    const found = StorageService.getParcelByIdOrTracking(clean);
    setSearchedParcel(found || null);
    setHasSearched(true);
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const sampleIds = ['FX-100254', 'FX-100253', 'FX-100251', 'FX-100252'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header (Matching Wireframe 08) */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-1">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Your Parcel
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Enter your FISHORA Express Tracking ID or Parcel ID to check real-time status and delivery timeline.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-200/80">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Tracking ID / Parcel ID (e.g. FX-100254)"
              className="w-full pl-12 pr-4 py-3.5 text-base font-semibold text-slate-900 placeholder:text-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-xl transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Track
          </button>
        </form>

        {/* Quick sample pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="font-semibold text-slate-400">Click to demo track:</span>
          {sampleIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setQuery(id);
                executeSearch(id);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-mono font-bold rounded-lg transition border border-slate-200"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Search Result */}
      {hasSearched && (
        <>
          {searchedParcel ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-3">
              {/* Parcel Header & Status (Matching Wireframe 08) */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Tracking Information</span>
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Tracking ID: {searchedParcel.id}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    System Ref: {searchedParcel.trackingId}
                  </div>
                </div>

                <div className="sm:text-right">
                  <StatusBadge status={searchedParcel.status} size="lg" />
                  <div className="text-xs text-slate-400 mt-2">
                    Estimated Delivery: <b className="text-white">{searchedParcel.estimatedDeliveryDate}</b>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                  <span className="text-xs text-slate-400 font-bold uppercase">Receiver</span>
                  <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-500" />
                    {searchedParcel.customerName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {searchedParcel.customerPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1-****-$2')}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                  <span className="text-xs text-slate-400 font-bold uppercase">Delivery Area</span>
                  <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    {searchedParcel.area}, {searchedParcel.district}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 capitalize">
                    {searchedParcel.deliveryType.replace('_', ' ')}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                  <span className="text-xs text-slate-400 font-bold uppercase">COD Amount</span>
                  <div className="text-xl font-black text-emerald-700 mt-0.5 flex items-center gap-1">
                    ৳{searchedParcel.codAmount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {searchedParcel.isCodCollected ? 'Collected' : 'Payable on Delivery'}
                  </div>
                </div>
              </div>

              {/* Status Timeline (Matching Wireframe 08) */}
              <div className="p-6 sm:p-8 space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Delivery Timeline & History
                </h3>

                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {searchedParcel.trackingHistory.map((step, idx) => {
                    const isLatest = idx === searchedParcel.trackingHistory.length - 1;
                    return (
                      <div key={step.id || idx} className="relative group">
                        {/* Timeline Bullet */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${
                            isLatest
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {isLatest ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Event Content */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="text-sm font-bold text-slate-900">
                              {step.title}
                            </h4>
                            <span className="text-xs font-semibold text-slate-400">
                              {new Date(step.timestamp).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {step.description}
                          </p>
                          {step.location && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{step.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safe Delivery Guarantee Banner */}
              <div className="p-4 bg-emerald-50/70 border-t border-emerald-100 flex items-center justify-between px-6 text-xs text-emerald-800 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Insured by FISHORA Express Guarantee • 100% Doorstep verification</span>
                </div>
                <span className="hidden sm:inline text-[11px] text-emerald-600">Hotline: +880 9612-445566</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Parcel Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                We could not find any parcel matching <b>"{query}"</b>. Please verify the Tracking ID or contact the merchant.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
