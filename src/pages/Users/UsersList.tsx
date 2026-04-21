import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Switch,
  Popconfirm,
  message,
  Row,
  Col,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/users';
import { branchesApi } from '../../services/branches';
import { User, Branch } from '../../types';

const { Title } = Typography;
const { Option } = Select;

const UsersList: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([fetchUsers(), fetchBranches()]);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
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

  const handleDelete = async (id: number) => {
    try {
      await usersApi.deleteUser(id);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      message.error(error?.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleStatusToggle = async (user: User, checked: boolean) => {
    try {
      await usersApi.toggleUserStatus(user.id, checked);
      message.success(`User ${checked ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      message.error(error?.response?.data?.detail || 'Failed to update user status');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchText ||
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (user.phone || '').toLowerCase().includes(searchText.toLowerCase());

      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesBranch = selectedBranch === undefined || user.branch_id === selectedBranch;
      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === 'active' && user.is_active) ||
        (selectedStatus === 'inactive' && !user.is_active);

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [users, searchText, selectedRole, selectedBranch, selectedStatus]);

  const getBranchName = (branchId: number | null) => {
    if (!branchId) return 'All Branches';
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || 'Unknown';
  };

  const formatRole = (role: User['role']) => {
    const roleMap: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      branch_manager: 'Branch Manager',
      cashier: 'Cashier',
    };
    return roleMap[role] || role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.full_name}</div>
          <div className="text-gray-500 text-sm">@{record.username}</div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.email || '-'}</div>
          <div className="text-gray-500 text-sm">{record.phone || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: User['role']) => {
        const colorMap: Record<string, string> = {
          super_admin: 'red',
          admin: 'blue',
          branch_manager: 'purple',
          cashier: 'green',
        };
        return <Tag color={colorMap[role] || 'default'}>{formatRole(role)}</Tag>;
      },
    },
    {
      title: 'Branch',
      dataIndex: 'branch_id',
      key: 'branch_id',
      render: (branchId: number | null) => <Tag color="purple">{getBranchName(branchId)}</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Tag color={record.is_active ? 'green' : 'red'}>
            {record.is_active ? 'ACTIVE' : 'INACTIVE'}
          </Tag>
          <Switch
            size="small"
            checked={record.is_active}
            onChange={(checked) => handleStatusToggle(record, checked)}
          />
        </Space>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (last_login?: string) => {
        if (!last_login) return '-';
        return new Date(last_login).toLocaleString();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/users/${record.id}/edit`)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete User"
            description={`Are you sure you want to delete ${record.full_name}?`}
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'branch_manager', label: 'Branch Manager' },
    { value: 'cashier', label: 'Cashier' },
  ];

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space align="center">
              <UserOutlined style={{ fontSize: 22 }} />
              <Title level={3} style={{ margin: 0 }}>
                Users
              </Title>
            </Space>
          </Col>

          <Col>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
                Refresh
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/users/new')}
              >
                New User
              </Button>
            </Space>
          </Col>
        </Row>

        <div className="mt-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8} lg={8}>
              <Input
                allowClear
                placeholder="Search username, full name, email, phone..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>

            <Col xs={24} md={5} lg={4}>
              <Select
                allowClear
                placeholder="Filter by role"
                style={{ width: '100%' }}
                value={selectedRole}
                onChange={(value) => setSelectedRole(value)}
              >
                {roleOptions.map((role) => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} md={5} lg={4}>
              <Select
                allowClear
                placeholder="Filter by branch"
                style={{ width: '100%' }}
                value={selectedBranch}
                onChange={(value) => setSelectedBranch(value)}
              >
                {branches.map((branch) => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} md={6} lg={4}>
              <Select
                allowClear
                placeholder="Filter by status"
                style={{ width: '100%' }}
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>

            <Col xs={24} md={24} lg={4}>
              <Button
                block
                onClick={() => {
                  setSearchText('');
                  setSelectedRole(undefined);
                  setSelectedBranch(undefined);
                  setSelectedStatus(undefined);
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </div>

        <div className="mt-6">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            bordered
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} users`,
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default UsersList;