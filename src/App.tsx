import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './lib/storage';
import { Merchant, Rider } from './types';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/public/LandingPage';
import { PublicTrackPage } from './components/public/PublicTrackPage';
import { PricingPage } from './components/public/PricingPage';
import { ServicesPage } from './components/public/ServicesPage';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterMerchantModal } from './components/auth/RegisterMerchantModal';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { RiderApp } from './components/rider/RiderApp';
import { AdminDashboard } from './components/admin/AdminDashboard';

const SESSION_KEY = 'fishora_current_session_v1';

export default function App() {
  const [currentRole, setCurrentRole] = useState<'public' | 'merchant' | 'rider' | 'admin'>('public');
  const [publicPage, setPublicPage] = useState<'home' | 'track' | 'pricing' | 'services' | 'about' | 'contact'>('home');
  const [trackingQuery, setTrackingQuery] = useState<string>('');

  // Auth States
  const [currentMerchant, setCurrentMerchant] = useState<Merchant | null>(null);
  const [currentRider, setCurrentRider] = useState<Rider | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<{ email: string; role: 'admin'; name?: string } | null>(null);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'merchant' | 'rider' | 'admin'>('merchant');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Handle URL Path and direct links (e.g. /admin, /merchant, /rider, /track, /pricing, etc.)
  const handleRouteFromUrl = useCallback(() => {
    const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
    const hash = window.location.hash.toLowerCase().replace(/^#+/, '');
    const route = path || hash;

    if (route === 'admin' || route.startsWith('admin/')) {
      // Check if logged in, otherwise show Admin login modal
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.role === 'admin' && session.user) {
            setCurrentAdmin(session.user);
            setCurrentRole('admin');
            return;
          }
        } catch {
          // ignore
        }
      }
      setLoginRole('admin');
      setIsLoginModalOpen(true);
      setCurrentRole('public');
    } else if (route === 'merchant' || route.startsWith('merchant/')) {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.role === 'merchant' && session.user) {
            setCurrentMerchant(session.user);
            setCurrentRole('merchant');
            return;
          }
        } catch {
          // ignore
        }
      }
      setLoginRole('merchant');
      setIsLoginModalOpen(true);
      setCurrentRole('public');
    } else if (route === 'rider' || route.startsWith('rider/')) {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.role === 'rider' && session.user) {
            setCurrentRider(session.user);
            setCurrentRole('rider');
            return;
          }
        } catch {
          // ignore
        }
      }
      setLoginRole('rider');
      setIsLoginModalOpen(true);
      setCurrentRole('public');
    } else if (route === 'track') {
      const params = new URLSearchParams(window.location.search);
      const trk = params.get('id') || params.get('tracking');
      if (trk) setTrackingQuery(trk);
      setPublicPage('track');
      setCurrentRole('public');
    } else if (route === 'pricing') {
      setPublicPage('pricing');
      setCurrentRole('public');
    } else if (route === 'services') {
      setPublicPage('services');
      setCurrentRole('public');
    } else if (route === 'about') {
      setPublicPage('about');
      setCurrentRole('public');
    } else if (route === 'contact') {
      setPublicPage('contact');
      setCurrentRole('public');
    } else if (route === 'login') {
      setIsLoginModalOpen(true);
    } else if (route === 'register') {
      setIsRegisterModalOpen(true);
    }
  }, []);

  // Initialize storage seeds, restore session & handle initial route
  useEffect(() => {
    StorageService.init();

    // 1. Restore persistent login session if available
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const session = JSON.parse(saved);
        if (session.role === 'merchant' && session.user) {
          setCurrentMerchant(session.user);
          setCurrentRole('merchant');
        } else if (session.role === 'rider' && session.user) {
          setCurrentRider(session.user);
          setCurrentRole('rider');
        } else if (session.role === 'admin' && session.user) {
          setCurrentAdmin(session.user);
          setCurrentRole('admin');
        }
      }
    } catch {
      // ignore
    }

    // 2. Handle URL Routing (/admin, /merchant, /rider, etc.)
    handleRouteFromUrl();

    // Listen to browser popstate (back/forward or URL change)
    window.addEventListener('popstate', handleRouteFromUrl);
    return () => window.removeEventListener('popstate', handleRouteFromUrl);
  }, [handleRouteFromUrl]);

  const updateUrlPath = (path: string) => {
    try {
      window.history.pushState(null, '', `/${path}`);
    } catch {
      // fallback if in restricted iframe
    }
  };

  const openLoginForRole = (role: 'merchant' | 'rider' | 'admin' = 'merchant') => {
    setLoginRole(role);
    setIsLoginModalOpen(true);
    updateUrlPath(role);
  };

  const handleLoginSuccess = (user: any, role: 'merchant' | 'rider' | 'admin') => {
    // Persist login session
    localStorage.setItem(SESSION_KEY, JSON.stringify({ role, user }));

    if (role === 'merchant') {
      setCurrentMerchant(user);
      setCurrentRole('merchant');
      updateUrlPath('merchant');
    } else if (role === 'rider') {
      setCurrentRider(user);
      setCurrentRole('rider');
      updateUrlPath('rider');
    } else if (role === 'admin') {
      setCurrentAdmin(user);
      setCurrentRole('admin');
      updateUrlPath('admin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentRole('public');
    setCurrentMerchant(null);
    setCurrentRider(null);
    setCurrentAdmin(null);
    updateUrlPath('');
  };

  const handleTrackParcel = (id: string) => {
    setTrackingQuery(id);
    setPublicPage('track');
    setCurrentRole('public');
    updateUrlPath(`track?id=${encodeURIComponent(id)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Universal Navigation Bar (Only on Public Website) */}
      {currentRole === 'public' && (
        <Navbar
          currentPage={publicPage}
          onNavigatePage={(page) => {
            setPublicPage(page);
            setCurrentRole('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenLogin={() => openLoginForRole('merchant')}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
        />
      )}

      {/* Main View Router based on Role and Page */}
      <main className="flex-1">
        {/* PUBLIC VIEWS */}
        {currentRole === 'public' && (
          <>
            {publicPage === 'home' && (
              <LandingPage
                onOpenRegister={() => setIsRegisterModalOpen(true)}
                onOpenLogin={() => openLoginForRole('merchant')}
                onTrackParcel={handleTrackParcel}
                onNavigatePage={(p) => {
                  setPublicPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {publicPage === 'track' && (
              <PublicTrackPage initialTrackingId={trackingQuery} />
            )}

            {publicPage === 'pricing' && (
              <PricingPage onOpenRegister={() => setIsRegisterModalOpen(true)} />
            )}

            {publicPage === 'services' && (
              <ServicesPage onOpenRegister={() => setIsRegisterModalOpen(true)} />
            )}

            {publicPage === 'about' && (
              <AboutPage onOpenRegister={() => setIsRegisterModalOpen(true)} />
            )}

            {publicPage === 'contact' && (
              <ContactPage />
            )}
          </>
        )}

        {/* 1. MERCHANT STANDALONE APP */}
        {currentRole === 'merchant' && currentMerchant && (
          <MerchantDashboard
            merchant={currentMerchant}
            onLogout={handleLogout}
            onTrackParcel={handleTrackParcel}
          />
        )}

        {/* 2. RIDER COURIER MOBILE APP */}
        {currentRole === 'rider' && currentRider && (
          <RiderApp
            rider={currentRider}
            onLogout={handleLogout}
            onTrackParcel={handleTrackParcel}
          />
        )}

        {/* 3. ADMIN MASTER CONTROL APP */}
        {currentRole === 'admin' && (
          <AdminDashboard
            adminUser={currentAdmin}
            onLogout={handleLogout}
            onTrackParcel={handleTrackParcel}
          />
        )}
      </main>

      {/* Footer (Render on public pages) */}
      {currentRole === 'public' && (
        <Footer
          onNavigate={(p) => {
            if (p === 'merchant-app') {
              openLoginForRole('merchant');
            } else if (p === 'rider-app') {
              openLoginForRole('rider');
            } else if (p === 'admin-app') {
              openLoginForRole('admin');
            } else {
              setPublicPage(p as any);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={loginRole}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterMerchantModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={(newMerchant) => {
          setCurrentMerchant(newMerchant);
          setCurrentRole('merchant');
        }}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          openLoginForRole('merchant');
        }}
      />
    </div>
  );
}
