import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  message,
  Row,
  Col,
  Switch,
  Tabs,
  Checkbox,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { usersApi } from '../../services/users';
import { rolesApi } from '../../services/roles';
import { permissionsApi } from '../../services/permissions';
import { branchesApi } from '../../services/branches';
import { Role, Permission, Branch } from '../../types';

const { Option } = Select;

const UserForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    await Promise.all([fetchRoles(), fetchBranches(), fetchPermissions()]);
    if (isEdit) {
      await fetchUser();
    }
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const user = await usersApi.getUser(Number(id));

      form.setFieldsValue({
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch_id: user.branch_id,
        is_active: user.is_active,
      });

      const userWithPermissions = user as typeof user & {
        permissions?: Permission[];
      };

      setSelectedPermissions(userWithPermissions.permissions?.map((p) => p.id) || []);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch user details');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await rolesApi.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      message.error('Failed to load roles');
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchesApi.getBranches(true);
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      message.error('Failed to load branches');
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await permissionsApi.getPermissionsByModule();
      setPermissions(data || {});
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      message.error('Failed to load permissions');
    }
  };

  const onFinish = async (values: {
    username: string;
    password?: string;
    confirm_password?: string;
    full_name: string;
    email: string;
    phone?: string;
    role: string;
    branch_id?: number;
    is_active?: boolean;
  }) => {
    setLoading(true);
    try {
      if (isEdit) {
        await usersApi.updateUser(Number(id), {
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          role: values.role,
          branch_id: values.branch_id,
          is_active: values.is_active,
          permissions: selectedPermissions,
        });
        message.success('User updated successfully');
      } else {
        if (!values.password) {
          message.error('Password is required');
          setLoading(false);
          return;
        }

        await usersApi.createUser({
          username: values.username,
          password: values.password,
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          role: values.role,
          branch_id: values.branch_id,
          permissions: selectedPermissions,
        });
        message.success('User created successfully');
      }

      navigate('/users');
    } catch (error: any) {
      console.error(error);
      message.error(error?.response?.data?.detail || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleName: string) => {
    const selectedRole = roles.find((r) => r.name === roleName);
    if (selectedRole?.permissions) {
      setSelectedPermissions(selectedRole.permissions.map((p) => p.id));
    }
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="p-6">
      <Card
        loading={loading}
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/users')}
            >
              Back
            </Button>
            <span className="text-xl font-bold ml-4">
              {isEdit ? 'Edit User' : 'New User'}
            </span>
          </Space>
        }
        className="shadow-md"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: (
                <span>
                  <UserOutlined /> Basic Information
                </span>
              ),
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={{
                    is_active: true,
                  }}
                  className="max-w-2xl"
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: 'Username is required' }]}
                      >
                        <Input
                          placeholder="Enter username"
                          disabled={isEdit}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="full_name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Full name is required' }]}
                      >
                        <Input placeholder="Enter full name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Email is required' },
                          { type: 'email', message: 'Invalid email format' },
                        ]}
                      >
                        <Input placeholder="Enter email" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="phone" label="Phone">
                        <Input placeholder="Enter phone number" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {!isEdit && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="password"
                          label="Password"
                          rules={[{ required: true, message: 'Password is required' }]}
                        >
                          <Input.Password placeholder="Enter password" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="confirm_password"
                          label="Confirm Password"
                          dependencies={['password']}
                          rules={[
                            { required: true, message: 'Please confirm password' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password placeholder="Confirm password" />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select role' }]}
                      >
                        <Select
                          placeholder="Select role"
                          onChange={handleRoleChange}
                        >
                          {roles.map((role) => (
                            <Option key={role.id} value={role.name}>
                              {role.name.toUpperCase().replace(/_/g, ' ')}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="branch_id" label="Branch">
                        <Select
                          placeholder="Select branch (optional)"
                          allowClear
                        >
                          {branches.map((branch) => (
                            <Option key={branch.id} value={branch.id}>
                              {branch.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {isEdit && (
                    <Form.Item
                      name="is_active"
                      label="Status"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                      />
                    </Form.Item>
                  )}

                  <Form.Item className="mt-6">
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => setActiveTab('permissions')}
                      >
                        Next: Permissions
                      </Button>
                      <Button onClick={() => navigate('/users')}>
                        Cancel
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'permissions',
              label: (
                <span>
                  <SafetyOutlined /> Permissions
                </span>
              ),
              disabled: !form.getFieldValue('role'),
              children: (
                <>
                  <div className="mb-4">
                    <Button
                      type="primary"
                      onClick={() => form.submit()}
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      {isEdit ? 'Update User' : 'Create User'}
                    </Button>
                  </div>

                  {Object.entries(permissions).map(([module, perms]) => (
                    <Card key={module} title={module} className="mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {perms.map((perm) => (
                          <Checkbox
                            key={perm.id}
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                          >
                            <div>
                              <div className="font-medium">{perm.name}</div>
                              <small className="text-gray-500">
                                {perm.description}
                              </small>
                            </div>
                          </Checkbox>
                        ))}
                      </div>
                    </Card>
                  ))}
                </>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default UserForm;