import React, { useState } from 'react';
import { ReportModal } from '../components/ReportModal';
import { reportsApi } from '../services/reports';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-04-30');

  const fetchAndOpenReport = async (reportType: string) => {
    setIsLoading(true);
    try {
      let data;
      switch (reportType) {
        case 'daily':
          data = await reportsApi.getDailySalesReport(startDate, endDate);
          break;
        case 'detailed_sales':
          data = await reportsApi.getDetailedSalesReport(startDate, endDate);
          break;
        case 'profitloss':
          data = await reportsApi.getProfitLossReport(startDate, endDate);
          break;
        case 'inventory':
          data = await reportsApi.getInventoryValuation();
          break;
        case 'top_products':
          data = await reportsApi.getTopProducts(startDate, endDate);
          break;
        case 'category_sales':
          data = await reportsApi.getCategorySales(startDate, endDate);
          break;
        case 'dashboard':
          data = await reportsApi.getDashboardKPI();
          break;
      }
      
      setReportData(data);
      setSelectedReport(reportType);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to load report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToBusinessDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
      
      {/* Date Range Selector */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Select Date Range</h2>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => fetchAndOpenReport('detailed_sales')}
          disabled={isLoading}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition disabled:opacity-50 text-left"
        >
          <div className="text-2xl mb-2">📋</div>
          <div className="font-semibold text-gray-900">Sales Transaction Report</div>
          <div className="text-sm text-gray-500">Detailed sales with date/time & seller</div>
        </button>
        
        <button
          onClick={() => fetchAndOpenReport('daily')}
          disabled={isLoading}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition disabled:opacity-50 text-left"
        >
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold text-gray-900">Daily Sales Summary</div>
          <div className="text-sm text-gray-500">Sales grouped by day</div>
        </button>
        
        <button
          onClick={() => fetchAndOpenReport('profitloss')}
          disabled={isLoading}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition disabled:opacity-50 text-left"
        >
          <div className="text-2xl mb-2">💰</div>
          <div className="font-semibold text-gray-900">Profit & Loss Statement</div>
          <div className="text-sm text-gray-500">Revenue, expenses, and profit</div>
        </button>
        
        <button
          onClick={() => fetchAndOpenReport('inventory')}
          disabled={isLoading}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition disabled:opacity-50 text-left"
        >
          <div className="text-2xl mb-2">📦</div>
          <div className="font-semibold text-gray-900">Inventory Valuation</div>
          <div className="text-sm text-gray-500">Current stock value</div>
        </button>
        
        <button
          onClick={() => fetchAndOpenReport('top_products')}
          disabled={isLoading}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition disabled:opacity-50 text-left"
        >
          <div className="text-2xl mb-2">🏷️</div>
          <div className="font-semibold text-gray-900">Top Products</div>
          <div className="text-sm text-gray-500">Best selling products</div>
        </button>
        
        <button
          onClick={() => fetchAndOpenReport('category_sales')}
          disabled={isLoading}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition disabled:opacity-50 text-left"
        >
          <div className="text-2xl mb-2">📑</div>
          <div className="font-semibold text-gray-900">Sales by Category</div>
          <div className="text-sm text-gray-500">Category performance</div>
        </button>
        
        <button
          onClick={() => fetchAndOpenReport('dashboard')}
          disabled={isLoading}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition disabled:opacity-50 text-left"
        >
          <div className="text-2xl mb-2">📈</div>
          <div className="font-semibold text-gray-900">Dashboard KPI Summary</div>
          <div className="text-sm text-gray-500">Key performance indicators</div>
        </button>
        
        <button
          onClick={goToBusinessDashboard}
          disabled={isLoading}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition disabled:opacity-50 text-left"
        >
          <div className="text-2xl mb-2">🏆</div>
          <div className="font-semibold text-gray-900">Business Dashboard</div>
          <div className="text-sm text-gray-500">Complete business performance overview</div>
        </button>
      </div>

      {isLoading && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading report...</p>
        </div>
      )}

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportType={selectedReport as any}
        data={reportData}
        title={(() => {
          switch (selectedReport) {
            case 'detailed_sales': return 'Sales Transaction Report';
            case 'daily': return 'Daily Sales Report';
            case 'profitloss': return 'Profit & Loss Statement';
            case 'inventory': return 'Inventory Valuation Report';
            case 'top_products': return 'Top Products Report';
            case 'category_sales': return 'Sales by Category Report';
            case 'dashboard': return 'Dashboard KPI Summary';
            default: return 'Report';
          }
        })()}
      />
    </div>
  );
};