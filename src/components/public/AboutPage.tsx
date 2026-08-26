import React from 'react';
import { Truck, ShieldCheck, Users, MapPin, Award, CheckCircle } from 'lucide-react';
import { Logo } from '../common/Logo';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          About FISHORA Express
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Empowering Bangladesh's Digital Commerce Economy
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          FISHORA Express was founded with a single mission: to provide Bangladeshi e-commerce merchants and customers with the fastest, most transparent, and most dependable delivery and COD management platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-3xl sm:text-4xl font-black text-blue-600">64</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">Districts Covered</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-3xl sm:text-4xl font-black text-emerald-600">99.4%</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">On-Time Success</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-3xl sm:text-4xl font-black text-purple-600">2,500+</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">Active Merchants</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-3xl sm:text-4xl font-black text-amber-600">24 Hours</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">Dhaka Delivery SLA</div>
        </div>
      </div>

      {/* Story & Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Core Values
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We understand that behind every parcel is a customer's trust and a merchant's hard-earned reputation. That's why FISHORA Express maintains strict SLAs, automated ledger transparency, and dedicated rider training.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Next-Day COD Settlement</h4>
                <p className="text-xs text-slate-500">Zero delay. We process bKash, Nagad, and Bank settlements on time every single working day.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Zero Hidden Surcharges</h4>
                <p className="text-xs text-slate-500">Fixed ৳120 inside Dhaka base charge. Clean calculations visible on your dashboard ledger.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Modern Digital Hub Infrastructure</h4>
                <p className="text-xs text-slate-500">Automated barcode scanning, SMS alerts, and public tracking keep you and your buyers in sync.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Hubs info */}
        <div className="rounded-3xl bg-slate-900 p-8 text-white space-y-6">
          <Logo variant="white" size="md" />
          <h3 className="text-xl font-bold">FISHORA Express Operations Network</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Headquartered in Niketon, Gulshan-1, Dhaka with sub-hubs in Mirpur, Uttara, Dhanmondi, Chittagong, Sylhet, and Rajshahi.
          </p>
          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Head Office: House 14, Road 7, Niketon, Gulshan-1, Dhaka-1212</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Trade License: TRD-DHK-889104 / Registered Courier Entity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
