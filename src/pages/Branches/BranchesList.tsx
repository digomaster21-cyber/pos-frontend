// frontend/src/pages/Branches/BranchesList.tsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { branchesApi } from '../../services/branches';
import { Branch } from '../../types';
import dayjs from 'dayjs';

const BranchesList: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
    fetchStats();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await branchesApi.getBranches(false, searchText || undefined);
      setBranches(data);
    } catch (error) {
      message.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await branchesApi.getBranchStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await branchesApi.deleteBranch(id);
      message.success('Branch deleted successfully');
      fetchBranches();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete branch');
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      await branchesApi.toggleBranchStatus(branch.id, !branch.is_active);
      message.success(`Branch ${!branch.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchBranches();
    } catch (error) {
      message.error('Failed to update branch status');
    }
  };

  const columns = [
    {
      title: 'Branch',
      key: 'branch',
      render: (_: any, record: Branch) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{record.name}</span>
          <small className="text-gray-500">Code: {record.code}</small>
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined className="text-gray-400" />
          {text}
        </Space>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: any, record: Branch) => (
        <Space direction="vertical" size={0}>
          {record.contact_person && (
            <span>{record.contact_person}</span>
          )}
          <Space>
            {record.phone && (
              <Tooltip title={record.phone}>
                <PhoneOutlined className="text-blue-500" />
              </Tooltip>
            )}
            {record.email && (
              <Tooltip title={record.email}>
                <MailOutlined className="text-green-500" />
              </Tooltip>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Opening Date',
      dataIndex: 'opening_date',
      key: 'opening_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active: boolean) => (
        <Tag color={is_active ? 'green' : 'red'}>
          {is_active ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: any, record: Branch) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedBranch(record);
                setDetailsModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/branches/${record.id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title={record.is_active ? 'Deactivate branch' : 'Activate branch'}
            description={`Are you sure you want to ${record.is_active ? 'deactivate' : 'activate'} this branch?`}
            onConfirm={() => handleToggleStatus(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title={record.is_active ? 'Deactivate' : 'Activate'}>
              <Button
                type="text"
                danger={record.is_active}
              >
                {record.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </Tooltip>
          </Popconfirm>
          <Popconfirm
            title="Delete branch"
            description="Are you sure you want to permanently delete this branch?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {stats && (
        <Row gutter={16} className="mb-4">
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Branches"
                value={stats.total_branches}
                prefix={<BankOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Active Branches"
                value={stats.active_branches}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Users"
                value={stats.total_users}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title={
          <Space>
            <span className="text-xl font-bold">Branch Management</span>
            <Badge count={branches.length} showZero color="blue" />
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/branches/new')}
          >
            Add Branch
          </Button>
        }
        className="shadow-md"
      >
        <div className="mb-4 flex gap-4">
          <Input
            placeholder="Search by name, code, or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={fetchBranches}
            prefix={<SearchOutlined />}
            className="max-w-md"
            allowClear
          />
          
          <Button icon={<ReloadOutlined />} onClick={fetchBranches}>
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={branches}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} branches`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Branch Details"
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailsModal(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedBranch && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">{selectedBranch.name}</h3>
              <p className="text-gray-600">Code: {selectedBranch.code}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium">{selectedBranch.location}</p>
              </div>
              <div>
                <p className="text-gray-500">Opening Date</p>
                <p className="font-medium">{dayjs(selectedBranch.opening_date).format('MMMM DD, YYYY')}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500">Contact Person</p>
              <p className="font-medium">{selectedBranch.contact_person || 'N/A'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium">{selectedBranch.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium">{selectedBranch.email || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <Tag color={selectedBranch.is_active ? 'green' : 'red'}>
                {selectedBranch.is_active ? 'ACTIVE' : 'INACTIVE'}
              </Tag>
            </div>

            <div>
              <p className="text-gray-500">Created At</p>
              <p className="font-medium">{dayjs(selectedBranch.created_at).format('MMMM DD, YYYY HH:mm')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BranchesList;