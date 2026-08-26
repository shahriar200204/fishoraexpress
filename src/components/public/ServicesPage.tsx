import React from 'react';
import { Truck, ShieldCheck, DollarSign, Package, RotateCcw, Clock, Warehouse, Headphones } from 'lucide-react';

interface ServicesPageProps {
  onOpenRegister: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenRegister }) => {
  const services = [
    {
      icon: Truck,
      title: 'Same-Day & Next-Day Delivery (Dhaka)',
      desc: 'Rapid 24-hour parcel delivery across all major Dhaka neighborhoods including Mirpur, Uttara, Dhanmondi, Gulshan, Banani, and Old Dhaka.',
      badge: '৳120 Flat Base',
      color: 'blue'
    },
    {
      icon: DollarSign,
      title: '100% Cash on Delivery (COD)',
      desc: 'Secure cash collection at buyer doorstep with instant digital reconciliation and same-week disbursement directly to your bKash or Bank account.',
      badge: 'Fast Settlement',
      color: 'emerald'
    },
    {
      icon: Package,
      title: 'Nationwide 64 Districts Delivery',
      desc: 'Connect your business to customers in Chittagong, Sylhet, Khulna, Rajshahi, Barisal, Rangpur, Mymensingh, and remote upazilas.',
      badge: 'All Bangladesh',
      color: 'purple'
    },
    {
      icon: Warehouse,
      title: 'Merchant Free Doorstep Pickup',
      desc: 'Daily scheduled pickup directly from your warehouse, shop, or home address in Dhaka with barcode tagging.',
      badge: 'Free Daily Pickup',
      color: 'amber'
    },
    {
      icon: RotateCcw,
      title: 'Smart Reverse Logistics & Returns',
      desc: 'Automated return tracking with customer OTP verification and direct return delivery back to merchant warehouse.',
      badge: 'Safe Returns',
      color: 'rose'
    },
    {
      icon: Headphones,
      title: 'Dedicated Merchant Account Management',
      desc: 'Priority support team to assist with delivery escalations, address corrections, and urgent dispatch requests.',
      badge: '24/7 Support',
      color: 'indigo'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Comprehensive Logistics Solutions
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Services Tailored for Modern E-commerce
        </h1>
        <p className="text-sm text-slate-500">
          Everything your online store needs to deliver happiness, collect cash securely, and grow across Bangladesh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {s.badge}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Book this service →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
