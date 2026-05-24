import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Select,
  message,
  Space,
  Divider,
  List,
  Modal,
  InputNumber,
  Alert,
  Table,
  Tag,
  Tooltip,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Typography,
} from 'antd';
import type { TabsProps, TableColumnsType } from 'antd';
import {
  SaveOutlined,
  UserOutlined,
  LockOutlined,
  BellOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  ReloadOutlined,
  WarningOutlined,
  DeleteOutlined,
  FileTextOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { settingsApi } from '../../services/settings';
import { usersApi } from '../../services/users';
import { branchesApi } from '../../services/branches';
import { Branch } from '../../types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Backup {
  filename: string;
  size: string;
  created_at: string;
  type: string;
}

interface SyncStatus {
  last_sync: string | null;
  pending_records: number;
  status: string;
}

interface SystemSettingsResponse {
  company_name?: string;
  tax_rate?: number;
  currency?: string;
  date_format?: string;
  time_format?: string;
  session_timeout?: number;
  enable_audit_log?: boolean;
  maintenance_mode?: boolean;
  low_stock_threshold?: number;
  auto_backup?: boolean;
  backup_frequency?: string;
  low_stock_alerts?: boolean;
  daily_sales_report?: boolean;
  system_updates?: boolean;
  audit_alerts?: boolean;
  email_notifications?: string[];
  smtp_server?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
}

const Settings: React.FC = () => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [branchForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);

  const [backupModal, setBackupModal] = useState(false);
  const [restoreModal, setRestoreModal] = useState(false);
  const [branchModal, setBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [backupList, setBackupList] = useState<Backup[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [optimizing, setOptimizing] = useState(false);
  const [cleaningLogs, setCleaningLogs] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchSettings();
    fetchBackups();
    fetchSyncStatus();
    fetchBranches();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await usersApi.getCurrentUser();
      profileForm.setFieldsValue({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
      });
    } catch (error) {
      message.error('Failed to fetch user profile');
    }
  };

  const fetchSettings = async () => {
    try {
      const settings = (await settingsApi.getSystemSettings()) as SystemSettingsResponse;

      systemForm.setFieldsValue({
        company_name: settings.company_name || '',
        tax_rate: settings.tax_rate || 0,
        currency: settings.currency || 'TZS',
        date_format: settings.date_format || 'DD/MM/YYYY',
        time_format: settings.time_format || '24',
        session_timeout: settings.session_timeout || 30,
        enable_audit_log: settings.enable_audit_log ?? true,
        maintenance_mode: settings.maintenance_mode ?? false,
        low_stock_threshold: settings.low_stock_threshold || 5,
        auto_backup: settings.auto_backup ?? false,
      });

      notificationForm.setFieldsValue({
        low_stock_alerts: settings.low_stock_alerts ?? true,
        daily_sales_report: settings.daily_sales_report ?? true,
        system_updates: settings.system_updates ?? false,
        audit_alerts: settings.audit_alerts ?? true,
        email_notifications: settings.email_notifications ?? [],
      });
    } catch (error) {
      message.error('Failed to fetch settings');
    }
  };

  const fetchBackups = async () => {
    try {
      const backups = (await settingsApi.getBackups()) as Backup[];
      setBackupList(backups);
    } catch (error) {
      message.error('Failed to fetch backups');
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const status = (await settingsApi.getSyncStatus()) as SyncStatus;
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchesApi.getBranches(false);
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Failed to fetch branches');
    }
  };

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      await usersApi.updateProfile(values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      await usersApi.changePassword(values.current_password, values.new_password);
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (values: any) => {
    setLoading(true);
    try {
      await settingsApi.updateSystemSettings(values);
      message.success('System settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async (values: any) => {
    setLoading(true);
    try {
      await settingsApi.updateSystemSettings(values);
      message.success('Notification settings updated successfully');
    } catch (error) {
      message.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async (values: any) => {
    setBranchLoading(true);
    try {
      if (editingBranch) {
        const updateData: any = {
          name: values.name,
          location: values.location,
          contact_person: values.contact_person,
          phone: values.phone,
          email: values.email,
          opening_date: values.opening_date,
          is_active: values.is_active,
        };
        await branchesApi.updateBranch(editingBranch.id, updateData);
        message.success('Branch updated successfully');
      } else {
        await branchesApi.createBranch({
          code: values.code,
          name: values.name,
          location: values.location,
          contact_person: values.contact_person,
          phone: values.phone,
          email: values.email,
          opening_date: values.opening_date,
        });
        message.success('Branch created successfully');
      }
      setBranchModal(false);
      branchForm.resetFields();
      setEditingBranch(null);
      fetchBranches();
    } catch (error: any) {
      message.error(error?.message || 'Failed to save branch');
    } finally {
      setBranchLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId: number) => {
    try {
      await branchesApi.deleteBranch(branchId);
      message.success('Branch deleted successfully');
      fetchBranches();
    } catch (error: any) {
      message.error(error?.message || 'Failed to delete branch');
    }
  };

  const handleToggleBranchStatus = async (branch: Branch) => {
    try {
      await branchesApi.toggleBranchStatus(branch.id, !branch.is_active);
      message.success(`Branch ${branch.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchBranches();
    } catch (error: any) {
      message.error(error?.message || 'Failed to update branch status');
    }
  };

  const openBranchModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      branchForm.setFieldsValue({
        code: branch.code,
        name: branch.name,
        location: branch.location,
        contact_person: branch.contact_person,
        phone: branch.phone,
        email: branch.email,
        opening_date: branch.opening_date,
        is_active: branch.is_active,
      });
    } else {
      setEditingBranch(null);
      branchForm.resetFields();
      branchForm.setFieldsValue({ is_active: true });
    }
    setBranchModal(true);
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    try {
      await settingsApi.createBackup();
      message.success('Backup created successfully');
      setBackupModal(false);
      fetchBackups();
    } catch (error) {
      message.error('Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    setBackupLoading(true);
    try {
      await settingsApi.restoreBackup(filename);
      message.success('Database restored successfully');
      setRestoreModal(false);
      fetchBackups();
    } catch (error) {
      message.error('Failed to restore database');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    try {
      await settingsApi.deleteBackup(filename);
      message.success('Backup deleted successfully');
      fetchBackups();
    } catch (error) {
      message.error('Failed to delete backup');
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      const blob = (await settingsApi.downloadBackup(filename)) as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      message.error('Failed to download backup');
    }
  };

  const handleSyncData = async () => {
    setSyncLoading(true);
    try {
      await settingsApi.syncData();
      message.success('Data synced successfully');
      fetchSyncStatus();
    } catch (error) {
      message.error('Failed to sync data');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleOptimizeDatabase = async () => {
    setOptimizing(true);
    try {
      await settingsApi.optimizeDatabase();
      message.success('Database optimized successfully');
    } catch (error) {
      message.error('Failed to optimize database');
    } finally {
      setOptimizing(false);
    }
  };

  const handleCleanLogs = async (days: number = 30) => {
    setCleaningLogs(true);
    try {
      await settingsApi.cleanOldLogs(days);
      message.success(`Logs older than ${days} days cleaned successfully`);
    } catch (error) {
      message.error('Failed to clean logs');
    } finally {
      setCleaningLogs(false);
    }
  };

  const branchColumns: TableColumnsType<Branch> = [
    {
      title: 'Branch Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <Space>
          <QrcodeOutlined />
          <Text strong className="font-mono">{code}</Text>
        </Space>
      ),
    },
    {
      title: 'Branch Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Branch) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID: {record.id}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => (
        <Tooltip title={location}>
          <Space>
            <EnvironmentOutlined />
            <Text>{location?.length > 30 ? location.substring(0, 30) + '...' : location || '-'}</Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (_: any, record: Branch) => (
        <Space direction="vertical" size={0}>
          {record.contact_person && (
            <Text>
              <UserOutlined /> {record.contact_person}
            </Text>
          )}
          {record.phone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <PhoneOutlined /> {record.phone}
            </Text>
          )}
          {record.email && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined /> {record.email}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Opening Date',
      dataIndex: 'opening_date',
      key: 'opening_date',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Branch) => (
        <Space>
          <Tooltip title="Edit Branch">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openBranchModal(record)}
            />
          </Tooltip>
          
          <Tooltip title={record.is_active ? 'Deactivate Branch' : 'Activate Branch'}>
            <Button
              type="text"
              icon={<SyncOutlined />}
              onClick={() => handleToggleBranchStatus(record)}
              style={{ color: record.is_active ? '#faad14' : '#52c41a' }}
            />
          </Tooltip>

          <Popconfirm
            title="Delete Branch"
            description="Are you sure? This will also delete all related data (sales, stock, users) for this branch."
            onConfirm={() => handleDeleteBranch(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Branch">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const backupColumns: TableColumnsType<Backup> = useMemo(
    () => [
      {
        title: 'Backup File',
        dataIndex: 'filename',
        key: 'filename',
        render: (text: string) => (
          <Space direction="vertical" size={0}>
            <Space>
              <FileTextOutlined />
              <span className="font-mono">{text}</span>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Unique backup file name used for restore or download
            </Text>
          </Space>
        ),
      },
      {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        width: 130,
        render: (value: string) => (
          <Space direction="vertical" size={0}>
            <Text>{value}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Storage used
            </Text>
          </Space>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: 140,
        render: (type: string) => (
          <Space direction="vertical" size={0}>
            <Tag color={type === 'automatic' ? 'blue' : 'green'}>
              {type?.toUpperCase()}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {type === 'automatic' ? 'Created by system schedule' : 'Created by user'}
            </Text>
          </Space>
        ),
      },
      {
        title: 'Created On',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 220,
        render: (date: string) => (
          <Space direction="vertical" size={0}>
            <Text>{dayjs(date).format('DD MMM YYYY, HH:mm')}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Backup generation time
            </Text>
          </Space>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 170,
        render: (_: any, record: Backup) => (
          <Space>
            <Tooltip title="Download this backup file to your computer">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadBackup(record.filename)}
              />
            </Tooltip>

            <Tooltip title="Restore database using this backup">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => handleRestoreBackup(record.filename)}
              />
            </Tooltip>

            <Popconfirm
              title="Delete backup"
              description="Are you sure you want to delete this backup?"
              onConfirm={() => handleDeleteBackup(record.filename)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete this backup permanently">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  const pageHeader = (
    <div className="mb-6">
      <Title level={3} className="!mb-1">
        <SettingOutlined className="mr-2" />
        System Settings
      </Title>
      <Paragraph type="secondary" className="!mb-0">
        Manage your account, system preferences, notifications, branch locations, backup tools, and database maintenance from one place.
      </Paragraph>
    </div>
  );

  const overviewCards = (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} md={6}>
        <Card size="small" className="h-full">
          <Statistic
            title="Business Currency"
            value={systemForm.getFieldValue('currency') || 'TZS'}
            prefix="💰"
          />
          <Text type="secondary">Main currency for reports, totals, pricing and dashboard display.</Text>
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card size="small" className="h-full">
          <Statistic
            title="Active Branches"
            value={branches.filter(b => b.is_active).length}
            prefix="🏢"
          />
          <Text type="secondary">Operational locations in your business.</Text>
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card size="small" className="h-full">
          <Statistic
            title="Pending Sync Records"
            value={syncStatus?.pending_records || 0}
            prefix="🔄"
          />
          <Text type="secondary">Records waiting to be uploaded or synchronized.</Text>
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card size="small" className="h-full">
          <Statistic
            title="Stored Backups"
            value={backupList.length}
            prefix="🗂️"
          />
          <Text type="secondary">Available restore points for your database.</Text>
        </Card>
      </Col>
    </Row>
  );

  const tabItems: TabsProps['items'] = [
    {
      key: 'profile',
      label: <span><UserOutlined /> Profile</span>,
      children: (
        <div className="max-w-3xl">
          <Alert showIcon type="info" icon={<InfoCircleOutlined />} message="Profile section" description="This area stores your personal account information." className="mb-4" />
          <Card size="small" title="Personal Information" extra={<Text type="secondary">Visible on your account</Text>}>
            <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter full name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
                    <Input placeholder="Enter email address" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="phone" label="Phone Number"><Input placeholder="Enter phone number" /></Form.Item>
              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>Update Profile</Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'password',
      label: <span><LockOutlined /> Password</span>,
      children: (
        <div className="max-w-3xl">
          <Alert showIcon type="warning" icon={<SafetyOutlined />} message="Password security" className="mb-4" />
          <Card size="small" title="Change Password">
            <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
              <Form.Item name="current_password" label="Current Password" rules={[{ required: true }]}>
                <Input.Password placeholder="Current password" />
              </Form.Item>
              <Form.Item name="new_password" label="New Password" rules={[{ required: true }, { min: 8 }]}>
                <Input.Password placeholder="New password" />
              </Form.Item>
              <Form.Item name="confirm_password" label="Confirm New Password" dependencies={['new_password']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return value && getFieldValue('new_password') === value ? Promise.resolve() : Promise.reject('Passwords do not match'); } })]}>
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>Change Password</Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'branches',
      label: <span><ShopOutlined /> Branches</span>,
      children: (
        <div>
          <Alert showIcon type="info" message="Branch Management" className="mb-4" />
          <Card title="Business Branches" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openBranchModal()}>Add Branch</Button>}>
            <Table columns={branchColumns} dataSource={branches} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
          </Card>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: <span><BellOutlined /> Notifications</span>,
      children: (
        <div className="max-w-3xl">
          <Alert showIcon type="info" message="Notification controls" className="mb-4" />
          <Card size="small" title="Notification Preferences">
            <Form form={notificationForm} layout="vertical" onFinish={handleUpdateNotifications}>
              <List itemLayout="horizontal" dataSource={[
                { name: 'low_stock_alerts', title: 'Low Stock Alerts', defaultValue: true },
                { name: 'daily_sales_report', title: 'Daily Sales Report', defaultValue: true },
                { name: 'system_updates', title: 'System Updates', defaultValue: false },
                { name: 'audit_alerts', title: 'Audit Alerts', defaultValue: true },
              ]} renderItem={(item) => (
                <List.Item actions={[<Form.Item name={item.name} valuePropName="checked" noStyle key={item.name}><Switch defaultChecked={item.defaultValue} /></Form.Item>]}>
                  <List.Item.Meta title={item.title} />
                </List.Item>
              )} />
              <Divider />
              <Form.Item name="email_notifications" label="Notification Email Recipients">
                <Select mode="tags" placeholder="Enter email addresses" tokenSeparators={[',', ' ']} />
              </Form.Item>
              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>Save Notification Settings</Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'system',
      label: <span><AppstoreOutlined /> System</span>,
      children: (
        <div className="max-w-4xl">
          <Alert showIcon type="info" message="System configuration" className="mb-4" />
          <Card size="small" title="Business Preferences">
            <Form form={systemForm} layout="vertical" onFinish={handleUpdateSettings}>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="company_name" label="Company Name"><Input /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="tax_rate" label="Tax Rate (%)"><InputNumber min={0} max={100} step={0.1} className="w-full" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="currency" label="Currency"><Select><Option value="TZS">TZS</Option><Option value="USD">USD</Option></Select></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="low_stock_threshold" label="Low Stock Threshold"><InputNumber min={1} max={1000} className="w-full" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="date_format" label="Date Format"><Select><Option value="DD/MM/YYYY">DD/MM/YYYY</Option><Option value="YYYY-MM-DD">YYYY-MM-DD</Option></Select></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="time_format" label="Time Format"><Select><Option value="12">12-hour</Option><Option value="24">24-hour</Option></Select></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="session_timeout" label="Session Timeout (min)"><InputNumber min={5} max={480} className="w-full" /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="auto_backup" label="Auto Backup" valuePropName="checked"><Switch /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="enable_audit_log" label="Enable Audit Log" valuePropName="checked"><Switch /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="maintenance_mode" label="Maintenance Mode" valuePropName="checked"><Switch /></Form.Item></Col>
              </Row>
              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>Save System Settings</Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'database',
      label: <span><DatabaseOutlined /> Database</span>,
      children: (
        <div className="max-w-6xl">
          <Alert showIcon type="warning" message="Database tools section" className="mb-4" />
          <Card title="Sync Status" className="mb-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}><Card size="small"><Statistic title="Last Sync" value={syncStatus?.last_sync ? dayjs(syncStatus.last_sync).format('DD MMM YYYY, HH:mm') : 'Never'} /></Card></Col>
              <Col xs={24} md={8}><Card size="small"><Statistic title="Pending Records" value={syncStatus?.pending_records || 0} /></Card></Col>
              <Col xs={24} md={8}><Card size="small"><Statistic title="Status" value={syncStatus?.status || 'Unknown'} /></Card></Col>
            </Row>
            <Button type="primary" icon={<SyncOutlined />} onClick={handleSyncData} loading={syncLoading} className="mt-4" block>Sync Now</Button>
          </Card>
          <Card title="Backup Management" className="mb-4">
            <div className="mb-4 flex flex-wrap gap-2">
              <Button type="primary" icon={<CloudUploadOutlined />} onClick={() => setBackupModal(true)}>Create Backup</Button>
              <Button icon={<DownloadOutlined />} onClick={() => setRestoreModal(true)}>Open Restore List</Button>
              <Button icon={<ReloadOutlined />} onClick={fetchBackups}>Refresh Backup List</Button>
            </div>
            <Table columns={backupColumns} dataSource={backupList} rowKey="filename" pagination={false} scroll={{ x: 900 }} />
          </Card>
          <Card title="Maintenance Tools">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}><Button icon={<WarningOutlined />} onClick={handleOptimizeDatabase} loading={optimizing} block>Optimize Database</Button></Col>
              <Col xs={24} md={12}><Button icon={<DeleteOutlined />} onClick={() => handleCleanLogs(30)} loading={cleaningLogs} block>Clean Old Logs (30+ days)</Button></Col>
            </Row>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {pageHeader}
      {overviewCards}
      <Card className="shadow-md rounded-xl border-0">
        <Tabs defaultActiveKey="profile" items={tabItems} />
      </Card>

      <Modal title={editingBranch ? "Edit Branch" : "Add New Branch"} open={branchModal} onCancel={() => { setBranchModal(false); setEditingBranch(null); branchForm.resetFields(); }} footer={null} width={600}>
        <Form form={branchForm} layout="vertical" onFinish={handleCreateBranch}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="code" label="Branch Code" rules={[{ required: true }]}><Input disabled={!!editingBranch} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="name" label="Branch Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="location" label="Location"><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="contact_person" label="Contact Person"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="phone" label="Phone"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="email" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="opening_date" label="Opening Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Form.Item name="is_active" label="Active Status" valuePropName="checked"><Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked /></Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => { setBranchModal(false); setEditingBranch(null); branchForm.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={branchLoading}>{editingBranch ? 'Update Branch' : 'Create Branch'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Create Backup" open={backupModal} onCancel={() => setBackupModal(false)} onOk={handleCreateBackup} okText="Create Backup" confirmLoading={backupLoading}>
        <Paragraph>This action creates a complete snapshot of your database.</Paragraph>
        <Text strong>Backup includes:</Text>
        <ul className="list-disc pl-6"><li>Users & permissions</li><li>Products & inventory</li><li>Sales history</li><li>Expenses</li><li>Settings</li></ul>
      </Modal>

      <Modal title="Restore from Backup" open={restoreModal} onCancel={() => setRestoreModal(false)} footer={null} width={1000}>
        <Table columns={backupColumns} dataSource={backupList} rowKey="filename" pagination={false} scroll={{ x: 900 }} />
      </Modal>
    </div>
  );
};

export default Settings;