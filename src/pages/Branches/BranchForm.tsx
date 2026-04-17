// frontend/src/pages/Branches/BranchForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  message,
  Row,
  Col,
  Switch,
  DatePicker,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { branchesApi } from '../../services/branches';
import dayjs from 'dayjs';

const BranchForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      fetchBranch();
    } else {
      form.setFieldsValue({
        opening_date: dayjs(),
        is_active: true,
      });
    }
  }, [id]);

  const fetchBranch = async () => {
    setLoading(true);
    try {
      const branch = await branchesApi.getBranch(Number(id));
      form.setFieldsValue({
        ...branch,
        opening_date: dayjs(branch.opening_date),
      });
    } catch (error) {
      message.error('Failed to fetch branch details');
      navigate('/branches');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        opening_date: values.opening_date.format('YYYY-MM-DD'),
      };

      if (isEdit) {
        await branchesApi.updateBranch(Number(id), formattedValues);
        message.success('Branch updated successfully');
      } else {
        await branchesApi.createBranch(formattedValues);
        message.success('Branch created successfully');
      }
      navigate('/branches');
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to save branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/branches')}
            >
              Back
            </Button>
            <span className="text-xl font-bold ml-4">
              {isEdit ? 'Edit Branch' : 'New Branch'}
            </span>
          </Space>
        }
        className="shadow-md"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="max-w-2xl"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Branch Code"
                rules={[{ required: true, message: 'Branch code is required' }]}
              >
                <Input placeholder="e.g., BR-001" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Branch Name"
                rules={[{ required: true, message: 'Branch name is required' }]}
              >
                <Input placeholder="Enter branch name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Location is required' }]}
          >
            <Input.TextArea rows={2} placeholder="Enter complete address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_person"
                label="Contact Person"
              >
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Invalid email format' }]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="opening_date"
                label="Opening Date"
                rules={[{ required: true, message: 'Opening date is required' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          {isEdit && (
            <Form.Item name="is_active" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          )}

          <Form.Item className="mt-6">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                {isEdit ? 'Update Branch' : 'Create Branch'}
              </Button>
              <Button onClick={() => navigate('/branches')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BranchForm;