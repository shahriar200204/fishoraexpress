import React from 'react';
import { Logo } from '../common/Logo';
import { MapPin, Phone, Mail, Clock, ShieldCheck, DollarSign, User, Bike, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand info */}
          <div className="lg:col-span-1 space-y-4">
            <Logo variant="white" size="lg" />
            <p className="text-xs text-slate-400 leading-relaxed">
              FISHORA Express is Bangladesh's next-generation courier and logistics ecosystem. Empowering online merchants with reliable doorstep delivery, next-day COD settlements, and live tracking across Dhaka and all 64 districts.
            </p>
            <div className="flex flex-col gap-1.5 pt-1 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Guaranteed Safety
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Fast COD Payouts
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition">Home</button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition">About FISHORA</button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition">Delivery Services</button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition">Pricing & Rates</button>
              </li>
              <li>
                <button onClick={() => onNavigate('track')} className="hover:text-white transition">Live Tracking</button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition">Contact Us</button>
              </li>
            </ul>
          </div>

          {/* Col 3: Standalone Apps & Portals */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">FISHORA Apps</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('merchant-app')}
                  className="hover:text-white transition flex items-center gap-1.5 text-slate-300 font-medium"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  Merchant Portal App
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('rider-app')}
                  className="hover:text-white transition flex items-center gap-1.5 text-slate-300 font-medium"
                >
                  <Bike className="w-3.5 h-3.5 text-emerald-400" />
                  Rider Courier App
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin-app')}
                  className="hover:text-white transition flex items-center gap-1.5 text-slate-300 font-medium"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Admin Master Control
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Coverage Hubs */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Bangladesh Hubs</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span><b>Dhaka Central:</b> Niketon</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span><b>Dhaka North:</b> Uttara</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span><b>Chittagong:</b> Agrabad</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span><b>Sylhet:</b> Zindabazar</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Contact & Support</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Niketon, Gulshan-1, Dhaka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-white font-bold">+880 9612-445566</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>support@fishoraexpress.com.bd</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Support: 24/7 Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <b>FISHORA Express</b>. All rights reserved. Fast Delivery. Trusted Service.
          </div>
          <div className="flex gap-6">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); }} className="hover:text-slate-300">Privacy Policy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); }} className="hover:text-slate-300">Terms & Conditions</a>
            <a href="#cod" onClick={(e) => { e.preventDefault(); }} className="hover:text-slate-300">COD Settlement Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
