import React from 'react';
import { StorageService } from '../../lib/storage';
import { Check, Truck, Zap, Shield, DollarSign, ArrowRight, HelpCircle } from 'lucide-react';

interface PricingPageProps {
  onOpenRegister: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenRegister }) => {
  const pricing = StorageService.getPricing();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Transparent Delivery Charges
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Simple, Affordable Delivery Rates
        </h1>
        <p className="text-sm text-slate-500">
          No hidden fees. Next-day delivery across Dhaka for only ৳{pricing.insideDhaka} and nationwide delivery across all 64 districts.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Inside Dhaka (Featured) */}
        <div className="relative rounded-3xl bg-gradient-to-b from-blue-600 to-blue-700 p-8 text-white shadow-xl flex flex-col justify-between border-2 border-blue-500 ring-4 ring-blue-100">
          <div className="absolute -top-3.5 right-6 bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
            Most Popular
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">Inside Dhaka</h3>
            <p className="text-xs text-blue-100 mt-1">
              For all areas within Dhaka Metropolitan (Mirpur, Uttara, Dhanmondi, Gulshan, Banani, Motijheel, etc.).
            </p>

            <div className="my-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black">৳{pricing.insideDhaka}</span>
                <span className="text-sm text-blue-200 font-semibold">/ up to 1 kg</span>
              </div>
              <p className="text-xs text-blue-200 mt-1">+৳30 per additional kg</p>
            </div>

            <ul className="space-y-3 text-xs text-blue-50 border-t border-white/20 pt-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span><b>24 Hours</b> guaranteed doorstep delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Free doorstep pickup from merchant</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>100% Cash on Delivery collection</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Next-day automated COD settlement</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onOpenRegister}
            className="mt-8 w-full py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-sm rounded-xl transition shadow-md text-center"
          >
            Start Delivering Inside Dhaka
          </button>
        </div>

        {/* Sub-Dhaka / Dhaka Outskirts */}
        <div className="rounded-3xl bg-white p-8 text-slate-900 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">Dhaka Suburb / Outskirts</h3>
            <p className="text-xs text-slate-500 mt-1">
              Savar, Keraniganj, Gazipur Sadar, Tongi, Narayanganj, Ashulia, etc.
            </p>

            <div className="my-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black">৳{pricing.subDhaka}</span>
                <span className="text-sm text-slate-500 font-semibold">/ up to 1 kg</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">+৳35 per additional kg</p>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span><b>24–36 Hours</b> delivery timeframe</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Sub-hub express routing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Full real-time barcode tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Flexible payment disbursement</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onOpenRegister}
            className="mt-8 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition text-center"
          >
            Register Merchant
          </button>
        </div>

        {/* Outside Dhaka (Nationwide 64 Districts) */}
        <div className="rounded-3xl bg-white p-8 text-slate-900 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">Outside Dhaka</h3>
            <p className="text-xs text-slate-500 mt-1">
              Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Mymensingh, and all 64 districts.
            </p>

            <div className="my-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black">৳{pricing.outsideDhaka}</span>
                <span className="text-sm text-slate-500 font-semibold">/ up to 1 kg</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">+৳40 per additional kg</p>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><b>48–72 Hours</b> nationwide home delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Doorstep delivery to 495+ Upazilas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>COD collection with SMS OTP verification</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero return charge for failed pickups</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onOpenRegister}
            className="mt-8 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition text-center"
          >
            Start Nationwide Delivery
          </button>
        </div>
      </div>

      {/* Additional Fees Table */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 max-w-4xl mx-auto space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Value-Added Services & COD Terms</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block text-sm">Cash on Delivery (COD) Fee</span>
            <span className="text-slate-500 mt-1 block">{(pricing.codPercentageFee * 100).toFixed(1)}% of collected amount</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block text-sm">Settlement Payout Fee</span>
            <span className="text-slate-500 mt-1 block">৳0 (Free on all bKash / Nagad / Bank transfers)</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block text-sm">Return Charge (Inside Dhaka)</span>
            <span className="text-slate-500 mt-1 block">৳{pricing.returnChargeInsideDhaka} only if customer refuses delivery</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block text-sm">Return Charge (Outside Dhaka)</span>
            <span className="text-slate-500 mt-1 block">৳{pricing.returnChargeOutsideDhaka} only if customer cancels at doorstep</span>
          </div>
        </div>
      </div>
    </div>
  );
};
