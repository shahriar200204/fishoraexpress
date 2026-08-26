import React from 'react';
import { ParcelStatus, MerchantStatus, SettlementStatus, TicketStatus } from '../../types';

interface BadgeProps {
  status: ParcelStatus | MerchantStatus | SettlementStatus | TicketStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  const getStyleAndLabel = () => {
    switch (status) {
      // Parcel Statuses
      case 'pending':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' };
      case 'confirmed':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Confirmed' };
      case 'pickup_assigned':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Pickup Assigned' };
      case 'picked_up':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Picked Up' };
      case 'in_transit':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'In Transit' };
      case 'out_for_delivery':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Out for Delivery' };
      case 'delivered':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Delivered' };
      case 'cancelled':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cancelled' };
      case 'return_requested':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Return Req.' };
      case 'returned':
        return { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Returned' };

      // Merchant Statuses
      case 'active':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active' };
      case 'suspended':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Suspended' };
      case 'rejected':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Rejected' };

      // Settlement Statuses
      case 'processing':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Processing' };
      case 'paid':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Paid / Disbursed' };

      // Ticket Statuses
      case 'open':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Open' };
      case 'in_progress':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'In Progress' };
      case 'resolved':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Resolved' };
      case 'closed':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Closed' };

      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', label: String(status) };
    }
  };

  const { bg, label } = getStyleAndLabel();

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded-full border whitespace-nowrap ${bg} ${sizeClasses[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80 shrink-0" />
      {label}
    </span>
  );
};
