import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  message,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Upload,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CloudUploadOutlined,
  FileSearchOutlined,
  HistoryOutlined,
  InboxOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  PreparedSyncData,
  SyncExpenseSummary,
  SyncLogItem,
  SyncSaleDetail,
  SyncStockItem,
  SyncPrepareResponse,
  SyncResponse,
  SyncStatus,
  SyncLogsResponse,
  syncApi,
} from '../api/sync';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const currency = (value?: number) =>
  new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0,
  }).format(value || 0);

const SyncPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [preparedData, setPreparedData] = useState<PreparedSyncData | null>(null);

  const {
    data: status,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery<SyncStatus>({
    queryKey: ['sync-status'],
    queryFn: syncApi.getStatus,
  });

  const {
    data: logsData,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery<SyncLogsResponse>({
    queryKey: ['sync-logs'],
    queryFn: syncApi.getLogs,
  });

  const prepareMutation = useMutation<SyncPrepareResponse, Error, void>({
    mutationFn: syncApi.prepareSync,
    onSuccess: (response) => {
      setPreparedData(response.sync_data);
      message.success(response.message || 'Sync data prepared successfully');
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
    },
    onError: (error) => {
      message.error(error.message || 'Failed to prepare sync data');
    },
  });

  const uploadMutation = useMutation<SyncResponse, Error, void>({
    mutationFn: syncApi.uploadSync,
    onSuccess: (response) => {
      message.success(response.message || 'Sync uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
      refetchStatus();
      refetchLogs();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to upload sync');
    },
  });

  const receiveMutation = useMutation<SyncResponse, Error, File>({
    mutationFn: syncApi.receiveSyncFile,
    onSuccess: (response) => {
      message.success(response.message || 'Sync file processed successfully');
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
      refetchStatus();
      refetchLogs();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to process sync file');
    },
  });

  const salesColumns: ColumnsType<SyncSaleDetail> = [
    { title: 'Invoice', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: 'Product ID', dataIndex: 'product_id', key: 'product_id' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 80 },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (value: number) => currency(value),
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      render: (value: number) => currency(value),
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (value: number) => currency(value),
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      render: (value: number) => currency(value),
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (value?: string | null) => value || '-',
    },
    {
      title: 'Sale Date',
      dataIndex: 'sale_date',
      key: 'sale_date',
      render: (value: string) => (value ? dayjs(value).format('DD MMM YYYY HH:mm') : '-'),
    },
  ];

  const expensesColumns: ColumnsType<SyncExpenseSummary> = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Count', dataIndex: 'count', key: 'count', width: 100 },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (value: number) => currency(value),
    },
  ];

  const stockColumns: ColumnsType<SyncStockItem> = [
    { title: 'Product ID', dataIndex: 'product_id', key: 'product_id', width: 110 },
    { title: 'Product Name', dataIndex: 'name', key: 'name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 110 },
    {
      title: 'Avg Cost',
      dataIndex: 'current_avg_cost',
      key: 'current_avg_cost',
      render: (value: number) => currency(value),
    },
    {
      title: 'Stock Value',
      dataIndex: 'stock_value',
      key: 'stock_value',
      render: (value: number) => currency(value),
    },
  ];

  const logsColumns: ColumnsType<SyncLogItem> = [
    {
      title: 'Date',
      dataIndex: 'sync_date',
      key: 'sync_date',
      render: (value?: string) => (value ? dayjs(value).format('DD MMM YYYY HH:mm') : '-'),
      width: 180,
    },
    { title: 'Branch', dataIndex: 'branch_id', key: 'branch_id', width: 90 },
    {
      title: 'Type',
      dataIndex: 'sync_type',
      key: 'sync_type',
      width: 100,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    { title: 'Summary', dataIndex: 'data_summary', key: 'data_summary' },
    { title: 'Records', dataIndex: 'records_count', key: 'records_count', width: 100 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (value: string) => {
        const color =
          value === 'success' ? 'green' : value === 'failed' ? 'red' : 'orange';
        return <Tag color={color}>{value}</Tag>;
      },
    },
    {
      title: 'Error',
      dataIndex: 'error_message',
      key: 'error_message',
      render: (value?: string | null) => value || '-',
    },
  ];

  const preparedSummary = useMemo(() => {
    if (!preparedData) return null;

    return {
      salesCount: preparedData.data.sales?.count || 0,
      totalSales: preparedData.data.sales?.total_sales || 0,
      totalProfit: preparedData.data.sales?.total_profit || 0,
      salesDetailsCount: preparedData.data.sales_details?.length || 0,
      expensesCount: preparedData.data.expenses?.length || 0,
      stockCount: preparedData.data.stock?.length || 0,
    };
  }, [preparedData]);

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}
        wrap
      >
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            <SyncOutlined /> Data Synchronization
          </Title>
          <Text type="secondary">
            Offline-first branch sync management for sales, expenses, and stock
          </Text>
        </div>

        <Space wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              refetchStatus();
              refetchLogs();
            }}
          >
            Refresh
          </Button>

          <Button
            icon={<FileSearchOutlined />}
            loading={prepareMutation.isPending}
            onClick={() => prepareMutation.mutate()}
          >
            Prepare Sync
          </Button>

          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            loading={uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
          >
            Upload Sync
          </Button>
        </Space>
      </Space>

      <Alert
  type="info"
  showIcon
  style={{ marginBottom: 20 }}
  title="Sync workflow"
  description="Prepare data from the branch, review the generated summary, then upload to main store. Main store can also import sync files from branches."
/>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statusLoading}>
            <Statistic title="Branch ID" value={status?.branch_id || 0} prefix={<SyncOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statusLoading}>
            <Statistic title="Pending Sales" value={status?.pending_sales_count || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statusLoading}>
            <Statistic title="Pending Expenses" value={status?.pending_expenses_count || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statusLoading}>
            <Statistic title="Stock Items" value={status?.stock_items_count || 0} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        <Col xs={24} lg={14}>
          <Card title="Current Sync Status">
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Last Successful Sync">
                {status?.last_sync_date
                  ? dayjs(status.last_sync_date).format('DD MMM YYYY HH:mm')
                  : 'No successful sync yet'}
              </Descriptions.Item>
              <Descriptions.Item label="Main Store Receive Access">
                {status?.can_receive_sync ? (
                  <Tag color="green">Enabled</Tag>
                ) : (
                  <Tag color="default">Not Available</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Receive Sync File (Main Store)">
            <Dragger
              multiple={false}
              accept=".json"
              showUploadList
              customRequest={({ file, onSuccess, onError }) => {
                receiveMutation.mutate(file as File, {
                  onSuccess: () => onSuccess?.('ok'),
                  onError: (err) => onError?.(err as Error),
                });
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag a sync JSON file here to import</p>
              <p className="ant-upload-hint">
                Use this on the main store side to process branch sync files
              </p>
            </Dragger>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card
        title="Prepared Sync Preview"
        extra={
          preparedData ? <Tag color="blue">Hash: {preparedData.hash.slice(0, 12)}...</Tag> : null
        }
      >
        {!preparedData || !preparedSummary ? (
          <Empty description="No sync data prepared yet" />
        ) : (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small">
                  <Statistic title="Sales Count" value={preparedSummary.salesCount} />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="Total Sales"
                    value={preparedSummary.totalSales}
                    formatter={(value) => currency(Number(value))}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="Total Profit"
                    value={preparedSummary.totalProfit}
                    formatter={(value) => currency(Number(value))}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small">
                  <Statistic title="Stock Items" value={preparedSummary.stockCount} />
                </Card>
              </Col>
            </Row>

            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Branch ID">{preparedData.branch_id}</Descriptions.Item>
              <Descriptions.Item label="Sync Timestamp">
                {dayjs(preparedData.sync_timestamp).format('DD MMM YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Sales Detail Rows">
                {preparedSummary.salesDetailsCount}
              </Descriptions.Item>
              <Descriptions.Item label="Expense Categories">
                {preparedSummary.expensesCount}
              </Descriptions.Item>
              <Descriptions.Item label="From Date">
                {preparedData.data.sales?.from_date || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="To Date">
                {preparedData.data.sales?.to_date || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider titlePlacement="start">Sales Details</Divider>
            <Table
              rowKey={(record) => `${record.invoice_no}-${record.product_id}-${record.sale_date}`}
              columns={salesColumns}
              dataSource={preparedData.data.sales_details || []}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 1200 }}
            />

            <Divider titlePlacement="start">Expense Summary</Divider>
            <Table
              rowKey={(record) => `${record.category}-${record.count}`}
              columns={expensesColumns}
              dataSource={preparedData.data.expenses || []}
              pagination={{ pageSize: 5 }}
            />

            <Divider titlePlacement="start">Stock Snapshot</Divider>
            <Table
              rowKey={(record) => `${record.product_id}`}
              columns={stockColumns}
              dataSource={preparedData.data.stock || []}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 900 }}
            />
          </>
        )}
      </Card>

      <Divider />

      <Card
        title={
          <Space>
            <HistoryOutlined />
            Sync History
          </Space>
        }
      >
        <Table
          rowKey={(record) => String(record.id)}
          loading={logsLoading}
          columns={logsColumns}
          dataSource={logsData?.logs || []}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No sync logs found' }}
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
};

export default SyncPage;