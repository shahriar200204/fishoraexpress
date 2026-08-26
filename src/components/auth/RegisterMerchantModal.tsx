import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Logo } from '../common/Logo';
import { PaymentMethod } from '../../types';
import { BANGLADESH_DISTRICTS, DHAKA_AREAS } from '../../lib/constants';
import { StorageService } from '../../lib/storage';
import { UserCheck, AlertCircle, CheckCircle2, Building, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegisterMerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess?: (merchant: any) => void;
  onRegisteredSuccess?: (merchant: any) => void;
  onSwitchToLogin: () => void;
}

export const RegisterMerchantModal: React.FC<RegisterMerchantModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onRegisteredSuccess,
  onSwitchToLogin,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('Gulshan');
  const [customArea, setCustomArea] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [paymentNumberOrAccount, setPaymentNumberOrAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const selectedArea = district === 'Dhaka' ? area : (customArea || 'Sadar');

    setIsSubmitting(true);
    try {
      const merchant = StorageService.registerMerchant({
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: pickupAddress.trim(),
        district,
        area: selectedArea,
        pickupAddress: pickupAddress.trim(),
        paymentMethod,
        paymentNumberOrAccount: paymentNumberOrAccount.trim(),
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsSubmitting(false);
      if (onRegisterSuccess) {
        onRegisterSuccess(merchant);
      } else if (onRegisteredSuccess) {
        onRegisteredSuccess(merchant);
      }
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-6">
        {/* Header (Matching Wireframe 02) */}
        <div className="text-center space-y-2">
          <Logo size="md" className="justify-center" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Merchant Account
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Join FISHORA Express to automate doorstep delivery, track parcels, and receive daily COD payouts.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Business Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Business & Contact Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Store Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Trendy Fashion BD"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Mahbubur Rahman"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712-XXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="store@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pickup Location */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Default Parcel Pickup Location
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thana / Area *</label>
                {district === 'Dhaka' ? (
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {DHAKA_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    placeholder="e.g. Agrabad / Sadar"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Warehouse / Pickup Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <textarea
                  required
                  rows={2}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="House/Shop no, Road name, Block, Landmark for rider pickup"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: COD Payout Method */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              COD Settlement Payout Method
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payout Channel *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white capitalize font-semibold"
                >
                  <option value="bkash">bKash (Personal / Merchant)</option>
                  <option value="nagad">Nagad (Personal / Merchant)</option>
                  <option value="rocket">Rocket</option>
                  <option value="bank">Bank Transfer (BEFTN/NPSB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {paymentMethod === 'bank'
                    ? 'Bank Name, Branch, Account No, Routing No *'
                    : `${paymentMethod.toUpperCase()} Wallet Number *`}
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={paymentNumberOrAccount}
                    onChange={(e) => setPaymentNumberOrAccount(e.target.value)}
                    placeholder={
                      paymentMethod === 'bank'
                        ? 'City Bank, Gulshan, Acc: 1102938491, Routing: 2252718'
                        : '017XXXXXXXX'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Security Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            {isSubmitting ? 'Registering...' : 'Complete Merchant Registration'}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Already registered as a FISHORA merchant?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="font-bold text-blue-600 hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </Modal>
  );
};
