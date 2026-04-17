import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Select,
  DatePicker,
  Tag,
  Modal,
  message,
  Tooltip,
  Statistic,
  Row,
  Col,
  Badge,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  PrinterOutlined,
  FilePdfOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { salesApi } from '../../services/sales';
import { Sale } from '../../types';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SalesList: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ]);
  const [statusFilter, setStatusFilter] = useState<string>('completed');
  const [branchFilter, setBranchFilter] = useState<number | undefined>(undefined);
  const [branches, setBranches] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
    fetchSummary();
    fetchBranches();
  }, [dateRange, statusFilter, branchFilter]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await salesApi.getSales({
        branch_id: branchFilter,
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setSales(data);
    } catch (error) {
      message.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await salesApi.getSalesSummary({
        branch_id: branchFilter,
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
      });
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const { branchesApi } = await import('../../services/branches');
      const data = await branchesApi.getBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsModal(true);
  };

  const handlePrintReceipt = (sale: Sale) => {
    window.open(`/api/sales/${sale.id}/receipt`, '_blank');
  };

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoice_no',
      key: 'invoice_no',
      width: 150,
      render: (text: string) => <span className="font-mono">{text}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'sale_date',
      key: 'sale_date',
      width: 160,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY HH:mm'),
    },
    {
      title: 'Product',
      key: 'product',
      width: 200,
      render: (_: any, record: Sale) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{record.product_name}</span>
          <small className="text-gray-500">Qty: {record.quantity}</small>
        </Space>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 150,
      render: (text: string) => text || 'Walk-in Customer',
    },
    {
      title: 'Amount',
      key: 'amount',
      width: 150,
      render: (_: any, record: Sale) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium text-green-600">
            ₱{record.total_price?.toFixed(2)}
          </span>
          <small className="text-gray-500">
            Profit: ₱{record.profit?.toFixed(2)}
          </small>
        </Space>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 100,
      render: (method: string) => (
        <Tag color={method === 'cash' ? 'green' : method === 'card' ? 'blue' : 'orange'}>
          {method?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Sold By',
      dataIndex: 'seller_name',
      key: 'seller_name',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Sale) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Print Receipt">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintReceipt(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {summary && (
        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Sales"
                value={summary.total_sales}
                precision={2}
                prefix="₱"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Profit"
                value={summary.total_profit}
                precision={2}
                prefix="₱"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Transactions"
                value={summary.total_transactions}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average per Sale"
                value={summary.average_sale}
                precision={2}
                prefix="₱"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title={
          <Space>
            <span className="text-xl font-bold">Sales Transactions</span>
            <Badge count={sales.length} showZero color="green" />
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/sales/new')}
          >
            New Sale
          </Button>
        }
        className="shadow-md"
      >
        <div className="mb-4 flex gap-4 flex-wrap">
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
              }
            }}
            className="w-64"
          />

          <Select
            placeholder="Branch"
            value={branchFilter}
            onChange={setBranchFilter}
            allowClear
            className="w-48"
          >
            {branches.map((branch) => (
              <Option key={branch.id} value={branch.id}>
                {branch.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-32"
          >
            <Option value="completed">Completed</Option>
            <Option value="pending">Pending</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="all">All</Option>
          </Select>

          <Button icon={<ReloadOutlined />} onClick={fetchSales}>
            Refresh
          </Button>

          <Button icon={<FilePdfOutlined />}>
            Export Report
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={sales}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} transactions`,
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title="Sale Details"
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        footer={[
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => selectedSale && handlePrintReceipt(selectedSale)}
          >
            Print Receipt
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setDetailsModal(false)}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedSale && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Invoice No">
              {selectedSale.invoice_no}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {dayjs(selectedSale.sale_date).format('MMMM DD, YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Product">
              {selectedSale.product_name}
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              {selectedSale.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Unit Price">
              ₱{selectedSale.unit_price?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              ₱{selectedSale.total_price?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Cost">
              ₱{selectedSale.total_cost?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Profit">
              ₱{selectedSale.profit?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Customer">
              {selectedSale.customer_name || 'Walk-in Customer'}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              {selectedSale.payment_method}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedSale.status === 'completed' ? 'green' : 'orange'}>
                {selectedSale.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Sold By">
              {selectedSale.seller_name}
            </Descriptions.Item>
            {selectedSale.notes && (
              <Descriptions.Item label="Notes">
                {selectedSale.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SalesList;