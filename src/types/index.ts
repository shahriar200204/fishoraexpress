export type UserRole = 'public' | 'merchant' | 'admin' | 'rider';

export type MerchantStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export type ParcelStatus = 
  | 'pending'
  | 'confirmed'
  | 'pickup_assigned'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export type SettlementStatus = 'pending' | 'processing' | 'paid' | 'rejected';

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type TicketCategory =
  | 'delivery_delay'
  | 'pickup_issue'
  | 'cod_dispute'
  | 'damaged_parcel'
  | 'address_change'
  | 'delivery_issue'
  | 'payment_issue'
  | 'return_issue'
  | 'complaint'
  | 'other';

export type ParcelType = 'document' | 'fragile' | 'regular' | 'liquid' | 'electronics' | 'clothing';

export type DeliveryType = 'inside_dhaka' | 'outside_dhaka' | 'express_dhaka' | 'sub_dhaka';

export interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  pickupAddress?: string;
  district: string;
  area: string;
  status: MerchantStatus;
  paymentMethod: PaymentMethod;
  paymentNumberOrAccount: string;
  bankName?: string;
  bankBranch?: string;
  routingNumber?: string;
  nidOrTradeLicense?: string;
  currentBalance: number;
  customInsideDhakaCharge?: number;
  customOutsideDhakaCharge?: number;
  codPercentageFee?: number;
  createdAt: string;
  approvedAt?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  assignedArea: string;
  zone: string;
  status: 'active' | 'inactive';
  photoUrl?: string;
  vehicleType?: string;
  totalDelivered: number;
  totalCollectedCOD: number;
  createdAt: string;
  currentLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    updatedAt: string;
    address?: string;
  };
  isLiveTrackingActive?: boolean;
}

export interface TrackingHistoryItem {
  id: string;
  status: ParcelStatus;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  updatedBy: string;
  photoUrl?: string;
  signatureUrl?: string;
}

export interface Parcel {
  id: string; // e.g. FX-100254
  trackingId: string; // e.g. FX-TRK-98721
  merchantId: string;
  merchantName: string;
  merchantPhone: string;
  pickupAddress: string;
  
  // Receiver
  customerName: string;
  customerPhone: string;
  district: string;
  area: string;
  fullAddress: string;
  deliveryNote?: string;
  
  // Package Info
  productName: string;
  quantity: number;
  weight: number; // in kg
  parcelType: ParcelType;
  deliveryType: DeliveryType;
  specialInstructions?: string;
  
  // Security & Proof of Delivery (POD)
  deliverySecurityCode?: string; // e.g. "8492" random verification code
  deliveryProofPhotoUrl?: string; // Captured photo of package delivery
  deliverySignatureUrl?: string; // Digital signature
  deliveryLocationCoords?: { lat: number; lng: number };
  
  // Pricing & Financials (in BDT ৳)
  codAmount: number;
  deliveryCharge: number;
  codCharge: number;
  merchantPayable: number;
  isCodCollected: boolean;
  settlementStatus: 'unsettled' | 'pending' | 'settled';
  settlementId?: string;
  
  // Assignment & Status
  status: ParcelStatus;
  assignedRiderId?: string;
  assignedRiderName?: string;
  assignedRiderPhone?: string;
  
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate: string;
  deliveredAt?: string;
  
  trackingHistory: TrackingHistoryItem[];
}

export interface LedgerTransaction {
  id: string;
  merchantId: string;
  merchantName: string;
  parcelId?: string;
  type: 'CREDIT' | 'DEBIT' | 'cod_credit' | 'delivery_fee_debit' | 'cod_fee_debit' | 'settlement_payout' | 'adjustment';
  amount: number;
  description: string;
  date: string;
  balanceAfter: number;
}

export interface SettlementRequest {
  id: string; // e.g. STL-8901
  merchantId: string;
  merchantName: string;
  merchantPhone: string;
  amount: number;
  method: PaymentMethod;
  accountDetails: string;
  transactionReference?: string;
  status: SettlementStatus;
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
  parcelIds?: string[];
}

export interface LocationItem {
  id: string;
  division: string;
  district: string;
  area: string; // Thana / Neighborhood
  isInsideDhaka: boolean;
  deliveryCharge: number;
  estimatedHours: number;
  isActive: boolean;
}

export interface DeliveryPricingSettings {
  insideDhaka: number; // default 120
  outsideDhaka: number; // default 180
  expressDhaka: number; // default 180
  subDhaka: number; // default 150
  codPercentageFee: number; // default 1% (0.01)
  returnChargeInsideDhaka: number; // default 60
  returnChargeOutsideDhaka: number; // default 90
  additionalKgChargeInsideDhaka?: number; // default 30
  additionalKgChargeOutsideDhaka?: number; // default 40
  freeDeliveryThreshold?: number;
}

export type BusinessPricingConfig = DeliveryPricingSettings;

export interface SupportTicket {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantPhone?: string;
  subject: string;
  category: TicketCategory;
  relatedParcelId?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    senderId?: string;
    senderRole: 'merchant' | 'admin';
    senderName: string;
    message: string;
    timestamp: string;
  }[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetType: 'merchant' | 'parcel' | 'settlement' | 'pricing' | 'location' | 'rider' | 'settings';
  targetId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  recipientId: string; // merchantId or 'admin' or 'rider_id' or 'all'
  title: string;
  message: string;
  link?: string;
  type: 'order' | 'settlement' | 'merchant' | 'system' | 'rider';
  isRead: boolean;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  hotline: string;
  supportEmail: string;
  headOfficeAddress: string;
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  enableSmsNotifications: boolean;
  enableEmailNotifications: boolean;
  systemStatus: 'online' | 'maintenance';
}
