import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Logo } from '../common/Logo';
import { UserRole } from '../../types';
import { StorageService } from '../../lib/storage';
import { LogIn, User, Bike, Shield, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, role: UserRole) => void;
  onSwitchToRegister: () => void;
  defaultRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
  defaultRole = 'merchant',
}) => {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setRole(defaultRole);
      setError('');
    }
  }, [isOpen, defaultRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = StorageService.authenticateUser(emailOrPhone.trim(), password.trim(), role);
    if (res.success && res.user) {
      onLoginSuccess(res.user, role);
      onClose();
    } else {
      setError(res.error || 'Invalid credentials. Please verify your email/phone and password.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Logo size="md" className="justify-center" />
          <h2 className="text-xl font-bold text-slate-900">Sign in to FISHORA Express</h2>
          <p className="text-xs text-slate-500">
            Select your portal and enter your registered credentials to access your dashboard.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setRole('merchant');
              setError('');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'merchant'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Merchant
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('rider');
              setError('');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'rider'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            Rider
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setError('');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {role === 'merchant' ? 'Email or Mobile Number' : role === 'rider' ? 'Rider Mobile Number / ID' : 'Admin Email'}
            </label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder={
                role === 'merchant'
                  ? 'e.g. yourstore@gmail.com or 017xxxxxxxx'
                  : role === 'rider'
                  ? 'e.g. 017xxxxxxxx or RDR-01'
                  : 'shahriar@gmail.com'
              }
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <span className="text-[11px] text-slate-400">Secure Account</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In to {role.charAt(0).toUpperCase() + role.slice(1)} Portal
          </button>
        </form>

        {/* Switch to Merchant Registration */}
        {role === 'merchant' && (
          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Don't have a merchant account yet?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="font-bold text-blue-600 hover:underline"
            >
              Register Here
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
