import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, DatePicker, Select, message, Popconfirm, Card, Row, Col, Tag, Typography, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { expensesApi, type Expense } from '../api/expenses';

const { Title } = Typography;
const { Option } = Select;

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [form] = Form.useForm();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await expensesApi.getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error);
      message.error(error?.response?.data?.detail || 'Failed to fetch expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        branch_id: values.branch_id ? Number(values.branch_id) : null,
        category: values.category,
        subcategory: values.subcategory,
        amount: Number(values.amount),
        description: values.description,
        expense_date: values.expense_date.format('YYYY-MM-DD'),
        paid_to: values.paid_to,
        payment_method: values.payment_method,
      };

      if (editingExpense) {
        await expensesApi.updateExpense(editingExpense.id, payload);
        message.success('Expense updated successfully');
      } else {
        await expensesApi.createExpense(payload);
        message.success('Expense created successfully');
      }

      setModalVisible(false);
      setEditingExpense(null);
      form.resetFields();
      fetchExpenses();
    } catch (error: any) {
      console.error('Failed to save expense:', error);
      message.error(error?.response?.data?.detail || 'Failed to save expense');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await expensesApi.deleteExpense(id);
      message.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
      message.error(error?.response?.data?.detail || 'Failed to delete expense');
    }
  };

  const handleEdit = (record: Expense) => {
    setEditingExpense(record);
    form.setFieldsValue({
      branch_id: record.branch_id,
      category: record.category,
      subcategory: record.subcategory,
      amount: record.amount,
      description: record.description,
      expense_date: record.expense_date ? dayjs(record.expense_date) : null,
      paid_to: record.paid_to,
      payment_method: record.payment_method,
    });
    setModalVisible(true);
  };

  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const columns: ColumnsType<Expense> = [
    {
      title: 'Expense No',
      dataIndex: 'expense_no',
      key: 'expense_no',
      width: 150,
      render: (text) => <Tag color="blue">{text || '-'}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'expense_date',
      key: 'expense_date',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (text) => <Tag color="cyan">{text || '-'}</Tag>,
    },
    {
      title: 'Amount (TSh)',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount) => (
        <span style={{ color: '#cf1322', fontWeight: 600 }}>
          {Number(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Paid To',
      dataIndex: 'paid_to',
      key: 'paid_to',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        if (status === 'approved') return <Tag color="green">Approved</Tag>;
        if (status === 'rejected') return <Tag color="red">Rejected</Tag>;
        return <Tag color="orange">Pending</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedExpense(record)} />
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Expenses" value={totalAmount} prefix="TSh" precision={0} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Count" value={expenses.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Pending Approval" value={expenses.filter(e => e.status === 'pending').length} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}><DollarOutlined /> Expenses</Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchExpenses} loading={loading}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingExpense(null); form.resetFields(); setModalVisible(true); }}>
              Add Expense
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={expenses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (total) => `Total ${total} expenses` }}
        />
      </Card>

      <Modal
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingExpense(null); form.resetFields(); }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category">
              <Option value="Rent">Rent</Option>
              <Option value="Salary">Salary</Option>
              <Option value="Utilities">Utilities</Option>
              <Option value="Supplies">Supplies</Option>
              <Option value="Transport">Transport</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Enter amount" />
          </Form.Item>

          <Form.Item name="expense_date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Form.Item name="paid_to" label="Paid To">
            <Input placeholder="Recipient name" />
          </Form.Item>

          <Form.Item name="payment_method" label="Payment Method">
            <Select placeholder="Select method">
              <Option value="cash">Cash</Option>
              <Option value="bank_transfer">Bank Transfer</Option>
              <Option value="mobile_payment">Mobile Payment</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Save</Button>
              <Button onClick={() => { setModalVisible(false); form.resetFields(); }}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Expense Details" open={viewModalVisible && !!selectedExpense} onCancel={() => setViewModalVisible(false)} footer={null}>
        {selectedExpense && (
          <div>
            <p><strong>No:</strong> {selectedExpense.expense_no}</p>
            <p><strong>Date:</strong> {dayjs(selectedExpense.expense_date).format('DD/MM/YYYY')}</p>
            <p><strong>Category:</strong> {selectedExpense.category}</p>
            <p><strong>Amount:</strong> TSh {selectedExpense.amount.toLocaleString()}</p>
            <p><strong>Description:</strong> {selectedExpense.description}</p>
            <p><strong>Paid To:</strong> {selectedExpense.paid_to || '-'}</p>
            <p><strong>Status:</strong> {selectedExpense.status || 'pending'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExpensesPage;