import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Space,
  Card,
  Tag,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { branchesApi, Branch } from '../api/branches';

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form] = Form.useForm();

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await branchesApi.getBranches({ active_only: false });
      setBranches(data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      message.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editingBranch) {
        await branchesApi.updateBranch(editingBranch.id, values);
        message.success('Branch updated successfully');
      } else {
        await branchesApi.createBranch(values);
        message.success('Branch created successfully');
      }
      setModalVisible(false);
      setEditingBranch(null);
      form.resetFields();
      fetchBranches();
    } catch (error: any) {
      console.error('Failed to save branch:', error);
      message.error(error?.response?.data?.detail || 'Failed to save branch');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await branchesApi.deleteBranch(id);
      message.success('Branch deleted successfully');
      fetchBranches();
    } catch (error: any) {
      console.error('Failed to delete branch:', error);
      message.error(error?.response?.data?.detail || 'Failed to delete branch');
    }
  };

  const handleSetAsMainStore = async (id: number) => {
    try {
      await branchesApi.setMainStore(id);
      message.success('Main store set successfully');
      fetchBranches();
    } catch (error: any) {
      console.error('Failed to set main store:', error);
      message.error(error?.response?.data?.detail || 'Failed to set main store');
    }
  };

  const columns: ColumnsType<Branch> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Branch Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <ShopOutlined />
          {text}
          {record.is_main_store && <Tag color="gold">Main Store</Tag>}
        </Space>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingBranch(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          {!record.is_main_store && (
            <Button
              type="link"
              onClick={() => handleSetAsMainStore(record.id)}
            >
              Set as Main
            </Button>
          )}
          <Popconfirm
            title="Delete branch?"
            description="This will also delete all data for this branch"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2>Branch Management</h2>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchBranches} loading={loading}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingBranch(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Branch
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={branches}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editingBranch ? 'Edit Branch' : 'Add Branch'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingBranch(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Branch Name"
            rules={[{ required: true, message: 'Please enter branch name' }]}
          >
            <Input placeholder="e.g., Main Store, Branch A" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Branch Code"
            rules={[{ required: true, message: 'Please enter branch code' }]}
          >
            <Input placeholder="e.g., MAIN, BR001" />
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input placeholder="City, Address" />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="Branch phone number" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input type="email" placeholder="Branch email" />
          </Form.Item>

          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBranch ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BranchesPage;