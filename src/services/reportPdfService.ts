import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Types for different reports
export interface DetailedSalesData {
  period: {
    start_date: string;
    end_date: string;
  };
  sales: Array<{
    id: number;
    invoice_no: string;
    sale_date: string;
    sold_by_name: string;
    sold_by_username: string;
    customer_name: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    profit: number;
    payment_method: string;
    status: string;
  }>;
  summary: {
    total_revenue: number;
    total_profit: number;
    total_transactions: number;
    total_items: number;
  };
}

export interface DailySalesData {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  summary: {
    total_revenue: number;
    total_profit: number;
    total_transactions: number;
    avg_daily_revenue: number;
    avg_transaction_value: number;
  };
  daily_data: Array<{
    sale_date: string;
    transaction_count: number;
    total_items: number;
    total_revenue: number;
    total_profit: number;
    avg_transaction_value: number;
  }>;
}

export interface ProfitLossData {
  period: { start_date: string; end_date: string };
  revenue: {
    total: number;
    transaction_count: number;
    items_sold: number;
  };
  expenses: {
    total: number;
    by_category: Array<{ category: string; total: number }>;
  };
  profit: {
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
  };
}

export interface InventoryValuationData {
  branch_id: number;
  as_of: string;
  summary: {
    total_products: number;
    total_quantity: number;
    total_cost_value: number;
    total_retail_value: number;
    potential_profit: number;
  };
  by_category: Array<{
    category: string;
    product_count: number;
    total_quantity: number;
    total_value: number;
    retail_value: number;
  }>;
}

export interface TopProductsData {
  period: { start_date: string; end_date: string };
  products: Array<{
    id: number;
    name: string;
    sku: string;
    category: string;
    sale_count: number;
    total_quantity: number;
    total_revenue: number;
    total_profit: number;
    avg_selling_price: number;
  }>;
}

export interface CategorySalesData {
  period: { start_date: string; end_date: string };
  categories: Array<{
    category: string;
    sale_count: number;
    total_quantity: number;
    total_revenue: number;
    total_profit: number;
  }>;
}

export interface DashboardKpiData {
  today: {
    transactions: number;
    revenue: number;
    profit: number;
  };
  month_to_date: {
    transactions: number;
    revenue: number;
    profit: number;
  };
  alerts: {
    low_stock: number;
    pending_approvals: number;
  };
}

export interface BusinessDashboardData {
  period: {
    name: string;
    start_date: string;
    end_date: string;
  };
  profit_loss: {
    total_sales: number;
    total_cost: number;
    gross_profit: number;
    gross_margin: number;
    total_expenses: number;
    expenses_breakdown: {
      rent: number;
      salaries: number;
      utilities: number;
      marketing: number;
      transport: number;
      other: number;
    };
    net_profit: number;
    net_margin: number;
    sales_change: number;
    profit_change: number;
  };
  sales_performance: {
    period_total: number;
    transactions: number;
    items_sold: number;
    avg_transaction: number;
  };
  top_products: Array<{
    name: string;
    total_revenue: number;
    quantity_sold: number;
    profit_margin: number;
  }>;
  low_stock_alerts: {
    critical: Array<{ name: string; current_quantity: number; min_stock_level: number }>;
    warning: Array<{ name: string; current_quantity: number; min_stock_level: number }>;
  };
  category_margins: Array<{
    category: string;
    profit_margin: number;
  }>;
  insights: {
    positive: string[];
    needs_attention: string[];
    opportunities: string[];
  };
  generated_at: string;
}

// PDF Generation Functions
export const generateDetailedSalesPDF = (data: DetailedSalesData): jsPDF => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('SALES TRANSACTION REPORT', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${data.period.start_date} to ${data.period.end_date}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, pageWidth / 2, 36, { align: 'center' });
  
  // Summary Section
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('SUMMARY', 14, 50);
  
  const summaryData = [
    ['Total Revenue', `TZS ${data.summary.total_revenue.toLocaleString()}`],
    ['Total Profit', `TZS ${data.summary.total_profit.toLocaleString()}`],
    ['Total Transactions', data.summary.total_transactions.toString()],
    ['Total Items Sold', data.summary.total_items.toString()],
  ];
  
  autoTable(doc, {
    startY: 55,
    head: [['METRIC', 'VALUE']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9 },
    margin: { left: 14, right: 14 },
  });
  
  // Detailed Sales Table
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('TRANSACTION DETAILS', 14, finalY);
  
  const salesBody = data.sales.map(sale => [
    sale.invoice_no,
    sale.sale_date,
    sale.sold_by_name || sale.sold_by_username || 'Unknown',
    sale.customer_name || 'Walk-in',
    sale.product_name,
    sale.quantity.toString(),
    `TZS ${sale.unit_price.toLocaleString()}`,
    `TZS ${sale.total_price.toLocaleString()}`,
    `TZS ${sale.profit.toLocaleString()}`,
    sale.payment_method || 'Cash',
  ]);
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Invoice', 'Date', 'Sold By', 'Customer', 'Product', 'Qty', 'Price', 'Total', 'Profit', 'Payment']],
    body: salesBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
  });
  
  return doc;
};

export const generateDailySalesPDF = (data: DailySalesData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Daily Sales Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${data.period.start_date} to ${data.period.end_date}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 36, { align: 'center' });
  
  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary', 14, 50);
  
  const summaryData = [
    ['Total Revenue', `TZS ${data.summary.total_revenue.toLocaleString()}`],
    ['Total Profit', `TZS ${data.summary.total_profit.toLocaleString()}`],
    ['Total Transactions', data.summary.total_transactions.toString()],
    ['Average Daily Revenue', `TZS ${data.summary.avg_daily_revenue.toLocaleString()}`],
    ['Average Transaction Value', `TZS ${data.summary.avg_transaction_value.toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: 55,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  // Daily Data Table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('Daily Breakdown', 14, finalY);
  
  const dailyBody = data.daily_data.map(day => [
    day.sale_date,
    day.transaction_count.toString(),
    day.total_items.toString(),
    `TZS ${day.total_revenue.toLocaleString()}`,
    `TZS ${day.total_profit.toLocaleString()}`,
    `TZS ${day.avg_transaction_value.toLocaleString()}`,
  ]);
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Date', 'Transactions', 'Items', 'Revenue', 'Profit', 'Avg Transaction']],
    body: dailyBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  return doc;
};

export const generateProfitLossPDF = (data: ProfitLossData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Profit & Loss Statement', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${data.period.start_date} to ${data.period.end_date}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 36, { align: 'center' });
  
  // Revenue Section
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Revenue', 14, 50);
  
  const revenueData = [
    ['Total Revenue', `TZS ${data.revenue.total.toLocaleString()}`],
    ['Transaction Count', data.revenue.transaction_count.toString()],
    ['Items Sold', data.revenue.items_sold.toString()],
  ];
  
  autoTable(doc, {
    startY: 55,
    head: [['Description', 'Amount']],
    body: revenueData,
    theme: 'striped',
    headStyles: { fillColor: [46, 204, 113], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  let currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Expenses Section
  doc.text('Expenses', 14, currentY);
  
  const expenseBody = data.expenses.by_category.map(exp => [
    exp.category,
    `TZS ${exp.total.toLocaleString()}`,
  ]);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Category', 'Amount']],
    body: expenseBody,
    theme: 'striped',
    headStyles: { fillColor: [231, 76, 60], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Profit Section
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Profit Summary', 14, currentY);
  
  const profitData = [
    ['Gross Profit', `TZS ${data.profit.gross_profit.toLocaleString()}`, ''],
    ['Total Expenses', `-TZS ${data.expenses.total.toLocaleString()}`, ''],
    ['Net Profit', `TZS ${data.profit.net_profit.toLocaleString()}`, `${data.profit.profit_margin.toFixed(2)}% margin`],
  ];
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Metric', 'Amount', '']],
    body: profitData,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  return doc;
};

export const generateInventoryValuationPDF = (data: InventoryValuationData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Inventory Valuation Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`As of: ${data.as_of}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Branch ID: ${data.branch_id}`, pageWidth / 2, 36, { align: 'center' });
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 42, { align: 'center' });
  
  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary', 14, 56);
  
  const summaryData = [
    ['Total Products', data.summary.total_products.toString()],
    ['Total Quantity', data.summary.total_quantity.toString()],
    ['Total Cost Value', `TZS ${data.summary.total_cost_value.toLocaleString()}`],
    ['Total Retail Value', `TZS ${data.summary.total_retail_value.toLocaleString()}`],
    ['Potential Profit', `TZS ${data.summary.potential_profit.toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: 61,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  // By Category Table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('Breakdown by Category', 14, finalY);
  
  const categoryBody = data.by_category.map(cat => [
    cat.category,
    cat.product_count.toString(),
    cat.total_quantity.toString(),
    `TZS ${cat.total_value.toLocaleString()}`,
    `TZS ${cat.retail_value.toLocaleString()}`,
  ]);
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Category', 'Products', 'Quantity', 'Cost Value', 'Retail Value']],
    body: categoryBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  return doc;
};

export const generateTopProductsPDF = (data: TopProductsData): jsPDF => {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Top Products Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${data.period.start_date} to ${data.period.end_date}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 36, { align: 'center' });
  
  const productBody = data.products.map(product => [
    product.name,
    product.sku,
    product.category,
    product.sale_count.toString(),
    product.total_quantity.toString(),
    `TZS ${product.total_revenue.toLocaleString()}`,
    `TZS ${product.total_profit.toLocaleString()}`,
  ]);
  
  autoTable(doc, {
    startY: 50,
    head: [['Product', 'SKU', 'Category', 'Sales Count', 'Qty Sold', 'Revenue', 'Profit']],
    body: productBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  return doc;
};

export const generateCategorySalesPDF = (data: CategorySalesData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Sales by Category Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${data.period.start_date} to ${data.period.end_date}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 36, { align: 'center' });
  
  const categoryBody = data.categories.map(cat => [
    cat.category,
    cat.sale_count.toString(),
    cat.total_quantity.toString(),
    `TZS ${cat.total_revenue.toLocaleString()}`,
    `TZS ${cat.total_profit.toLocaleString()}`,
  ]);
  
  autoTable(doc, {
    startY: 50,
    head: [['Category', 'Sales Count', 'Qty Sold', 'Revenue', 'Profit']],
    body: categoryBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  return doc;
};

export const generateDashboardKpiPDF = (data: DashboardKpiData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Dashboard KPI Summary', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 30, { align: 'center' });
  
  // Today's Performance
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Today's Performance", 14, 45);
  
  const todayData = [
    ['Transactions', data.today.transactions.toString()],
    ['Revenue', `TZS ${data.today.revenue.toLocaleString()}`],
    ['Profit', `TZS ${data.today.profit.toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Value']],
    body: todayData,
    theme: 'striped',
    headStyles: { fillColor: [46, 204, 113], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  // Month to Date
  let currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('Month to Date', 14, currentY);
  
  const mtdData = [
    ['Transactions', data.month_to_date.transactions.toString()],
    ['Revenue', `TZS ${data.month_to_date.revenue.toLocaleString()}`],
    ['Profit', `TZS ${data.month_to_date.profit.toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Metric', 'Value']],
    body: mtdData,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  // Alerts
  currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setTextColor(231, 76, 60);
  doc.text('Alerts', 14, currentY);
  doc.setTextColor(100, 100, 100);
  
  const alertData = [
    ['Low Stock Items', data.alerts.low_stock.toString()],
    ['Pending Approvals', data.alerts.pending_approvals.toString()],
  ];
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Alert Type', 'Count']],
    body: alertData,
    theme: 'striped',
    headStyles: { fillColor: [231, 76, 60], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  return doc;
};

export const generateBusinessDashboardPDF = (data: BusinessDashboardData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('BUSINESS PERFORMANCE DASHBOARD', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${data.period.start_date} to ${data.period.end_date}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text(`Generated: ${format(new Date(data.generated_at), 'dd/MM/yyyy HH:mm:ss')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Profit & Loss Summary
  doc.setFontSize(14);
  doc.setTextColor(41, 128, 185);
  doc.text('PROFIT & LOSS SUMMARY', 14, yPosition);
  yPosition += 8;
  
  const plData = [
    ['Total Sales', `TZS ${(data.profit_loss.total_sales || 0).toLocaleString()}`],
    ['Cost of Goods Sold', `TZS ${(data.profit_loss.total_cost || 0).toLocaleString()}`],
    ['Gross Profit', `TZS ${(data.profit_loss.gross_profit || 0).toLocaleString()} (${data.profit_loss.gross_margin || 0}%)`],
    ['Total Expenses', `TZS ${(data.profit_loss.total_expenses || 0).toLocaleString()}`],
    ['Net Profit', `TZS ${(data.profit_loss.net_profit || 0).toLocaleString()} (${data.profit_loss.net_margin || 0}%)`],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: plData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  
  // Sales Performance
  doc.setFontSize(14);
  doc.setTextColor(41, 128, 185);
  doc.text('SALES PERFORMANCE', 14, yPosition);
  yPosition += 8;
  
  const salesData = [
    ['Total Revenue', `TZS ${(data.sales_performance.period_total || 0).toLocaleString()}`],
    ['Transactions', (data.sales_performance.transactions || 0).toString()],
    ['Items Sold', (data.sales_performance.items_sold || 0).toString()],
    ['Average Transaction', `TZS ${(data.sales_performance.avg_transaction || 0).toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: salesData,
    theme: 'striped',
    headStyles: { fillColor: [46, 204, 113], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  
  // Top Products
  if (data.top_products && data.top_products.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('TOP SELLING PRODUCTS', 14, yPosition);
    yPosition += 8;
    
    const productBody = data.top_products.slice(0, 5).map(p => [
      p.name,
      (p.quantity_sold || 0).toString(),
      `TZS ${(p.total_revenue || 0).toLocaleString()}`,
      `${p.profit_margin || 0}%`,
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Product', 'Qty Sold', 'Revenue', 'Margin']],
      body: productBody,
      theme: 'striped',
      headStyles: { fillColor: [241, 196, 15], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Low Stock Alerts
  if (data.low_stock_alerts && (data.low_stock_alerts.critical.length > 0 || data.low_stock_alerts.warning.length > 0)) {
    doc.setFontSize(14);
    doc.setTextColor(231, 76, 60);
    doc.text('LOW STOCK ALERTS', 14, yPosition);
    yPosition += 8;
    
    const stockAlerts = [];
    for (const item of data.low_stock_alerts.critical) {
      stockAlerts.push([item.name, `${item.current_quantity} left`, 'CRITICAL']);
    }
    for (const item of data.low_stock_alerts.warning) {
      stockAlerts.push([item.name, `${item.current_quantity} left`, 'WARNING']);
    }
    
    if (stockAlerts.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Product', 'Stock Level', 'Status']],
        body: stockAlerts,
        theme: 'striped',
        headStyles: { fillColor: [231, 76, 60], textColor: 255 },
        margin: { left: 14, right: 14 },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
  }
  
  // Profit Margins by Category
  if (data.category_margins && data.category_margins.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('PROFIT MARGINS BY CATEGORY', 14, yPosition);
    yPosition += 8;
    
    const marginBody = data.category_margins.map(cat => [
      cat.category,
      `${cat.profit_margin || 0}%`,
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Margin']],
      body: marginBody,
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Key Insights
  if (data.insights) {
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('KEY INSIGHTS', 14, yPosition);
    yPosition += 8;
    
    const insightsBody = [];
    for (const item of data.insights.positive || []) {
      insightsBody.push(['✅', item]);
    }
    for (const item of data.insights.needs_attention || []) {
      insightsBody.push(['⚠️', item]);
    }
    for (const item of data.insights.opportunities || []) {
      insightsBody.push(['💡', item]);
    }
    
    if (insightsBody.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['', 'Recommendation']],
        body: insightsBody,
        theme: 'striped',
        headStyles: { fillColor: [52, 73, 94], textColor: 255 },
        margin: { left: 14, right: 14 },
      });
    }
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }
  
  return doc;
};

// Utility Functions
export const downloadPDF = (doc: jsPDF, reportName: string) => {
  doc.save(`${reportName}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
};

export const printPDF = (doc: jsPDF) => {
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.print();
  }
  URL.revokeObjectURL(url);
};

export const shareViaWhatsApp = (pdfBlob: Blob, reportName: string, whatsappNumber: string) => {
  // Download PDF
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportName}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
  link.click();
  
  // Format number
  let cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '255' + cleanNumber.substring(1);
  }
  if (!cleanNumber.startsWith('255')) {
    cleanNumber = '255' + cleanNumber;
  }
  
  // Create message
  const message = encodeURIComponent(
    `📊 *${reportName} Report*\n\n` +
    `Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}\n\n` +
    `Please find attached the PDF report.\n\n` +
    `📍 POS System`
  );
  
  // Open WhatsApp
  window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};