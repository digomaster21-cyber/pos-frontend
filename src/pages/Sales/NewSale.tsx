// frontend/src/pages/Sales/NewSale.tsx
import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  message,
  Row,
  Col,
  Table,
  Modal,
  Descriptions,
  Divider,

} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { salesApi } from '../../services/sales';
import { productsApi } from '../../services/products';
import { Product } from '../../types';

const { Option } = Select;

interface CartItem {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total: number;
  profit: number;
  available_stock: number;
}

const NewSale: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [productModal, setProductModal] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchBranches();
    form.setFieldsValue({
      sale_date: dayjs().format('YYYY-MM-DD'),
      payment_method: 'cash',
    });
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.getProducts(true);
      setProducts(data);
    } catch (error) {
      message.error('Failed to fetch products');
    }
  };

  const fetchBranches = async () => {
    try {
      const { branchesApi } = await import('../../services/branches');
      const data = await branchesApi.getBranches(true);
      setBranches(data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      message.warning('Please select a product');
      return;
    }

    const availableStock = selectedProduct.stock_quantity || 0;
    if (quantity > availableStock) {
      message.error(`Only ${availableStock} items available in stock`);
      return;
    }

    const existingItem = cart.find(item => item.product_id === selectedProduct.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > availableStock) {
        message.error(`Total quantity would exceed available stock (${availableStock})`);
        return;
      }
      
      setCart(cart.map(item => 
        item.product_id === selectedProduct.id
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.unit_price,
              profit: newQuantity * (item.unit_price - item.unit_cost),
            }
          : item
      ));
    } else {
      const newItem: CartItem = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        sku: selectedProduct.sku,
        quantity: quantity,
        unit_price: selectedProduct.selling_price,
        unit_cost: selectedProduct.current_avg_cost || 0,
        total: quantity * selectedProduct.selling_price,
        profit: quantity * (selectedProduct.selling_price - (selectedProduct.current_avg_cost || 0)),
        available_stock: availableStock,
      };
      setCart([...cart, newItem]);
    }

    setSelectedProduct(null);
    setQuantity(1);
    setProductModal(false);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const totalProfit = cart.reduce((sum, item) => sum + item.profit, 0);
    return { subtotal, totalProfit };
  };

  const onFinish = async (values: any) => {
    if (cart.length === 0) {
      message.warning('Please add items to cart');
      return;
    }

    setLoading(true);
    try {
      // Create multiple sales transactions
      for (const item of cart) {
        await salesApi.createSale({
          branch_id: values.branch_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          sale_date: values.sale_date,
          customer_name: values.customer_name,
          payment_method: values.payment_method,
          notes: values.notes,
        });
      }

      message.success('Sale completed successfully');
      navigate('/sales');
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, totalProfit } = calculateTotals();

  const cartColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: number) => `₱${price.toFixed(2)}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `₱${total.toFixed(2)}`,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit: number) => (
        <span className="text-green-600">₱{profit.toFixed(2)}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveFromCart(record.product_id)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/sales')}
            >
              Back
            </Button>
            <span className="text-xl font-bold ml-4">New Sale</span>
          </Space>
        }
        className="shadow-md"
      >
        <Row gutter={16}>
          <Col span={16}>
            <Card
              title="Shopping Cart"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setProductModal(true)}
                >
                  Add Product
                </Button>
              }
              className="mb-4"
            >
              <Table
                columns={cartColumns}
                dataSource={cart}
                rowKey="product_id"
                pagination={false}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>₱{subtotal.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong className="text-green-600">₱{totalProfit.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} />
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Sale Details">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Form.Item
                  name="branch_id"
                  label="Branch"
                  rules={[{ required: true, message: 'Please select branch' }]}
                >
                  <Select placeholder="Select branch">
                    {branches.map(branch => (
                      <Option key={branch.id} value={branch.id}>{branch.name}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="customer_name"
                  label="Customer Name"
                >
                  <Input placeholder="Enter customer name" />
                </Form.Item>

                <Form.Item
                  name="payment_method"
                  label="Payment Method"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="cash">Cash</Option>
                    <Option value="card">Credit/Debit Card</Option>
                    <Option value="gcash">GCash</Option>
                    <Option value="maya">Maya</Option>
                    <Option value="bank_transfer">Bank Transfer</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="sale_date"
                  label="Sale Date"
                  rules={[{ required: true }]}
                >
                  <Input type="date" />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label="Notes"
                >
                  <Input.TextArea rows={3} placeholder="Optional notes" />
                </Form.Item>

                <Divider />

                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Subtotal">
                    ₱{subtotal.toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Profit">
                    <span className="text-green-600">₱{totalProfit.toFixed(2)}</span>
                  </Descriptions.Item>
                </Descriptions>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                  size="large"
                  className="mt-4"
                  disabled={cart.length === 0}
                >
                  Complete Sale
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Select Product"
        open={productModal}
        onCancel={() => setProductModal(false)}
        onOk={handleAddToCart}
        okText="Add to Cart"
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Product" required>
            <Select
              placeholder="Search product by name or SKU"
              showSearch
              optionFilterProp="children"
              value={selectedProduct?.id}
              onChange={(value) => {
                const product = products.find(p => p.id === value);
                setSelectedProduct(product || null);
              }}
              filterOption={(input, option) =>
                (option?.children as any)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name} - {product.sku} (Stock: {product.stock_quantity || 0})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedProduct && (
            <>
              <Descriptions column={2} size="small" className="mb-4">
                <Descriptions.Item label="Price">₱{selectedProduct.selling_price.toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="Available Stock">{selectedProduct.stock_quantity || 0}</Descriptions.Item>
              </Descriptions>

              <Form.Item label="Quantity">
                <InputNumber
                  min={1}
                  max={selectedProduct.stock_quantity || 0}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  className="w-full"
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default NewSale;