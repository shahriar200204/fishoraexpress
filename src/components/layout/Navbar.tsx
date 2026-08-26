import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Menu, X, Search, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigatePage: (page: 'home' | 'track' | 'pricing' | 'services' | 'about' | 'contact') => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigatePage,
  onOpenLogin,
  onOpenRegister,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: Array<{ id: 'home' | 'track' | 'pricing' | 'services' | 'about' | 'contact'; label: string; highlight?: boolean }> = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'track', label: 'Track Parcel', highlight: true },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 text-center font-medium flex items-center justify-between sm:justify-center gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
            Dhaka Delivery Special
          </span>
          <span>Inside Dhaka flat delivery charge only <b>৳120</b>! Next-day guaranteed.</span>
        </div>
        <div className="hidden lg:flex items-center gap-4 text-slate-300 text-xs ml-4">
          <span>Hotline: <b>+880 9612-445566</b></span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigatePage('home')}
            className="cursor-pointer"
          >
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigatePage(link.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentPage === link.id
                    ? 'text-blue-600 bg-blue-50/70 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${link.highlight ? 'text-blue-600' : ''}`}
              >
                {link.highlight && <Search className="w-3.5 h-3.5 inline mr-1 text-blue-500" />}
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>

            <button
              type="button"
              onClick={onOpenRegister}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigatePage('track')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
              aria-label="Track Parcel"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-4">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  onNavigatePage(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  currentPage === link.id
                    ? 'text-blue-600 bg-blue-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenLogin();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 text-center text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenRegister();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 text-center text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
