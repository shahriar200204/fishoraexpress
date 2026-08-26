import { Parcel, SettlementRequest, LedgerTransaction, Merchant, Rider } from '../types';

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportParcelsToCSV(parcels: Parcel[], filenamePrefix = 'fishora_parcels') {
  const headers = [
    'Parcel ID',
    'Tracking ID',
    'Date',
    'Merchant Name',
    'Customer Name',
    'Customer Phone',
    'District',
    'Area',
    'Full Address',
    'Product Name',
    'Quantity',
    'Weight (kg)',
    'Parcel Type',
    'Delivery Type',
    'Status',
    'COD Amount (BDT)',
    'Delivery Charge (BDT)',
    'COD Charge (BDT)',
    'Merchant Payable (BDT)',
    'COD Collected',
    'Settlement Status',
    'Assigned Rider',
  ];

  const rows = parcels.map((p) => [
    `"${p.id}"`,
    `"${p.trackingId}"`,
    `"${new Date(p.createdAt).toLocaleDateString()}"`,
    `"${p.merchantName.replace(/"/g, '""')}"`,
    `"${p.customerName.replace(/"/g, '""')}"`,
    `"${p.customerPhone}"`,
    `"${p.district}"`,
    `"${p.area.replace(/"/g, '""')}"`,
    `"${p.fullAddress.replace(/"/g, '""')}"`,
    `"${p.productName.replace(/"/g, '""')}"`,
    p.quantity,
    p.weight,
    `"${p.parcelType}"`,
    `"${p.deliveryType}"`,
    `"${p.status}"`,
    p.codAmount,
    p.deliveryCharge,
    p.codCharge,
    p.merchantPayable,
    p.isCodCollected ? 'YES' : 'NO',
    `"${p.settlementStatus}"`,
    `"${p.assignedRiderName || 'Unassigned'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
}

export function exportSettlementsToCSV(settlements: SettlementRequest[], filenamePrefix = 'fishora_settlements') {
  const headers = [
    'Settlement ID',
    'Date',
    'Merchant ID',
    'Merchant Name',
    'Merchant Phone',
    'Amount (BDT)',
    'Payment Method',
    'Account Details',
    'Status',
    'Transaction Reference',
    'Admin Note',
  ];

  const rows = settlements.map((s) => [
    `"${s.id}"`,
    `"${new Date(s.createdAt).toLocaleDateString()}"`,
    `"${s.merchantId}"`,
    `"${s.merchantName.replace(/"/g, '""')}"`,
    `"${s.merchantPhone}"`,
    s.amount,
    `"${s.method.toUpperCase()}"`,
    `"${s.accountDetails.replace(/"/g, '""')}"`,
    `"${s.status.toUpperCase()}"`,
    `"${s.transactionReference || ''}"`,
    `"${(s.adminNote || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
}

export function exportLedgerToCSV(ledger: LedgerTransaction[], filenamePrefix = 'fishora_ledger') {
  const headers = ['Transaction ID', 'Date', 'Merchant Name', 'Type', 'Amount (BDT)', 'Description', 'Balance After (BDT)'];

  const rows = ledger.map((l) => [
    `"${l.id}"`,
    `"${new Date(l.date).toLocaleString()}"`,
    `"${l.merchantName}"`,
    `"${l.type}"`,
    l.amount,
    `"${l.description.replace(/"/g, '""')}"`,
    l.balanceAfter,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
}

export function exportMerchantsToCSV(merchants: Merchant[]) {
  const headers = ['Merchant ID', 'Business Name', 'Owner Name', 'Phone', 'Email', 'District', 'Area', 'Status', 'Payment Method', 'Payment Account', 'Joined Date'];
  const rows = merchants.map((m) => [
    `"${m.id}"`,
    `"${m.businessName}"`,
    `"${m.ownerName}"`,
    `"${m.phone}"`,
    `"${m.email}"`,
    `"${m.district}"`,
    `"${m.area}"`,
    `"${m.status.toUpperCase()}"`,
    `"${m.paymentMethod.toUpperCase()}"`,
    `"${m.paymentNumberOrAccount}"`,
    `"${new Date(m.createdAt).toLocaleDateString()}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`fishora_merchants_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
}
