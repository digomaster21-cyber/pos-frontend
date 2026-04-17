import React, { useEffect, useMemo, useState } from 'react';
import inventoryApi, {
  InventoryItem,
  CreateProductPayload,
  StockMovementPayload,
} from '../api/inventory';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { storage } from '../utils/storage';

export const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  const [newProduct, setNewProduct] = useState<CreateProductPayload>({
    sku: '',
    name: '',
    category: '',
    description: '',
    unit: 'pcs',
    selling_price: 0,
    current_avg_cost: 0,
    min_stock_level: 5,
    max_stock_level: 100,
    branch_id: 1,
    initial_quantity: 0,
  });

  const [stockAdjustment, setStockAdjustment] = useState<StockMovementPayload>({
    product_id: 0,
    branch_id: 1,
    quantity_change: 0,
    movement_type: 'adjustment',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const branchId = storage.getBranchId();
      
      const [stockData, categoryData] = await Promise.all([
        inventoryApi.getStock({ 
          low_stock_only: lowStockOnly,
          branch_id: branchId ? Number(branchId) : 1
        }),
        inventoryApi.getProductCategories(),
      ]);

      setInventory(stockData);
      setCategories(categoryData.categories || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lowStockOnly]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = !category || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [inventory, search, category]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await inventoryApi.createProduct({
        ...newProduct,
        selling_price: Number(newProduct.selling_price),
        current_avg_cost: Number(newProduct.current_avg_cost || 0),
        min_stock_level: Number(newProduct.min_stock_level || 0),
        max_stock_level: Number(newProduct.max_stock_level || 0),
        initial_quantity: Number(newProduct.initial_quantity || 0),
        branch_id: Number(newProduct.branch_id || 1),
      });

      setShowCreateModal(false);
      setNewProduct({
        sku: '',
        name: '',
        category: '',
        description: '',
        unit: 'pcs',
        selling_price: 0,
        current_avg_cost: 0,
        min_stock_level: 5,
        max_stock_level: 100,
        branch_id: 1,
        initial_quantity: 0,
      });

      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const openAdjustModal = (product: InventoryItem) => {
    setSelectedProduct(product);
    setStockAdjustment({
      product_id: product.id,
      branch_id: 1,
      quantity_change: 0,
      movement_type: 'adjustment',
      notes: '',
    });
    setShowAdjustModal(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await inventoryApi.adjustStock({
        ...stockAdjustment,
        quantity_change: Number(stockAdjustment.quantity_change),
        branch_id: Number(stockAdjustment.branch_id),
      });

      setShowAdjustModal(false);
      setSelectedProduct(null);

      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const totalStockValue = filteredInventory.reduce(
    (sum, item) => sum + (item.stock_value || 0),
    0
  );

  const totalUnits = filteredInventory.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <Card>
        <CardHeader>
          <h2>Inventory</h2>
          <p>Manage products and stock levels</p>
        </CardHeader>

        <CardContent>
          <div style={{ display: 'grid', gap: '12px' }}>
            {/* Stats Cards */}
            <div
              style={{
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              }}
            >
              <Card>
                <CardContent>
                  <strong>Total Products</strong>
                  <div>{filteredInventory.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <strong>Total Units</strong>
                  <div>{totalUnits}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <strong>Total Stock Value</strong>
                  <div>TZS {totalStockValue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <strong>Low Stock Items</strong>
                  <div>
                    {filteredInventory.filter((item) => item.stock_status === 'Low').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div
              style={{
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                alignItems: 'end',
              }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Search
                </label>
                <Input
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by product name or SKU"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 8 }}
                >
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Low Stock Filter
                </label>
                <div>
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                  />{' '}
                  Show only low stock items
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={() => setShowCreateModal(true)}>Add Product</Button>
                <Button onClick={loadData}>Refresh</Button>
              </div>
            </div>

            {error ? (
              <div
                style={{
                  color: '#b91c1c',
                  background: '#fee2e2',
                  padding: '10px 12px',
                  borderRadius: 8,
                }}
              >
                {error}
              </div>
            ) : null}

            {/* Inventory Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th align="left">SKU</th>
                    <th align="left">Name</th>
                    <th align="left">Category</th>
                    <th align="left">Qty</th>
                    <th align="left">Buying Price</th>
                    <th align="left">Selling Price</th>
                    <th align="left">Profit / Unit</th>
                    <th align="left">Stock Value</th>
                    <th align="left">Status</th>
                    <th align="left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const profitPerUnit =
                      Number(item.selling_price || 0) - Number(item.current_avg_cost || 0);

                    return (
                      <tr key={item.id}>
                        <td>{item.sku}</td>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>TZS {Number(item.current_avg_cost || 0).toLocaleString()}</td>
                        <td>TZS {Number(item.selling_price || 0).toLocaleString()}</td>
                        <td
                          style={{
                            color: profitPerUnit >= 0 ? 'green' : 'red',
                            fontWeight: 600,
                          }}
                        >
                          TZS {profitPerUnit.toLocaleString()}
                        </td>
                        <td>TZS {Number(item.stock_value || 0).toLocaleString()}</td>
                        <td>{item.stock_status}</td>
                        <td>
                          <Button onClick={() => openAdjustModal(item)}>
                            Adjust Stock
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '20px' }}>
                        No inventory found
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Product Modal */}
      <Modal
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        title="Create Product"
      >
        <form onSubmit={handleCreateProduct}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Form fields - keep your existing form fields here */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>SKU</label>
              <Input
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Product Name</label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Category</label>
              <Input
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Selling Price</label>
              <Input
                type="number"
                value={newProduct.selling_price}
                onChange={(e) => setNewProduct({ ...newProduct, selling_price: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Buying Price</label>
              <Input
                type="number"
                value={newProduct.current_avg_cost}
                onChange={(e) => setNewProduct({ ...newProduct, current_avg_cost: Number(e.target.value) })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Initial Quantity</label>
              <Input
                type="number"
                value={newProduct.initial_quantity}
                onChange={(e) => setNewProduct({ ...newProduct, initial_quantity: Number(e.target.value) })}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        open={showAdjustModal}
        onCancel={() => setShowAdjustModal(false)}
        title={`Adjust Stock${selectedProduct ? ` - ${selectedProduct.name}` : ''}`}
      >
        <form onSubmit={handleAdjustStock}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Quantity Change</label>
              <Input
                type="number"
                value={stockAdjustment.quantity_change}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity_change: Number(e.target.value) })}
                placeholder="Positive to add, negative to remove"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Movement Type</label>
              <Input
                value={stockAdjustment.movement_type}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, movement_type: e.target.value })}
                placeholder="adjustment, damage, return, etc."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Notes</label>
              <Input
                value={stockAdjustment.notes || ''}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, notes: e.target.value })}
                placeholder="Reason for adjustment"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;