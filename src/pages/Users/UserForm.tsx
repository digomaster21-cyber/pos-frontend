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
import { usersApi, UserCreate, UserUpdate } from '../../services/users';
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

      console.log('Fetched user:', user);
      console.log('User role:', user.role);

      form.setFieldsValue({
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch_id: user.branch_id,
        is_active: user.is_active,
      });

      // Fetch user permissions separately
      const userPermissions = await permissionsApi.getUserPermissions(Number(id));
      setSelectedPermissions(userPermissions.map((p: Permission) => p.id));
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
      console.log('Fetched roles:', data);
      
      const rolesArray = Array.isArray(data) ? data : [];
      
      // Fetch permissions for each role
      const rolesWithPermissions = await Promise.all(
        rolesArray.map(async (role) => {
          try {
            const rolePermissions = await rolesApi.getRolePermissions(role.id);
            return { ...role, permissions: rolePermissions };
          } catch (error) {
            console.error(`Failed to fetch permissions for role ${role.id}:`, error);
            return { ...role, permissions: [] };
          }
        })
      );
      
      setRoles(rolesWithPermissions);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setRoles([]);
      // Don't show error message to user, just log it
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchesApi.getBranches(true);
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      setBranches([]);
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await permissionsApi.getPermissionsByModule();
      setPermissions(data || {});
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions({});
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Validate password for new user
      if (!isEdit && !values.password) {
        message.error('Password is required');
        setLoading(false);
        return;
      }

      // Validate password match for new user
      if (!isEdit && values.password !== values.confirm_password) {
        message.error('Passwords do not match');
        setLoading(false);
        return;
      }

      if (isEdit) {
        const updateData: UserUpdate = {
          full_name: values.full_name,
          email: values.email,
          phone: values.phone || '',
          role: values.role,
          branch_id: values.branch_id,
          is_active: values.is_active !== undefined ? values.is_active : true,
          permissions: selectedPermissions,
        };

        console.log('Updating user with data:', updateData);
        await usersApi.updateUser(Number(id), updateData);
        message.success('User updated successfully');
      } else {
        const createData: UserCreate = {
          username: values.username,
          password: values.password,
          full_name: values.full_name,
          email: values.email,
          phone: values.phone || '',
          role: values.role,
          branch_id: values.branch_id,
          permissions: selectedPermissions,
        };

        console.log('Creating user with data:', createData);
        await usersApi.createUser(createData);
        message.success('User created successfully');
      }

      navigate('/users');
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to save user';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (roleName: string) => {
    console.log('Role changed to:', roleName);
    const selectedRole = roles.find((r) => r.name === roleName);
    
    if (selectedRole?.permissions && selectedRole.permissions.length > 0) {
      const permissionIds = selectedRole.permissions.map((p) => p.id);
      setSelectedPermissions(permissionIds);
      message.info(`Loaded ${permissionIds.length} permissions from role`);
    } else if (selectedRole) {
      // Try to fetch permissions for this role
      try {
        const rolePermissions = await rolesApi.getRolePermissions(selectedRole.id);
        if (rolePermissions && rolePermissions.length > 0) {
          const permissionIds = rolePermissions.map((p: Permission) => p.id);
          setSelectedPermissions(permissionIds);
          message.info(`Loaded ${permissionIds.length} permissions from role`);
        } else {
          setSelectedPermissions([]);
          message.info('No permissions assigned to this role');
        }
      } catch (error) {
        console.error('Failed to fetch role permissions:', error);
        setSelectedPermissions([]);
      }
    } else {
      setSelectedPermissions([]);
    }
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'branch_manager', label: 'Branch Manager' },
    { value: 'cashier', label: 'Cashier' },
  ];

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
                          {roleOptions.map((role) => (
                            <Option key={role.value} value={role.value}>
                              {role.label}
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
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => form.submit()}
                        loading={loading}
                        icon={<SaveOutlined />}
                      >
                        {isEdit ? 'Update User' : 'Create User'}
                      </Button>
                      <Button onClick={() => setActiveTab('basic')}>
                        Back to Basic Info
                      </Button>
                    </Space>
                  </div>

                  {Object.keys(permissions).length === 0 ? (
                    <Card>
                      <p>No permissions available or failed to load permissions.</p>
                    </Card>
                  ) : (
                    Object.entries(permissions).map(([module, perms]) => (
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
                    ))
                  )}
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