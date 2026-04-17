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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  reportsApi,
  DashboardKPIResponse,
  TopProduct,
  CategorySale,
  InventoryValuationResponse,
} from '../services/reports';
import { branchesApi } from '../services/branches';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface BranchOption {
  id: number;
  name: string;
}

const ReportsPage: React.FC = () => {
  console.log('ReportsPage rendered');

  const [loading, setLoading] = useState(false);
  const [kpiData, setKpiData] = useState<DashboardKPIResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySale[]>([]);
  const [inventoryValuation, setInventoryValuation] =
    useState<InventoryValuationResponse | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs(),
  ]);
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [pageError, setPageError] = useState('');

  const formatTZS = (value: number) => `TZS ${Number(value || 0).toLocaleString()}`;

  const fetchBranches = async () => {
    console.log('fetchBranches started');
    try {
      const data = await branchesApi.getBranches(true);
      console.log('fetchBranches success', data);
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('fetchBranches failed', error);
      setBranches([]);
      message.error('Failed to load branches');
    }
  };

  const fetchKPIData = async () => {
    console.log('fetchKPIData started', { branchId });
    setLoading(true);
    setPageError('');

    try {
      // Direct fetch for debugging
      const url = branchId
        ? `/api/reports/dashboard/kpi?branch_id=${branchId}`
        : '/api/reports/dashboard/kpi';

      console.log('Calling KPI URL:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('KPI raw response status:', res.status);

      const data = await res.json();
      console.log('KPI raw response data:', data);

      if (!res.ok) {
        throw new Error(data?.detail || 'Failed to fetch KPI data');
      }

      setKpiData(data);
    } catch (error: any) {
      console.error('fetchKPIData failed', error);
      setKpiData(null);
      setPageError(error?.message || 'Failed to fetch KPI data');
      message.error(error?.message || 'Failed to fetch KPI data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    console.log('fetchTopProducts started', { dateRange, branchId });
    setLoading(true);
    setPageError('');
    try {
      const response = await reportsApi.getTopProducts(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        branchId,
        10
      );
      console.log('fetchTopProducts success', response);
      setTopProducts(Array.isArray(response?.products) ? response.products : []);
    } catch (error: any) {
      console.error('fetchTopProducts failed', error);
      setTopProducts([]);
      setPageError(error?.response?.data?.detail || error?.message || 'Failed to fetch top products');
      message.error(error?.response?.data?.detail || 'Failed to fetch top products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorySales = async () => {
    console.log('fetchCategorySales started', { dateRange, branchId });
    setLoading(true);
    setPageError('');
    try {
      const response = await reportsApi.getCategorySales(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        branchId
      );
      console.log('fetchCategorySales success', response);
      setCategorySales(Array.isArray(response?.categories) ? response.categories : []);
    } catch (error: any) {
      console.error('fetchCategorySales failed', error);
      setCategorySales([]);
      setPageError(error?.response?.data?.detail || error?.message || 'Failed to fetch category sales');
      message.error(error?.response?.data?.detail || 'Failed to fetch category sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryValuation = async () => {
    console.log('fetchInventoryValuation started', { branchId });
    setLoading(true);
    setPageError('');
    try {
      const response = await reportsApi.getInventoryValuation(branchId);
      console.log('fetchInventoryValuation success', response);
      setInventoryValuation(response ?? null);
    } catch (error: any) {
      console.error('fetchInventoryValuation failed', error);
      setInventoryValuation(null);
      setPageError(
        error?.response?.data?.detail || error?.message || 'Failed to fetch inventory valuation'
      );
      message.error(error?.response?.data?.detail || 'Failed to fetch inventory valuation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('ReportsPage mounted');
    fetchBranches();
  }, []);

  useEffect(() => {
    console.log('activeTab/branchId changed', { activeTab, branchId });

    if (activeTab === 'dashboard') fetchKPIData();
    if (activeTab === 'products') fetchTopProducts();
    if (activeTab === 'categories') fetchCategorySales();
    if (activeTab === 'inventory') fetchInventoryValuation();
  }, [activeTab, branchId]);

  useEffect(() => {
    console.log('dateRange changed', dateRange.map((d) => d.format('YYYY-MM-DD')));
    if (activeTab === 'products') fetchTopProducts();
    if (activeTab === 'categories') fetchCategorySales();
  }, [dateRange]);

  const totalCategoryRevenue = useMemo(() => {
    return categorySales.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0);
  }, [categorySales]);

  const topProductsColumns: ColumnsType<TopProduct> = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div>
          <div>{record?.name || '-'}</div>
          <Text type="secondary">{record?.sku || '-'}</Text>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (value?: string) => value || '-',
    },
    {
      title: 'Sales Count',
      dataIndex: 'sale_count',
      key: 'sale_count',
      align: 'right',
      render: (value?: number) => value ?? 0,
    },
    {
      title: 'Qty Sold',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      align: 'right',
      render: (value?: number) => value ?? 0,
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      align: 'right',
      render: (value?: number) => (
        <span style={{ color: '#52c41a', fontWeight: 700 }}>
          {formatTZS(Number(value || 0))}
        </span>
      ),
    },
    {
      title: 'Profit',
      dataIndex: 'total_profit',
      key: 'total_profit',
      align: 'right',
      render: (value?: number) => (
        <span style={{ color: Number(value || 0) >= 0 ? '#1677ff' : '#cf1322', fontWeight: 700 }}>
          {formatTZS(Number(value || 0))}
        </span>
      ),
    },
  ];

  const categorySalesColumns: ColumnsType<CategorySale> = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (value?: string) => value || '-',
    },
    {
      title: 'Sales Count',
      dataIndex: 'sale_count',
      key: 'sale_count',
      align: 'right',
      render: (value?: number) => value ?? 0,
    },
    {
      title: 'Qty Sold',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      align: 'right',
      render: (value?: number) => value ?? 0,
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      align: 'right',
      render: (value?: number) => (
        <span style={{ color: '#1890ff', fontWeight: 700 }}>
          {formatTZS(Number(value || 0))}
        </span>
      ),
    },
    {
      title: 'Profit',
      dataIndex: 'total_profit',
      key: 'total_profit',
      align: 'right',
      render: (value?: number) => formatTZS(Number(value || 0)),
    },
    {
      title: 'Share',
      key: 'percentage',
      align: 'right',
      render: (_, record) => {
        const percentage = totalCategoryRevenue
          ? (Number(record.total_revenue || 0) / totalCategoryRevenue) * 100
          : 0;
        return <span>{percentage.toFixed(1)}%</span>;
      },
    },
  ];

  const inventoryColumns: ColumnsType<
    NonNullable<InventoryValuationResponse['by_category']>[number]
  > = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Products',
      dataIndex: 'product_count',
      key: 'product_count',
      align: 'right',
      render: (value?: number) => value ?? 0,
    },
    {
      title: 'Quantity',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      align: 'right',
      render: (value?: number) => value ?? 0,
    },
    {
      title: 'Cost Value',
      dataIndex: 'total_value',
      key: 'total_value',
      align: 'right',
      render: (value?: number) => formatTZS(Number(value || 0)),
    },
    {
      title: 'Retail Value',
      dataIndex: 'retail_value',
      key: 'retail_value',
      align: 'right',
      render: (value?: number) => formatTZS(Number(value || 0)),
    },
  ];

  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <span>
          <BarChartOutlined /> Dashboard
        </span>
      ),
      children: (
        <>
          {pageError ? (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="Dashboard load failed"
              description={pageError}
            />
          ) : null}

          {kpiData ? (
            <>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Today's Revenue"
                      value={kpiData?.today?.revenue || 0}
                      formatter={(value) => formatTZS(Number(value))}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                    <Text type="secondary">
                      {kpiData?.today?.transactions || 0} transactions today
                    </Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Today's Profit"
                      value={kpiData?.today?.profit || 0}
                      formatter={(value) => formatTZS(Number(value))}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#1677ff' }}
                    />
                    <Text type="secondary">Current day profit</Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Month Revenue"
                      value={kpiData?.month_to_date?.revenue || 0}
                      formatter={(value) => formatTZS(Number(value))}
                      prefix={<ShoppingOutlined />}
                    />
                    <Text type="secondary">
                      {kpiData?.month_to_date?.transactions || 0} MTD transactions
                    </Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Month Profit"
                      value={kpiData?.month_to_date?.profit || 0}
                      formatter={(value) => formatTZS(Number(value))}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                    <Text type="secondary">Month-to-date profit</Text>
                  </Card>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Operational Alerts">
                    <Space direction="vertical">
                      <Tag color="red">Low Stock Items: {kpiData?.alerts?.low_stock || 0}</Tag>
                      <Tag color="gold">
                        Pending Approvals: {kpiData?.alerts?.pending_approvals || 0}
                      </Tag>
                    </Space>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="Performance Summary">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text>• Today Revenue: {formatTZS(kpiData?.today?.revenue || 0)}</Text>
                      <Text>• Today Profit: {formatTZS(kpiData?.today?.profit || 0)}</Text>
                      <Text>
                        • Month Revenue: {formatTZS(kpiData?.month_to_date?.revenue || 0)}
                      </Text>
                      <Text>
                        • Month Profit: {formatTZS(kpiData?.month_to_date?.profit || 0)}
                      </Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </>
          ) : !loading ? (
            <Empty description={pageError || 'No dashboard data available'} />
          ) : null}
        </>
      ),
    },
    {
      key: 'products',
      label: (
        <span>
          <LineChartOutlined /> Top Products
        </span>
      ),
      children: (
        <>
          {pageError ? (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="Top products load failed"
              description={pageError}
            />
          ) : null}

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Space>
                <Text strong>Date Range:</Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) =>
                    dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
                  }
                />
              </Space>
            </Col>
          </Row>
          <Table
            columns={topProductsColumns}
            dataSource={topProducts}
            rowKey={(record) => String(record.id ?? record.sku ?? record.name)}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
    {
      key: 'categories',
      label: (
        <span>
          <PieChartOutlined /> Category Sales
        </span>
      ),
      children: (
        <>
          {pageError ? (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="Category sales load failed"
              description={pageError}
            />
          ) : null}

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Space>
                <Text strong>Date Range:</Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) =>
                    dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
                  }
                />
              </Space>
            </Col>
          </Row>
          <Table
            columns={categorySalesColumns}
            dataSource={categorySales}
            rowKey="category"
            loading={loading}
            pagination={false}
          />
        </>
      ),
    },
    {
      key: 'inventory',
      label: (
        <span>
          <ShoppingOutlined /> Inventory Valuation
        </span>
      ),
      children: (
        <>
          {pageError ? (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="Inventory valuation load failed"
              description={pageError}
            />
          ) : null}

          {inventoryValuation ? (
            <>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Products"
                      value={inventoryValuation?.summary?.total_products || 0}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Quantity"
                      value={inventoryValuation?.summary?.total_quantity || 0}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Cost Value"
                      value={inventoryValuation?.summary?.total_cost_value || 0}
                      formatter={(value) => formatTZS(Number(value))}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Retail Value"
                      value={inventoryValuation?.summary?.total_retail_value || 0}
                      formatter={(value) => formatTZS(Number(value))}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Potential Profit"
                      value={inventoryValuation?.summary?.potential_profit || 0}
                      formatter={(value) => formatTZS(Number(value))}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Table
                columns={inventoryColumns}
                dataSource={inventoryValuation?.by_category || []}
                rowKey="category"
                pagination={false}
              />
            </>
          ) : !loading ? (
            <Empty description={pageError || 'No inventory data available'} />
          ) : null}
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <BarChartOutlined /> Reports & Analytics
            </Title>
            <Text type="secondary">
              Monitor sales, product performance, inventory value, and operational alerts.
            </Text>
          </Col>

          <Col>
            <Space>
              <Select
                placeholder="Select Branch"
                style={{ width: 220 }}
                allowClear
                value={branchId}
                onChange={setBranchId}
              >
                {branches.map((branch) => (
                  <Select.Option key={branch.id} value={branch.id}>
                    {branch.name}
                  </Select.Option>
                ))}
              </Select>

              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  if (activeTab === 'dashboard') fetchKPIData();
                  if (activeTab === 'products') fetchTopProducts();
                  if (activeTab === 'categories') fetchCategorySales();
                  if (activeTab === 'inventory') fetchInventoryValuation();
                }}
                loading={loading}
              >
                Refresh
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