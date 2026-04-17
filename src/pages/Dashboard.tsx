import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  message,
  Table,
  Typography,
  Divider,
  Tag,
  Progress,
  Alert,
  Space,
  Select,
  Button,
  Tooltip,
  Spin,
  Input,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  AlertOutlined,
  TrophyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  PrinterOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import dayjs from 'dayjs';
import { dashboardApi } from '../services/dashboard';
import { reportsApi, DailySalesPoint, BusinessDashboardResponse } from '../services/reports';
import { branchesApi } from '../services/branches';
import { Branch } from '../types';
import { 
  generateBusinessDashboardPDF, 
  downloadPDF, 
  printPDF, 
  shareViaWhatsApp,
  BusinessDashboardData 
} from '../services/reportPdfService';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  // State declarations
  const [summary, setSummary] = useState<any>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trendData, setTrendData] = useState<DailySalesPoint[]>([]);
  const [period, setPeriod] = useState('month');
  const [businessData, setBusinessData] = useState<BusinessDashboardResponse | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(false);

  // Effects
  useEffect(() => {
    fetchDashboard();
    fetchBranches();
    fetchTrendData();
  }, []);

  useEffect(() => {
    fetchBusinessDashboard();
  }, [period]);

  // Fetch functions
  const fetchDashboard = async () => {
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (error) {
      console.error(error);
      message.error('Failed to load dashboard summary');
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchesApi.getBranches(true);
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      message.error('Failed to load branches');
    }
  };

  const fetchTrendData = async () => {
    try {
      const start = dayjs().startOf('month').format('YYYY-MM-DD');
      const end = dayjs().format('YYYY-MM-DD');

      const res = await reportsApi.getDailySalesReport(start, end);
      setTrendData(res?.daily_data || []);
    } catch (err) {
      console.error(err);
      message.error('Failed to load trend data');
      setTrendData([]);
    }
  };

  const fetchBusinessDashboard = async () => {
    setLoadingBusiness(true);
    try {
      const data = await reportsApi.getBusinessDashboard(period);
      setBusinessData(data);
    } catch (error) {
      console.error('Failed to fetch business dashboard:', error);
    } finally {
      setLoadingBusiness(false);
    }
  };

  // Helper functions
  const formatTZS = (value: number) => `TZS ${Number(value || 0).toLocaleString()}`;

  const avgTodaySale = useMemo(() => {
    if (!summary?.today?.transactions) return 0;
    return summary.today.revenue / summary.today.transactions;
  }, [summary]);

  const avgMonthSale = useMemo(() => {
    if (!summary?.month_to_date?.transactions) return 0;
    return summary.month_to_date.revenue / summary.month_to_date.transactions;
  }, [summary]);

  const chartData = useMemo(() => {
    return trendData.map((item) => ({
      ...item,
      label: dayjs(item.sale_date).format('DD MMM'),
    }));
  }, [trendData]);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#f44336', '#9c27b0'];

  // PDF Handler Functions
  const handleDownloadPDF = () => {
    if (businessData) {
      const doc = generateBusinessDashboardPDF(businessData as BusinessDashboardData);
      downloadPDF(doc, 'Business_Dashboard');
      message.success('PDF downloaded successfully');
    } else {
      message.error('No data to download');
    }
  };

  const handlePrint = () => {
    if (businessData) {
      const doc = generateBusinessDashboardPDF(businessData as BusinessDashboardData);
      printPDF(doc);
    } else {
      message.error('No data to print');
    }
  };

  const handleWhatsAppShare = () => {
    if (businessData && whatsappNumber) {
      const doc = generateBusinessDashboardPDF(businessData as BusinessDashboardData);
      const pdfBlob = doc.output('blob');
      shareViaWhatsApp(pdfBlob, 'Business_Dashboard', whatsappNumber);
      setShowWhatsAppInput(false);
      setWhatsappNumber('');
      message.success('WhatsApp opened! Please attach the downloaded PDF');
    } else if (!whatsappNumber) {
      message.error('Please enter WhatsApp number');
    } else {
      message.error('No data to share');
    }
  };

  // Table columns
  const branchColumns: ColumnsType<Branch> = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Branch', dataIndex: 'name', key: 'name' },
    { title: 'Location', dataIndex: 'location', key: 'location', render: (value?: string) => value || '-' },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', render: (value: boolean) => value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
  ];

  // Top products data
  const topProductsData = businessData?.top_products?.slice(0, 5).map((p) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    value: p.total_revenue,
    profit: p.total_profit,
    margin: p.profit_margin,
  })) || [];

  // Category margins data
  const categoryMarginData = businessData?.category_margins || [];

  // Low stock alerts
  const criticalStock = businessData?.low_stock_alerts?.critical || [];
  const warningStock = businessData?.low_stock_alerts?.warning || [];
  const totalLowStockCount = businessData?.low_stock_alerts?.count || 0;

  if (loadingBusiness && !businessData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading business dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-6" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>📊 Business Dashboard</Title>
          <Text type="secondary">Complete view of your business performance</Text>
        </div>
        <Space>
          <Select value={period} onChange={setPeriod} style={{ width: 140 }}>
            <Option value="today">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="year">This Year</Option>
          </Select>
          <Tooltip title="Download PDF"><Button icon={<DownloadOutlined />} onClick={handleDownloadPDF}>PDF</Button></Tooltip>
          <Tooltip title="Print"><Button icon={<PrinterOutlined />} onClick={handlePrint}>Print</Button></Tooltip>
          <Tooltip title="Share on WhatsApp">
            <Button 
              icon={<WhatsAppOutlined />} 
              style={{ background: '#25D366', color: 'white', border: 'none' }} 
              onClick={() => setShowWhatsAppInput(!showWhatsAppInput)}
            >
              Share
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* WhatsApp Input */}
      {showWhatsAppInput && (
        <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <Space>
            <Input 
              placeholder="Enter WhatsApp number (e.g., 25561567655)" 
              value={whatsappNumber} 
              onChange={(e) => setWhatsappNumber(e.target.value)} 
              style={{ width: 300 }} 
            />
            <Button type="primary" onClick={handleWhatsAppShare} style={{ background: '#25D366' }}>
              Send Now
            </Button>
            <Button onClick={() => setShowWhatsAppInput(false)}>Cancel</Button>
          </Space>
        </div>
      )}

      {/* Profit & Loss Summary Card */}
      {businessData && (
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Row gutter={24}>
            <Col xs={24} sm={12} lg={6}>
              <Statistic 
                title={<span style={{ color: 'white' }}>Total Sales</span>} 
                value={businessData.profit_loss?.total_sales || 0} 
                precision={0} 
                prefix="TZS" 
                valueStyle={{ color: 'white', fontSize: 28 }} 
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic 
                title={<span style={{ color: 'white' }}>Gross Profit</span>} 
                value={businessData.profit_loss?.gross_profit || 0} 
                precision={0} 
                prefix="TZS" 
                valueStyle={{ color: '#90EE90', fontSize: 28 }} 
              />
              <Progress percent={businessData.profit_loss?.gross_margin || 0} size="small" strokeColor="#90EE90" />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic 
                title={<span style={{ color: 'white' }}>Total Expenses</span>} 
                value={businessData.profit_loss?.total_expenses || 0} 
                precision={0} 
                prefix="TZS" 
                valueStyle={{ color: '#FFB6C1', fontSize: 28 }} 
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic 
                title={<span style={{ color: 'white' }}>Net Profit</span>} 
                value={businessData.profit_loss?.net_profit || 0} 
                precision={0} 
                prefix="TZS" 
                valueStyle={{ color: '#FFD700', fontSize: 32, fontWeight: 'bold' }} 
              />
              <Progress percent={businessData.profit_loss?.net_margin || 0} size="small" strokeColor="#FFD700" />
            </Col>
          </Row>
        </Card>
      )}

      {/* Quick Stats */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={5}>Today's Performance</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Revenue" 
              value={summary?.today?.revenue || 0} 
              prefix={<DollarOutlined />} 
              formatter={(value) => formatTZS(Number(value))} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Profit" 
              value={summary?.today?.profit || 0} 
              prefix={<DollarOutlined />} 
              formatter={(value) => formatTZS(Number(value))} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Transactions" 
              value={summary?.today?.transactions || 0} 
              prefix={<ShoppingCartOutlined />} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Average Sale" 
              value={avgTodaySale} 
              prefix={<DollarOutlined />} 
              formatter={(value) => formatTZS(Number(value))} 
            />
          </Col>
        </Row>
        
        <Divider />
        
        <Title level={5}>Month to Date</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Revenue" 
              value={summary?.month_to_date?.revenue || 0} 
              prefix={<DollarOutlined />} 
              formatter={(value) => formatTZS(Number(value))} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Profit" 
              value={summary?.month_to_date?.profit || 0} 
              prefix={<DollarOutlined />} 
              formatter={(value) => formatTZS(Number(value))} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Transactions" 
              value={summary?.month_to_date?.transactions || 0} 
              prefix={<ShoppingCartOutlined />} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Average Sale" 
              value={avgMonthSale} 
              prefix={<DollarOutlined />} 
              formatter={(value) => formatTZS(Number(value))} 
            />
          </Col>
        </Row>
        
        <Divider />
        
        <Title level={5}>Alerts</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Low Stock Items" 
              value={totalLowStockCount || summary?.alerts?.low_stock || 0} 
              prefix={<AlertOutlined />} 
              valueStyle={{ color: '#faad14' }} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="Pending Approvals" 
              value={summary?.alerts?.pending_approvals || 0} 
              prefix={<InboxOutlined />} 
              valueStyle={{ color: '#cf1322' }} 
            />
          </Col>
        </Row>
      </Card>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="📈 Revenue & Profit Trend">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatTZS(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="total_revenue" stroke="#1677ff" name="Revenue" strokeWidth={2} />
                  <Line type="monotone" dataKey="total_profit" stroke="#52c41a" name="Profit" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Text type="secondary">No trend data available.</Text>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="🏆 Top Selling Products">
            {topProductsData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={topProductsData} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={false} 
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} 
                    outerRadius={80} 
                    fill="#8884d8" 
                    dataKey="value"
                  >
                    {topProductsData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatTZS(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Text type="secondary">No product sales data available.</Text>
            )}
            <Divider style={{ margin: '16px 0' }} />
            <Table 
              dataSource={businessData?.top_products?.slice(0, 5) || []} 
              rowKey="name" 
              size="small" 
              pagination={false} 
              columns={[
                { title: 'Product', dataIndex: 'name', key: 'name' },
                { title: 'Qty', dataIndex: 'quantity_sold', key: 'qty', align: 'right' },
                { title: 'Revenue', dataIndex: 'total_revenue', key: 'revenue', align: 'right', render: (v) => formatTZS(v) },
                { title: 'Margin', dataIndex: 'profit_margin', key: 'margin', align: 'right', render: (v) => <Tag color={v > 30 ? 'green' : v > 15 ? 'orange' : 'red'}>{v}%</Tag> }
              ]} 
            />
          </Card>
        </Col>
      </Row>

      {/* Profit Margins & Low Stock */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="💰 Profit Margins by Category">
            {categoryMarginData.length ? (
              categoryMarginData.map((cat: any) => (
                <div key={cat.category} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{cat.category}</span>
                    <span style={{ fontWeight: 'bold', color: cat.profit_margin > 30 ? 'green' : cat.profit_margin > 15 ? 'orange' : 'red' }}>
                      {cat.profit_margin}%
                    </span>
                  </div>
                  <Progress 
                    percent={Math.min(cat.profit_margin, 100)} 
                    size="small" 
                    strokeColor={cat.profit_margin > 30 ? '#52c41a' : cat.profit_margin > 15 ? '#faad14' : '#ff4d4f'} 
                  />
                </div>
              ))
            ) : (
              <Text type="secondary">No category data available.</Text>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="⚠️ Low Stock Alerts">
            {criticalStock.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ color: 'red' }}>🔴 CRITICAL - Order NOW</h4>
                {criticalStock.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: 8, padding: 8, background: '#fff2f0', borderRadius: 4 }}>
                    <strong>{item.name}</strong> - Only {item.current_quantity} left (Min: {item.min_stock_level})
                  </div>
                ))}
              </div>
            )}
            {warningStock.length > 0 && (
              <div>
                <h4 style={{ color: 'orange' }}>🟡 WARNING - Order soon</h4>
                {warningStock.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: 8, padding: 8, background: '#fff7e6', borderRadius: 4 }}>
                    <strong>{item.name}</strong> - Only {item.current_quantity} left
                  </div>
                ))}
              </div>
            )}
            {totalLowStockCount === 0 && (
              <Alert message="All stock levels are healthy!" type="success" showIcon />
            )}
          </Card>
        </Col>
      </Row>

      {/* Key Insights */}
      {businessData?.insights && (
        <Card title="💡 Key Insights & Recommendations" style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            {businessData.insights.positive?.length > 0 && (
              <Col xs={24} lg={8}>
                <h4><CheckCircleOutlined style={{ color: 'green' }} /> POSITIVE</h4>
                {businessData.insights.positive.map((item: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </Col>
            )}
            {businessData.insights.needs_attention?.length > 0 && (
              <Col xs={24} lg={8}>
                <h4><WarningOutlined style={{ color: 'orange' }} /> NEEDS ATTENTION</h4>
                {businessData.insights.needs_attention.map((item: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </Col>
            )}
            {businessData.insights.opportunities?.length > 0 && (
              <Col xs={24} lg={8}>
                <h4><TrophyOutlined style={{ color: 'blue' }} /> OPPORTUNITIES</h4>
                {businessData.insights.opportunities.map((item: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Branches */}
      <Card title="🏢 Branches">
        <Table 
          rowKey="id" 
          columns={branchColumns} 
          dataSource={branches} 
          pagination={{ pageSize: 5 }} 
        />
      </Card>
    </div>
  );
};

export default Dashboard;