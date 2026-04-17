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
import { Branch } from '../../types'; // Import Branch from types
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

// Don't redeclare Branch interface here - use the imported one

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
      const settings = await settingsApi.getSystemSettings();

      systemForm.setFieldsValue({
        ...settings,
        currency: settings?.currency || 'TZS',
        date_format: settings?.date_format || 'DD/MM/YYYY',
        time_format: settings?.time_format || '24',
      });

      notificationForm.setFieldsValue({
        low_stock_alerts: settings?.low_stock_alerts ?? true,
        daily_sales_report: settings?.daily_sales_report ?? true,
        system_updates: settings?.system_updates ?? false,
        audit_alerts: settings?.audit_alerts ?? true,
        email_notifications: settings?.email_notifications ?? [],
      });
    } catch (error) {
      message.error('Failed to fetch settings');
    }
  };

  const fetchBackups = async () => {
    try {
      const backups = await settingsApi.getBackups();
      setBackupList(backups);
    } catch (error) {
      message.error('Failed to fetch backups');
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const status = await settingsApi.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchesApi.getBranches(false);
      setBranches(data);
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
      const blob = await settingsApi.downloadBackup(filename);
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
      label: (
        <span>
          <UserOutlined /> Profile
        </span>
      ),
      children: (
        <div className="max-w-3xl">
          <Alert
            showIcon
            type="info"
            icon={<InfoCircleOutlined />}
            message="Profile section"
            description="This area stores your personal account information. Update these details so your system records, user identity and contact information remain correct."
            className="mb-4"
          />

          <Card
            size="small"
            title="Personal Information"
            extra={<Text type="secondary">Visible on your account</Text>}
          >
            <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="full_name"
                    label="Full Name"
                    extra="Your full display name used in the system."
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input placeholder="Enter full name" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    extra="Used for account communication and notifications."
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Invalid email format' },
                    ]}
                  >
                    <Input placeholder="Enter email address" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="phone"
                label="Phone Number"
                extra="Optional contact number for your profile."
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'password',
      label: (
        <span>
          <LockOutlined /> Password
        </span>
      ),
      children: (
        <div className="max-w-3xl">
          <Alert
            showIcon
            type="warning"
            icon={<SafetyOutlined />}
            message="Password security"
            description="Use this section to protect your account. A stronger password reduces the risk of unauthorized access to your business data."
            className="mb-4"
          />

          <Card size="small" title="Change Password">
            <Alert
              message="Password Requirements"
              description="Password should be at least 8 characters and ideally include uppercase letters, lowercase letters, numbers, and a special character."
              type="info"
              showIcon
              className="mb-4"
            />

            <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
              <Form.Item
                name="current_password"
                label="Current Password"
                extra="Enter your existing password first for verification."
                rules={[{ required: true, message: 'Please enter current password' }]}
              >
                <Input.Password placeholder="Current password" />
              </Form.Item>

              <Form.Item
                name="new_password"
                label="New Password"
                extra="Choose a strong password that is hard to guess."
                rules={[
                  { required: true, message: 'Please enter new password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                ]}
              >
                <Input.Password placeholder="New password" />
              </Form.Item>

              <Form.Item
                name="confirm_password"
                label="Confirm New Password"
                extra="Must match the new password exactly."
                dependencies={['new_password']}
                rules={[
                  { required: true, message: 'Please confirm new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'branches',
      label: (
        <span>
          <ShopOutlined /> Branches
        </span>
      ),
      children: (
        <div>
          <Alert
            showIcon
            type="info"
            message="Branch Management"
            description="Manage all your business locations here. Each branch can have its own stock, users, and sales records while sharing products and company settings."
            className="mb-4"
          />

          <Card
            title="Business Branches"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openBranchModal()}
              >
                Add Branch
              </Button>
            }
          >
            <Paragraph type="secondary" className="mb-4">
              This table shows all branches under your company. Click "Add Branch" to create a new location.
              Each branch requires a unique code and name.
            </Paragraph>

            <Alert
              showIcon
              type="info"
              className="mb-4"
              message="Branch Features"
              description="• Each branch maintains its own inventory • Users can be assigned to specific branches • Sales are tracked per branch • Stock can be transferred between branches"
            />

            <Table
              columns={branchColumns}
              dataSource={branches}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> Notifications
        </span>
      ),
      children: (
        <div className="max-w-3xl">
          <Alert
            showIcon
            type="info"
            message="Notification controls"
            description="Choose which important events should alert you. This helps managers respond quickly to stock issues, sales activity, updates, and suspicious actions."
            className="mb-4"
          />

          <Card size="small" title="Notification Preferences">
            <Form form={notificationForm} layout="vertical" onFinish={handleUpdateNotifications}>
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    name: 'low_stock_alerts',
                    title: 'Low Stock Alerts',
                    description: 'Warns you when product quantity falls below the low stock threshold.',
                    defaultValue: true,
                  },
                  {
                    name: 'daily_sales_report',
                    title: 'Daily Sales Report',
                    description: 'Sends a daily summary of sales activity for review and monitoring.',
                    defaultValue: true,
                  },
                  {
                    name: 'system_updates',
                    title: 'System Updates',
                    description: 'Lets you know when the system has maintenance or important updates.',
                    defaultValue: false,
                  },
                  {
                    name: 'audit_alerts',
                    title: 'Audit Alerts',
                    description: 'Flags suspicious activity or important changes in the system.',
                    defaultValue: true,
                  },
                ]}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Form.Item
                        name={item.name}
                        valuePropName="checked"
                        noStyle
                        key={item.name}
                      >
                        <Switch defaultChecked={item.defaultValue} />
                      </Form.Item>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.title}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />

              <Divider />

              <Form.Item
                name="email_notifications"
                label="Notification Email Recipients"
                extra="Enter one or more email addresses that should receive system alerts and reports."
              >
                <Select
                  mode="tags"
                  placeholder="Enter email addresses"
                  tokenSeparators={[',', ' ']}
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Save Notification Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'system',
      label: (
        <span>
          <AppstoreOutlined /> System
        </span>
      ),
      children: (
        <div className="max-w-4xl">
          <Alert
            showIcon
            type="info"
            message="System configuration"
            description="This section controls how your business system behaves. These settings affect company identity, currency, stock warnings, date/time display and operational rules."
            className="mb-4"
          />

          <Card
            size="small"
            title="Business Preferences"
            extra={<Text type="secondary">Core system behavior</Text>}
          >
            <Form form={systemForm} layout="vertical" onFinish={handleUpdateSettings}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="company_name"
                    label="Company Name"
                    extra="Displayed in reports, invoices and system identity."
                  >
                    <Input placeholder="Enter company name" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="tax_rate"
                    label="Tax Rate (%)"
                    extra="Default tax percentage used in calculations."
                  >
                    <InputNumber min={0} max={100} step={0.1} className="w-full" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="currency"
                    label="Currency"
                    extra="Main currency used across reports, totals, and pricing displays."
                  >
                    <Select>
                      <Option value="TZS">Tanzanian Shilling (TZS)</Option>
                      <Option value="USD">US Dollar (USD)</Option>
                      <Option value="EUR">Euro (EUR)</Option>
                      <Option value="KES">Kenyan Shilling (KES)</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="low_stock_threshold"
                    label="Low Stock Threshold"
                    extra="When stock goes below this number, the system marks it as low stock."
                  >
                    <InputNumber min={1} max={1000} className="w-full" />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                type="success"
                showIcon
                className="mb-4"
                message="Recommended for your business"
                description="For a Tanzania-based business, set currency to TZS and use DD/MM/YYYY with 24-hour time format."
              />

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="date_format"
                    label="Date Format"
                    extra="Controls how dates appear across the system."
                  >
                    <Select>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="time_format"
                    label="Time Format"
                    extra="Choose whether system time appears in 12-hour or 24-hour format."
                  >
                    <Select>
                      <Option value="12">12-hour (AM/PM)</Option>
                      <Option value="24">24-hour</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="session_timeout"
                    label="Session Timeout (minutes)"
                    extra="Automatically logs users out after inactivity for security."
                  >
                    <InputNumber min={5} max={480} className="w-full" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="auto_backup"
                    label="Auto Backup"
                    valuePropName="checked"
                    extra="When enabled, the system creates backups automatically."
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="enable_audit_log"
                    label="Enable Audit Log"
                    valuePropName="checked"
                    extra="Tracks important actions performed by users in the system."
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="maintenance_mode"
                    label="Maintenance Mode"
                    valuePropName="checked"
                    extra="Temporarily limits normal use while system maintenance is performed."
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Save System Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'database',
      label: (
        <span>
          <DatabaseOutlined /> Database
        </span>
      ),
      children: (
        <div className="max-w-6xl">
          <Alert
            showIcon
            type="warning"
            message="Database tools section"
            description="This section contains advanced tools for synchronization, backups and maintenance. These actions affect your stored data, so users should understand each block before using it."
            className="mb-4"
          />

          <Card
            title="Sync Status"
            className="mb-4"
            extra={<Text type="secondary">Data transfer overview</Text>}
          >
            <Paragraph type="secondary">
              This block shows the state of data synchronization. It tells you when the last sync happened, how many
              records are still waiting, and whether the system is fully synchronized.
            </Paragraph>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic
                    title="Last Sync"
                    value={
                      syncStatus?.last_sync
                        ? dayjs(syncStatus.last_sync).format('DD MMM YYYY, HH:mm')
                        : 'Never'
                    }
                  />
                  <Text type="secondary">Most recent successful synchronization time.</Text>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic
                    title="Pending Records"
                    value={syncStatus?.pending_records || 0}
                    valueStyle={{ color: syncStatus?.pending_records ? '#cf1322' : '#3f8600' }}
                  />
                  <Text type="secondary">Number of unsynced records waiting to be processed.</Text>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic
                    title="Status"
                    value={syncStatus?.status || 'Unknown'}
                    valueStyle={{ color: syncStatus?.status === 'synced' ? '#3f8600' : '#cf1322' }}
                  />
                  <Text type="secondary">Current overall sync health of the system.</Text>
                </Card>
              </Col>
            </Row>

            <Button
              type="primary"
              icon={<SyncOutlined spin={syncLoading} />}
              onClick={handleSyncData}
              loading={syncLoading}
              className="mt-4"
              block
            >
              Sync Now
            </Button>
          </Card>

          <Card
            title="Backup Management"
            className="mb-4"
            extra={<Text type="secondary">Protection and recovery</Text>}
          >
            <Paragraph type="secondary">
              Backups protect your business data. The table below shows every backup file, its size, when it was created,
              whether it was automatic or manual, and the actions available for each backup.
            </Paragraph>

            <Alert
              showIcon
              type="info"
              className="mb-4"
              message="Table guide"
              description="Backup File = stored file name, Size = file storage used, Type = manual or automatic backup, Created On = backup date/time, Actions = download, restore or delete."
            />

            <div className="mb-4 flex flex-wrap gap-2">
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={() => setBackupModal(true)}
              >
                Create Backup
              </Button>

              <Button
                icon={<DownloadOutlined />}
                onClick={() => setRestoreModal(true)}
              >
                Open Restore List
              </Button>

              <Button icon={<ReloadOutlined />} onClick={fetchBackups}>
                Refresh Backup List
              </Button>
            </div>

            <Table
              columns={backupColumns}
              dataSource={backupList}
              rowKey="filename"
              pagination={false}
              size="middle"
              scroll={{ x: 900 }}
            />
          </Card>

          <Card
            title="Maintenance Tools"
            extra={<Text type="secondary">Performance and cleanup</Text>}
          >
            <Paragraph type="secondary">
              These tools help keep the database healthy. Optimization improves performance, while log cleanup removes
              older audit data that may no longer be needed.
            </Paragraph>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" className="h-full">
                  <Button
                    type="default"
                    icon={<WarningOutlined />}
                    onClick={handleOptimizeDatabase}
                    loading={optimizing}
                    block
                    className="mb-2"
                  >
                    Optimize Database
                  </Button>
                  <Text type="secondary">
                    Reorganizes and cleans database structures for better speed and performance.
                  </Text>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card size="small" className="h-full">
                  <Button
                    type="default"
                    icon={<DeleteOutlined />}
                    onClick={() => handleCleanLogs(30)}
                    loading={cleaningLogs}
                    block
                    className="mb-2"
                  >
                    Clean Old Logs (30+ days)
                  </Button>
                  <Text type="secondary">
                    Removes audit logs older than 30 days to reduce storage use and keep records cleaner.
                  </Text>
                </Card>
              </Col>
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

      {/* Branch Modal */}
      <Modal
        title={editingBranch ? "Edit Branch" : "Add New Branch"}
        open={branchModal}
        onCancel={() => {
          setBranchModal(false);
          setEditingBranch(null);
          branchForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={branchForm}
          layout="vertical"
          onFinish={handleCreateBranch}
        >
          <Alert
            showIcon
            type="info"
            message="Branch Information"
            description="Each branch needs a unique code and name. The code is used for quick identification across the system."
            className="mb-4"
          />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="code"
                label="Branch Code"
                extra="Unique identifier (e.g., MAIN, DOWNTOWN, AIRPORT)"
                rules={[
                  { required: true, message: 'Please enter branch code' },
                  { max: 20, message: 'Code must be less than 20 characters' }
                ]}
              >
                <Input placeholder="e.g., BR001" disabled={!!editingBranch} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Branch Name"
                extra="Full branch name"
                rules={[{ required: true, message: 'Please enter branch name' }]}
              >
                <Input placeholder="e.g., Downtown Branch" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Location / Address"
            extra="Physical address of the branch"
          >
            <Input.TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="contact_person"
                label="Contact Person"
                extra="Branch manager or primary contact"
              >
                <Input placeholder="Full name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                extra="Branch contact number"
              >
                <Input placeholder="e.g., 0712345678" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email Address"
                extra="Branch email for communications"
                rules={[{ type: 'email', message: 'Invalid email format' }]}
              >
                <Input placeholder="branch@example.com" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="opening_date"
                label="Opening Date"
                extra="When the branch started operations"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="is_active"
            label="Active Status"
            valuePropName="checked"
            extra="Inactive branches won't be available for sales"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => {
                setBranchModal(false);
                setEditingBranch(null);
                branchForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={branchLoading}>
                {editingBranch ? 'Update Branch' : 'Create Branch'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create Backup"
        open={backupModal}
        onCancel={() => setBackupModal(false)}
        onOk={handleCreateBackup}
        okText="Create Backup"
        confirmLoading={backupLoading}
      >
        <Paragraph>
          This action creates a complete snapshot of your database so you can restore it later if anything goes wrong.
        </Paragraph>

        <Text strong>Backup includes:</Text>
        <ul className="list-disc pl-6 text-gray-600 mt-2">
          <li>All user data and permissions</li>
          <li>Products and inventory records</li>
          <li>Sales and transaction history</li>
          <li>Expenses and financial records</li>
          <li>System settings and configurations</li>
        </ul>

        <Alert
          message="Storage note"
          description="The backup file will be saved in the data/backups directory."
          type="info"
          showIcon
          className="mt-4"
        />
      </Modal>

      <Modal
        title="Restore from Backup"
        open={restoreModal}
        onCancel={() => setRestoreModal(false)}
        footer={null}
        width={1000}
      >
        <Paragraph type="secondary">
          Choose a backup carefully. Restoring replaces the current database state with the selected backup version.
        </Paragraph>

        <Table
          columns={backupColumns}
          dataSource={backupList}
          rowKey="filename"
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Modal>
    </div>
  );
};

export default Settings;