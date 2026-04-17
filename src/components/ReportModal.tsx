import React, { useState } from 'react';
import { 
  generateDailySalesPDF, 
  generateProfitLossPDF, 
  generateInventoryValuationPDF,
  generateTopProductsPDF,
  generateCategorySalesPDF,
  generateDashboardKpiPDF,
  downloadPDF,
  printPDF,
  shareViaWhatsApp,
  DailySalesData,
  ProfitLossData,
  InventoryValuationData,
  TopProductsData,
  CategorySalesData,
  DashboardKpiData
} from '../services/reportPdfService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'daily' | 'profitloss' | 'inventory' | 'top_products' | 'category_sales' | 'dashboard';
  data: any;
  title: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportType, data, title }) => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  if (!isOpen) return null;

  const generatePDF = () => {
    switch (reportType) {
      case 'daily':
        return generateDailySalesPDF(data as DailySalesData);
      case 'profitloss':
        return generateProfitLossPDF(data as ProfitLossData);
      case 'inventory':
        return generateInventoryValuationPDF(data as InventoryValuationData);
      case 'top_products':
        return generateTopProductsPDF(data as TopProductsData);
      case 'category_sales':
        return generateCategorySalesPDF(data as CategorySalesData);
      case 'dashboard':
        return generateDashboardKpiPDF(data as DashboardKpiData);
      default:
        return null;
    }
  };

  const handleDownload = () => {
    const doc = generatePDF();
    if (doc) downloadPDF(doc, title);
  };

  const handlePrint = () => {
    const doc = generatePDF();
    if (doc) printPDF(doc);
  };

  const handleSendToWhatsApp = () => {
    if (!whatsappNumber) {
      alert('Please enter WhatsApp number');
      return;
    }
    
    const doc = generatePDF();
    if (doc) {
      const pdfBlob = doc.output('blob');
      shareViaWhatsApp(pdfBlob, title, whatsappNumber);
      setShowWhatsApp(false);
      setWhatsappNumber('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Choose how you want to export this report
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <span>📥 Download PDF</span>
                    <span>↓</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <span>🖨️ Print Report</span>
                    <span>🖨️</span>
                  </button>

                  <button
                    onClick={() => setShowWhatsApp(!showWhatsApp)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    <span>📱 Send to WhatsApp</span>
                    <span>📱</span>
                  </button>

                  {showWhatsApp && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g., 061567655 or 25561567655"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter number without spaces (e.g., 061567655 or 25561567655)
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleSendToWhatsApp}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Send Now
                        </button>
                        <button
                          onClick={() => {
                            setShowWhatsApp(false);
                            setWhatsappNumber('');
                          }}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};