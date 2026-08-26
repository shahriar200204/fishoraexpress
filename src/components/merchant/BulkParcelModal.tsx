import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Merchant, Parcel } from '../../types';
import { StorageService } from '../../lib/storage';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BulkParcelModalProps {
  merchant: Merchant;
  isOpen: boolean;
  onClose: () => void;
  onBulkCreated: () => void;
}

export const BulkParcelModal: React.FC<BulkParcelModalProps> = ({
  merchant,
  isOpen,
  onClose,
  onBulkCreated,
}) => {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const sampleCsvTemplate = `Customer Name,Customer Phone,District,Area,Full Address,Product Name,Quantity,Weight,COD Amount
Saiful Islam,01712345678,Dhaka,Mirpur,House 12 Road 5 Section 10,Men T-shirt,2,1,1250
Farhana Yeasmin,01823456789,Dhaka,Uttara,Sector 7 Road 12 Flat 4B,Leather Handbag,1,1.5,2400
Tanvir Rahman,01934567890,Chittagong,Agrabad,Holding 55 Agrabad C/A,Smart Watch,1,0.5,1800`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fishora_bulk_parcel_template.csv';
    link.click();
  };

  const handleProcessCsv = () => {
    setError('');
    if (!csvText.trim()) {
      setError('Please paste CSV rows or upload a file.');
      return;
    }

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setError('CSV must contain at least a header row and one data row.');
        return;
      }

      let count = 0;
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',').map((p) => p.replace(/(^"|"$)/g, '').trim());
        if (parts.length < 8) continue;

        const [cName, cPhone, district, area, address, pName, qty, weight, cod] = parts;

        StorageService.createParcel({
          merchantId: merchant.id,
          merchantName: merchant.businessName,
          merchantPhone: merchant.phone,
          customerName: cName || 'Customer',
          customerPhone: cPhone || '01700000000',
          district: district || 'Dhaka',
          area: area || 'Mirpur',
          fullAddress: address || 'Dhaka',
          productName: pName || 'General Product',
          quantity: parseInt(qty) || 1,
          weight: parseFloat(weight) || 1,
          parcelType: 'regular',
          deliveryType: (district && district.toLowerCase() !== 'dhaka') ? 'outside_dhaka' : 'inside_dhaka',
          codAmount: parseInt(cod) || 0,
        });
        count++;
      }

      if (count === 0) {
        setError('No valid rows could be imported. Please check CSV format.');
        return;
      }

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccessCount(count);
      onBulkCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Parcel CSV Upload" maxWidth="2xl">
      <div className="space-y-5">
        {successCount !== null ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {successCount} Parcels Imported Successfully!
            </h3>
            <p className="text-xs text-slate-500">
              All barcodes and initial tracking entries have been created in your merchant portal.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Import multiple delivery orders at once via standard spreadsheet template.</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Sample CSV
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drag and Drop / File Input */}
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50 transition cursor-pointer relative">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Click or drag & drop CSV file here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports .csv files formatted as columns</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Or Paste CSV Data Directly:
              </label>
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={sampleCsvTemplate}
                className="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessCsv}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Import Parcels
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
