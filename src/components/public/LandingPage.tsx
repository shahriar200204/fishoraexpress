import React, { useState } from 'react';
import {
  Search,
  Truck,
  ShieldCheck,
  Clock,
  DollarSign,
  MapPin,
  Headphones,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Package,
  Zap,
  Building,
  UserCheck
} from 'lucide-react';
import { StorageService } from '../../lib/storage';

interface LandingPageProps {
  onTrack: (trackingQuery: string) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onTrack,
  onOpenRegister,
  onOpenLogin,
  onNavigate,
}) => {
  const [trackInput, setTrackInput] = useState('');
  const pricing = StorageService.getPricing();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      onTrack(trackInput.trim());
    }
  };

  const sampleTrackingIds = ['FX-100254', 'FX-100253', 'FX-100251'];

  return (
    <div className="space-y-16 pb-20">
      {/* ===== HERO SECTION (Matching Wireframe 01) ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white pt-8 sm:pt-14 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold tracking-wide">
                <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                Bangladesh's Trusted Delivery Network
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Fast Delivery.{' '}
                <span className="text-blue-600 block sm:inline">Trusted Service.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                FISHORA Express is your dedicated courier and logistics partner in Bangladesh. We ensure safe, fast, and reliable door-to-door delivery with <b>instant COD remittance</b> and real-time tracking.
              </p>

              {/* Tracking Bar Box */}
              <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200/80 max-w-xl mx-auto lg:mx-0">
                <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={trackInput}
                      onChange={(e) => setTrackInput(e.target.value)}
                      placeholder="Enter Tracking ID or Parcel ID (e.g. FX-100254)"
                      className="w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Track Parcel
                  </button>
                </form>

                {/* Quick test tracking pills */}
                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 justify-center sm:justify-start px-2">
                  <span className="font-semibold text-slate-400">Try demo ID:</span>
                  {sampleTrackingIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onTrack(id)}
                      className="text-blue-600 hover:underline font-mono font-semibold"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="px-7 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition shadow-md flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Register as Merchant
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition flex items-center gap-1.5"
                >
                  View Delivery Rates
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Graphic / Phone & Courier Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Visual Courier Card representation */}
                <div className="relative rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-700/50">
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black">F</div>
                      <span className="font-bold text-sm">FISHORA Express Mobile</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      LIVE RADAR
                    </span>
                  </div>

                  {/* Rider Status Simulation Card */}
                  <div className="my-6 space-y-4">
                    <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex items-center gap-3">
                      <div className="p-3 bg-blue-600/30 text-blue-400 rounded-xl">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-400">Active Delivery</div>
                        <div className="text-sm font-bold text-white">Rider Tanvir Hossain</div>
                        <div className="text-xs text-emerald-400 font-semibold mt-0.5">En route to Mirpur-10</div>
                      </div>
                      <span className="text-xs font-mono font-bold bg-slate-700 px-2 py-1 rounded text-slate-200">
                        15 mins
                      </span>
                    </div>

                    {/* Timeline mini preview */}
                    <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/60 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Pickup from <b>FISHORA Mart Banani</b></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Tejgaon Central Sorting Scan</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-blue-400 font-bold">
                        <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                        <span>Out for Delivery • COD ৳1,200</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats inside graphic */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-center border-t border-slate-700/60">
                    <div className="p-2 bg-slate-800/50 rounded-xl">
                      <div className="text-lg font-black text-white">৳{pricing.insideDhaka}</div>
                      <div className="text-[10px] text-slate-400">Inside Dhaka Rate</div>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded-xl">
                      <div className="text-lg font-black text-emerald-400">24 Hours</div>
                      <div className="text-[10px] text-slate-400">Guaranteed Doorstep</div>
                    </div>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold">COD Remittance</div>
                    <div className="text-sm font-extrabold text-slate-900">Next-Day Payout</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4 KEY PILLARS / CARDS (Matching Wireframe 01) ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Fast Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We ensure your parcel reaches your customer on time, every time across Dhaka & nationwide.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">On-Time Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Live status milestones updated from merchant warehouse pickup to final customer doorstep.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Real-time Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant notification updates via SMS and in-app feeds on every dispatch step.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Safe & Secure</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tamper-proof packaging bags, barcode verification, and zero loss guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE FISHORA EXPRESS? (Matching Wireframe 01) ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Choose FISHORA Express?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Built specifically for Bangladeshi e-commerce and Facebook F-commerce entrepreneurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Inside Dhaka ৳120 Only */}
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div>
              <div className="inline-block bg-white/20 px-2.5 py-1 rounded-lg text-xs font-bold mb-3 uppercase tracking-wider">
                Special Rate
              </div>
              <h3 className="text-xl font-bold mb-1">Inside Dhaka Delivery</h3>
              <p className="text-xs text-blue-100">Guaranteed 24-hour home delivery across all Dhaka areas.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 flex items-baseline justify-between">
              <span className="text-3xl font-black">৳{pricing.insideDhaka}</span>
              <span className="text-xs text-blue-100 font-semibold">Flat Rate / Kg</span>
            </div>
          </div>

          {/* Card 2: Cash on Delivery */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Cash on Delivery</h3>
              <p className="text-xs text-slate-500">
                100% secure cash collection with automated daily ledger entries and fast bKash/Bank disbursement.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-emerald-700">
              Next-Day Remittance Guarantee
            </div>
          </div>

          {/* Card 3: Wide Coverage */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Wide Coverage</h3>
              <p className="text-xs text-slate-500">
                Extensive network covering all 64 Bangladesh districts, 495+ upazilas and remote unions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-purple-700">
              64 Districts Doorstep Reach
            </div>
          </div>

          {/* Card 4: 24/7 Support */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">24/7 Support</h3>
              <p className="text-xs text-slate-500">
                Dedicated key account managers, live in-app support ticketing, and phone helpline.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-amber-700">
              Always With You
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS WORKFLOW ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/70">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            How FISHORA Express Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative">
            <span className="text-3xl font-black text-blue-100 absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Register Merchant</h4>
            <p className="text-xs text-slate-500">
              Sign up with your business name, mobile number, and preferred payout account (bKash/Nagad/Bank).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative">
            <span className="text-3xl font-black text-blue-100 absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Create Parcel</h4>
            <p className="text-xs text-slate-500">
              Enter customer address & COD amount. System auto-calculates delivery fees (৳{pricing.insideDhaka} Dhaka) and generates shipping barcodes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative">
            <span className="text-3xl font-black text-blue-100 absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Doorstep Pickup</h4>
            <p className="text-xs text-slate-500">
              Our rider arrives at your merchant warehouse to scan and collect parcels into the sorting network.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative">
            <span className="text-3xl font-black text-blue-100 absolute top-4 right-4">04</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-4">
              4
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Delivery & Cash Payout</h4>
            <p className="text-xs text-slate-500">
              Customer receives package, rider collects cash, and funds are automatically credited to your merchant balance.
            </p>
          </div>
        </div>
      </section>

      {/* ===== MERCHANT CTA BANNER ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Accelerate Your Online Business?
            </h3>
            <p className="text-sm text-blue-100 max-w-lg">
              Join 2,500+ merchants in Bangladesh who trust FISHORA Express for doorstep parcel deliveries and timely COD remittance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenRegister}
              className="px-6 py-3.5 rounded-xl bg-white text-blue-700 font-extrabold text-sm hover:bg-blue-50 transition shadow-md"
            >
              Open Merchant Account
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-6 py-3.5 rounded-xl bg-blue-800/80 text-white font-bold text-sm hover:bg-blue-900 transition border border-blue-400/30"
            >
              Merchant Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
