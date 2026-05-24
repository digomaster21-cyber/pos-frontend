import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Select,
  Button,
  Space,
  message,
  Typography,
  Tabs,
  Empty,
  Tag,
  Alert,
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  FileTextOutlined,
  DownloadOutlined,
  FundOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  reportsApi,
  DashboardKPIResponse,
  TopProduct,
  CategorySale,
  InventoryValuationResponse,
  DailySalesPoint,
  DetailedSaleItem,
  ProfitLossResponse,
  BusinessDashboardResponse,
} from '../services/reports';
import { branchesApi } from '../services/branches';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface BranchOption {
  id: number;
  name: string;
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [kpiData, setKpiData] = useState<DashboardKPIResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySale[]>([]);
  const [inventoryValuation, setInventoryValuation] = useState<InventoryValuationResponse | null>(null);
  const [dailySales, setDailySales] = useState<DailySalesPoint[]>([]);
  const [detailedSales, setDetailedSales] = useState<DetailedSaleItem[]>([]);
  const [profitLoss, setProfitLoss] = useState<ProfitLossResponse | null>(null);
  const [businessDashboard, setBusinessDashboard] = useState<BusinessDashboardResponse | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(() => [
    dayjs().startOf('month'),
    dayjs(),
  ]);
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [pageError, setPageError] = useState('');

  const formatTZS = (value: number) => `TZS ${Number(value || 0).toLocaleString()}`;

  // Force reset date range if it's stale (more than 60 days old)
  useEffect(() => {
    const today = dayjs();
    if (dateRange[0].isBefore(today.subtract(60, 'day'))) {
      console.log('Date range is stale, resetting to current month');
      setDateRange([today.startOf('month'), today]);
    }
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await branchesApi.getBranches(true);
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('fetchBranches failed', error);
      setBranches([]);
    }
  };

  const fetchKPIData = async () => {
    setLoading(true);
    setPageError('');
    try {
      const data = await reportsApi.getDashboardKPI(branchId);
      setKpiData(data);
    } catch (error: any) {
      console.error('fetchKPIData failed', error);
      setKpiData(null);
      setPageError(error?.message || 'Failed to fetch KPI data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySales = async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await reportsApi.getDailySalesReport(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        branchId
      );
      setDailySales(response?.daily_data || []);
    } catch (error: any) {
      console.error('fetchDailySales failed', error);
      setDailySales([]);
      setPageError(error?.message || 'Failed to fetch daily sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedSales = async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await reportsApi.getDetailedSalesReport(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        branchId
      );
      setDetailedSales(response?.sales || []);
    } catch (error: any) {
      console.error('fetchDetailedSales failed', error);
      setDetailedSales([]);
      setPageError(error?.message || 'Failed to fetch detailed sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await reportsApi.getTopProducts(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        branchId,
        10
      );
      setTopProducts(Array.isArray(response?.products) ? response.products : []);
    } catch (error: any) {
      console.error('fetchTopProducts failed', error);
      setTopProducts([]);
      setPageError(error?.message || 'Failed to fetch top products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorySales = async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await reportsApi.getCategorySales(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        branchId
      );
      setCategorySales(Array.isArray(response?.categories) ? response.categories : []);
    } catch (error: any) {
      console.error('fetchCategorySales failed', error);
      setCategorySales([]);
      setPageError(error?.message || 'Failed to fetch category sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitLoss = async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await reportsApi.getProfitLossReport(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        branchId
      );
      setProfitLoss(response);
    } catch (error: any) {
      console.error('fetchProfitLoss failed', error);
      setProfitLoss(null);
      setPageError(error?.message || 'Failed to fetch profit & loss');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessDashboard = async () => {
    setLoading(true);
    setPageError('');
    try {
      const data = await reportsApi.getBusinessDashboard('month', branchId);
      setBusinessDashboard(data);
    } catch (error: any) {
      console.error('fetchBusinessDashboard failed', error);
      setBusinessDashboard(null);
      setPageError(error?.message || 'Failed to fetch business dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryValuation = async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await reportsApi.getInventoryValuation(branchId);
      setInventoryValuation(response ?? null);
    } catch (error: any) {
      console.error('fetchInventoryValuation failed', error);
      setInventoryValuation(null);
      setPageError(error?.message || 'Failed to fetch inventory valuation');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await reportsApi.exportSalesReport(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        branchId,
        'csv'
      );
      message.success('Export started');
    } catch (error: any) {
      message.error('Export failed');
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'dashboard': fetchKPIData(); break;
      case 'daily': fetchDailySales(); break;
      case 'detailed': fetchDetailedSales(); break;
      case 'products': fetchTopProducts(); break;
      case 'categories': fetchCategorySales(); break;
      case 'profit-loss': fetchProfitLoss(); break;
      case 'business': fetchBusinessDashboard(); break;
      case 'inventory': fetchInventoryValuation(); break;
    }
  }, [activeTab, branchId]);

  useEffect(() => {
    if (['daily', 'detailed', 'products', 'categories', 'profit-loss'].includes(activeTab)) {
      switch (activeTab) {
        case 'daily': fetchDailySales(); break;
        case 'detailed': fetchDetailedSales(); break;
        case 'products': fetchTopProducts(); break;
        case 'categories': fetchCategorySales(); break;
        case 'profit-loss': fetchProfitLoss(); break;
      }
    }
  }, [dateRange]);

  const totalCategoryRevenue = useMemo(() => {
    return categorySales.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0);
  }, [categorySales]);

  // ─── Columns ────────────────────────────────────────────

  const dailySalesColumns: ColumnsType<DailySalesPoint> = [
    { title: 'Date', dataIndex: 'sale_date', key: 'sale_date', render: (v) => v ? dayjs(v).format('DD MMM YYYY') : '-' },
    { title: 'Transactions', dataIndex: 'transaction_count', key: 'transaction_count', align: 'right' },
    { title: 'Items Sold', dataIndex: 'total_items', key: 'total_items', align: 'right' },
    { title: 'Revenue', dataIndex: 'total_revenue', key: 'total_revenue', align: 'right', render: (v) => formatTZS(v) },
    { title: 'Profit', dataIndex: 'total_profit', key: 'total_profit', align: 'right', render: (v) => formatTZS(v) },
    { title: 'Avg Sale', dataIndex: 'avg_transaction_value', key: 'avg', align: 'right', render: (v) => formatTZS(v) },
  ];

  const detailedSalesColumns: ColumnsType<DetailedSaleItem> = [
    { title: 'Invoice', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: 'Date', dataIndex: 'sale_date', key: 'sale_date', render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '-' },
    { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'right' },
    { title: 'Price', dataIndex: 'unit_price', key: 'unit_price', align: 'right', render: (v) => formatTZS(v) },
    { title: 'Total', dataIndex: 'total_price', key: 'total_price', align: 'right', render: (v) => formatTZS(v) },
    { title: 'Profit', dataIndex: 'profit', key: 'profit', align: 'right', render: (v) => formatTZS(v) },
    { title: 'Sold By', dataIndex: 'sold_by_name', key: 'sold_by' },
  ];

  const topProductsColumns: ColumnsType<TopProduct> = [
    { title: 'Product', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Sales Count', dataIndex: 'sale_count', key: 'sale_count', align: 'right' },
    { title: 'Qty Sold', dataIndex: 'total_quantity', key: 'total_quantity', align: 'right' },
    { title: 'Revenue', dataIndex: 'total_revenue', key: 'total_revenue', align: 'right', render: (v) => formatTZS(v) },
    { title: 'Profit', dataIndex: 'total_profit', key: 'total_profit', align: 'right', render: (v) => formatTZS(v) },
  ];

  const categorySalesColumns: ColumnsType<CategorySale> = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Sales Count', dataIndex: 'sale_count', key: 'sale_count', align: 'right' },
    { title: 'Qty Sold', dataIndex: 'total_quantity', key: 'total_quantity', align: 'right' },
    { title: 'Revenue', dataIndex: 'total_revenue', key: 'total_revenue', align: 'right', render: (v) => formatTZS(v) },
    { title: 'Profit', dataIndex: 'total_profit', key: 'total_profit', align: 'right', render: (v) => formatTZS(v) },
    { title: 'Share', key: 'percentage', align: 'right', render: (_, record) => `${totalCategoryRevenue ? ((Number(record.total_revenue || 0) / totalCategoryRevenue) * 100).toFixed(1) : 0}%` },
  ];

  const inventoryColumns: ColumnsType<any> = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Products', dataIndex: 'product_count', key: 'product_count', align: 'right' },
    { title: 'Quantity', dataIndex: 'total_quantity', key: 'total_quantity', align: 'right' },
    { title: 'Cost Value', dataIndex: 'total_value', key: 'total_value', align: 'right', render: (v) => formatTZS(v) },
    { title: 'Retail Value', dataIndex: 'retail_value', key: 'retail_value', align: 'right', render: (v) => formatTZS(v) },
  ];

  // ─── Tabs ────────────────────────────────────────────────

  const tabItems = [
    // 1. Dashboard KPI Summary
    {
      key: 'dashboard',
      label: <span><BarChartOutlined /> Dashboard KPI Summary</span>,
      children: (
        kpiData ? (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic title="Today Revenue" value={kpiData.today.revenue} formatter={(v) => formatTZS(Number(v))} prefix={<DollarOutlined />} valueStyle={{ color: '#3f8600' }} />
                  <Text type="secondary">{kpiData.today.transactions} transactions today</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Today Profit" value={kpiData.today.profit} formatter={(v) => formatTZS(Number(v))} prefix={<DollarOutlined />} valueStyle={{ color: '#1677ff' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Month Revenue" value={kpiData.month_to_date.revenue} formatter={(v) => formatTZS(Number(v))} prefix={<ShoppingOutlined />} />
                  <Text type="secondary">{kpiData.month_to_date.transactions} MTD transactions</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Month Profit" value={kpiData.month_to_date.profit} formatter={(v) => formatTZS(Number(v))} prefix={<DollarOutlined />} valueStyle={{ color: '#722ed1' }} />
                </Card>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Operational Alerts">
                  <Space direction="vertical">
                    <Tag color="red">Low Stock Items: {kpiData.alerts.low_stock}</Tag>
                    <Tag color="gold">Pending Approvals: {kpiData.alerts.pending_approvals}</Tag>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Performance Summary">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>• Today Revenue: {formatTZS(kpiData.today.revenue)}</Text>
                    <Text>• Today Profit: {formatTZS(kpiData.today.profit)}</Text>
                    <Text>• Month Revenue: {formatTZS(kpiData.month_to_date.revenue)}</Text>
                    <Text>• Month Profit: {formatTZS(kpiData.month_to_date.profit)}</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </>
        ) : <Empty description={pageError || 'No dashboard data available'} />
      ),
    },
    // 2. Sales Transaction Report
    {
      key: 'detailed',
      label: <span><FileTextOutlined /> Sales Transaction Report</span>,
      children: (
        <Table
          columns={detailedSalesColumns}
          dataSource={detailedSales}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
          scroll={{ x: 1200 }}
          locale={{ emptyText: 'No sales found for the selected date range' }}
        />
      ),
    },
    // 3. Daily Sales Summary
    {
      key: 'daily',
      label: <span><LineChartOutlined /> Daily Sales Summary</span>,
      children: (
        <Table
          columns={dailySalesColumns}
          dataSource={dailySales}
          rowKey="sale_date"
          loading={loading}
          pagination={{ pageSize: 31 }}
          locale={{ emptyText: 'No daily sales data for the selected date range' }}
        />
      ),
    },
    // 4. Profit & Loss Statement
    {
      key: 'profit-loss',
      label: <span><DollarOutlined /> Profit & Loss Statement</span>,
      children: (
        profitLoss ? (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic title="Total Revenue" value={profitLoss.revenue.total} formatter={(v) => formatTZS(Number(v))} valueStyle={{ color: '#3f8600' }} />
                  <Text type="secondary">{profitLoss.revenue.transaction_count} transactions</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Gross Profit" value={profitLoss.profit.gross_profit} formatter={(v) => formatTZS(Number(v))} valueStyle={{ color: '#1677ff' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Total Expenses" value={profitLoss.expenses.total} formatter={(v) => formatTZS(Number(v))} valueStyle={{ color: '#cf1322' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Net Profit"
                    value={profitLoss.profit.net_profit}
                    formatter={(v) => formatTZS(Number(v))}
                    valueStyle={{ color: profitLoss.profit.net_profit >= 0 ? '#3f8600' : '#cf1322' }}
                  />
                  <Text type="secondary">Margin: {profitLoss.profit.profit_margin}%</Text>
                </Card>
              </Col>
            </Row>
            <Card title="Expenses by Category">
              <Table
                dataSource={profitLoss.expenses.by_category}
                rowKey="category"
                columns={[
                  { title: 'Category', dataIndex: 'category', key: 'category' },
                  { title: 'Amount', dataIndex: 'total', key: 'total', align: 'right', render: (v) => formatTZS(v) },
                ]}
                pagination={false}
                locale={{ emptyText: 'No expenses recorded' }}
              />
            </Card>
          </>
        ) : <Empty description={pageError || 'No profit & loss data available'} />
      ),
    },
    // 5. Inventory Valuation
    {
      key: 'inventory',
      label: <span><ShoppingOutlined /> Inventory Valuation</span>,
      children: (
        inventoryValuation ? (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic title="Total Products" value={inventoryValuation.summary.total_products} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Total Quantity" value={inventoryValuation.summary.total_quantity} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Cost Value" value={inventoryValuation.summary.total_cost_value} formatter={(v) => formatTZS(Number(v))} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Potential Profit" value={inventoryValuation.summary.potential_profit} formatter={(v) => formatTZS(Number(v))} valueStyle={{ color: '#3f8600' }} />
                </Card>
              </Col>
            </Row>
            <Table
              columns={inventoryColumns}
              dataSource={inventoryValuation.by_category || []}
              rowKey="category"
              pagination={false}
              locale={{ emptyText: 'No inventory data available' }}
            />
          </>
        ) : <Empty description={pageError || 'No inventory data available'} />
      ),
    },
    // 6. Top Products
    {
      key: 'products',
      label: <span><TrophyOutlined /> Top Products</span>,
      children: (
        <Table
          columns={topProductsColumns}
          dataSource={topProducts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No product sales for the selected date range' }}
        />
      ),
    },
    // 7. Sales by Category
    {
      key: 'categories',
      label: <span><PieChartOutlined /> Sales by Category</span>,
      children: (
        <Table
          columns={categorySalesColumns}
          dataSource={categorySales}
          rowKey="category"
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'No category sales for the selected date range' }}
        />
      ),
    },
    // 8. Business Dashboard
    {
      key: 'business',
      label: <span><FundOutlined /> Business Dashboard</span>,
      children: (
        businessDashboard ? (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic title="Total Sales" value={businessDashboard.profit_loss.total_sales} formatter={(v) => formatTZS(Number(v))} valueStyle={{ color: '#3f8600' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Gross Profit" value={businessDashboard.profit_loss.gross_profit} formatter={(v) => formatTZS(Number(v))} valueStyle={{ color: '#1677ff' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Net Profit" value={businessDashboard.profit_loss.net_profit} formatter={(v) => formatTZS(Number(v))} valueStyle={{ color: '#722ed1' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Net Margin" value={`${businessDashboard.profit_loss.net_margin}%`} />
                  <Text type="secondary">
                    Sales change: {businessDashboard.profit_loss.sales_change}%
                  </Text>
                </Card>
              </Col>
            </Row>
            {businessDashboard.top_products?.length > 0 && (
              <Card title="Top Products" style={{ marginBottom: 16 }}>
                <Table
                  dataSource={businessDashboard.top_products}
                  rowKey="name"
                  columns={[
                    { title: 'Product', dataIndex: 'name', key: 'name' },
                    { title: 'Qty Sold', dataIndex: 'quantity_sold', key: 'quantity_sold', align: 'right' },
                    { title: 'Revenue', dataIndex: 'total_revenue', key: 'total_revenue', align: 'right', render: (v) => formatTZS(v) },
                    { title: 'Profit', dataIndex: 'total_profit', key: 'total_profit', align: 'right', render: (v) => formatTZS(v) },
                    { title: 'Margin', dataIndex: 'profit_margin', key: 'profit_margin', align: 'right', render: (v) => `${v}%` },
                  ]}
                  pagination={false}
                />
              </Card>
            )}
            {businessDashboard.category_margins?.length > 0 && (
              <Card title="Profit Margins by Category" style={{ marginBottom: 16 }}>
                <Table
                  dataSource={businessDashboard.category_margins}
                  rowKey="category"
                  columns={[
                    { title: 'Category', dataIndex: 'category', key: 'category' },
                    { title: 'Revenue', dataIndex: 'total_revenue', key: 'total_revenue', align: 'right', render: (v) => formatTZS(v) },
                    { title: 'Profit', dataIndex: 'total_profit', key: 'total_profit', align: 'right', render: (v) => formatTZS(v) },
                    { title: 'Margin', dataIndex: 'profit_margin', key: 'profit_margin', align: 'right', render: (v) => `${v}%` },
                  ]}
                  pagination={false}
                />
              </Card>
            )}
            {businessDashboard.low_stock_alerts?.count > 0 && (
              <Alert
                type="warning"
                showIcon
                message={`${businessDashboard.low_stock_alerts.count} Low Stock Items Require Attention`}
                description={
                  <>
                    {businessDashboard.low_stock_alerts.critical?.length > 0 && (
                      <p style={{ color: 'red' }}>
                        Critical: {businessDashboard.low_stock_alerts.critical.map(i => i.name).join(', ')}
                      </p>
                    )}
                  </>
                }
                style={{ marginBottom: 16 }}
              />
            )}
            {businessDashboard.insights && (
              <Card title="Key Insights">
                {businessDashboard.insights.positive?.length > 0 && (
                  <Alert type="success" message="Positive" description={businessDashboard.insights.positive.map((item, i) => <li key={i}>{item}</li>)} style={{ marginBottom: 8 }} />
                )}
                {businessDashboard.insights.needs_attention?.length > 0 && (
                  <Alert type="warning" message="Needs Attention" description={businessDashboard.insights.needs_attention.map((item, i) => <li key={i}>{item}</li>)} style={{ marginBottom: 8 }} />
                )}
                {businessDashboard.insights.opportunities?.length > 0 && (
                  <Alert type="info" message="Opportunities" description={businessDashboard.insights.opportunities.map((item, i) => <li key={i}>{item}</li>)} />
                )}
              </Card>
            )}
          </>
        ) : <Empty description={pageError || 'No business dashboard data available'} />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}><BarChartOutlined /> Reports</Title>
            <Text type="secondary">Select Date Range</Text>
          </Col>
          <Col>
            <Space wrap>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                format="DD/MM/YYYY"
                allowClear={false}
              />
              <Select
                placeholder="All Branches"
                style={{ width: 200 }}
                allowClear
                value={branchId}
                onChange={setBranchId}
              >
                {branches.map((b) => (
                  <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
                ))}
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  const fetchers: Record<string, () => void> = {
                    dashboard: fetchKPIData,
                    daily: fetchDailySales,
                    detailed: fetchDetailedSales,
                    products: fetchTopProducts,
                    categories: fetchCategorySales,
                    'profit-loss': fetchProfitLoss,
                    business: fetchBusinessDashboard,
                    inventory: fetchInventoryValuation,
                  };
                  fetchers[activeTab]?.();
                }}
                loading={loading}
              >
                Refresh
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
                Export CSV
              </Button>
            </Space>
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default ReportsPage;