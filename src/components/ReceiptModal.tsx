// src/components/pos/ReceiptModal.tsx
import React, { useState, useEffect } from 'react';
import receiptService from '../services/receiptService';
import { PrinterIcon, DocumentArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ReceiptModalProps {
  saleId: number;
  invoiceNo: string;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ saleId, invoiceNo, onClose }) => {
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [printerAvailable, setPrinterAvailable] = useState(true);

  useEffect(() => {
    const checkPrinter = async () => {
      const available = await receiptService.checkPrinter();
      setPrinterAvailable(available);
    };
    checkPrinter();
  }, []);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await receiptService.printReceipt(saleId);
    } catch (error: any) {
      console.error('Print failed:', error);
      alert(error.message || 'Failed to print. Please check your printer connection.');
    } finally {
      setPrinting(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await receiptService.downloadPDF(saleId, invoiceNo);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download receipt');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Sale Complete!</h2>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">Invoice Number</p>
            <p className="text-2xl font-mono font-bold text-gray-800">{invoiceNo}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePrint}
              disabled={printing || !printerAvailable}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {printing ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Preparing Print...
                </>
              ) : (
                <>
                  <PrinterIcon className="w-5 h-5" />
                  Print Receipt
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Download PDF
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>

          <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              💡 <strong>Tip:</strong> For wireless printing, make sure your printer is connected to the same network.
              The print dialog will allow you to select any available printer (USB, WiFi, Bluetooth).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;