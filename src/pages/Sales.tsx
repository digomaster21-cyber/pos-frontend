import React, { useEffect, useState } from 'react';
import salesApi, { Sale, SaleCreatePayload } from '../api/sales';
import inventoryApi, { Product } from '../api/inventory';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableStock, setAvailableStock] = useState<number>(0);

  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState<SaleCreatePayload>({
    branch_id: 1,
    product_id: 0,
    quantity: 1,
    unit_price: 0,
    sale_date: today,
    customer_name: '',
    payment_method: 'cash',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [salesData, productsData] = await Promise.all([
        salesApi.getSales({ limit: 100, offset: 0 }),
        inventoryApi.getProducts({ active_only: true }),
      ]);

      setSales(salesData);
      setProducts(productsData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fetchAvailableStock = async (productId: number, branchId: number) => {
    if (!productId || !branchId) {
      setAvailableStock(0);
      return;
    }

    try {
      const stock = await inventoryApi.getStock({
        branch_id: Number(branchId || 1),
      });

      const item = stock.find((s) => s.id === productId);
      setAvailableStock(item?.quantity || 0);
    } catch {
      setAvailableStock(0);
    }
  };

  const handleProductChange = async (productId: number) => {
    const selected = products.find((p) => p.id === productId) || null;
    setSelectedProduct(selected);

    setForm((prev) => ({
      ...prev,
      product_id: productId,
      unit_price: selected?.selling_price || 0,
    }));

    await fetchAvailableStock(productId, Number(form.branch_id || 1));
  };

  const handleBranchChange = async (branchId: number) => {
    setForm((prev) => ({
      ...prev,
      branch_id: branchId,
    }));

    await fetchAvailableStock(Number(form.product_id || 0), branchId);
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await salesApi.createSale({
        ...form,
        branch_id: Number(form.branch_id),
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
      });

      setShowCreateModal(false);
      setSelectedProduct(null);
      setAvailableStock(0);
      setForm({
        branch_id: 1,
        product_id: 0,
        quantity: 1,
        unit_price: 0,
        sale_date: today,
        customer_name: '',
        payment_method: 'cash',
        notes: '',
      });

      setSuccessMessage('Sale created successfully.');
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create sale');
    } finally {
      setSubmitting(false);
    }
  };

  const openCancelModal = (sale: Sale) => {
    setSaleToCancel(sale);
    setCancelReason('');
    setShowCancelModal(true);
    setError('');
    setSuccessMessage('');
  };

  const handleCancelSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!saleToCancel) return;

    if (!cancelReason.trim()) {
      setError('Cancellation reason is required.');
      return;
    }

    setCancelling(true);
    setError('');
    setSuccessMessage('');

    try {
      await salesApi.cancelSale(saleToCancel.id, cancelReason.trim());

      setShowCancelModal(false);
      setSaleToCancel(null);
      setCancelReason('');
      setSuccessMessage('Sale cancelled successfully and stock restored.');
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel sale');
    } finally {
      setCancelling(false);
    }
  };

  const total = Number(form.quantity || 0) * Number(form.unit_price || 0);
  const estimatedProfit = selectedProduct
    ? (Number(form.unit_price || 0) - Number(selectedProduct.current_avg_cost || 0)) *
      Number(form.quantity || 0)
    : 0;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <Card>
        <CardHeader>
          <h2>Sales</h2>
          <p>Record, review, and correct sales transactions</p>
        </CardHeader>

        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <strong>Total Transactions:</strong> {sales.length}
            </div>
            <Button onClick={() => setShowCreateModal(true)}>Create Sale</Button>
          </div>

          {successMessage ? (
            <div
              style={{
                color: '#166534',
                background: '#dcfce7',
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: '12px',
              }}
            >
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                color: '#b91c1c',
                background: '#fee2e2',
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: '12px',
              }}
            >
              {error}
            </div>
          ) : null}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th align="left">Invoice</th>
                  <th align="left">Date</th>
                  <th align="left">Product</th>
                  <th align="left">Qty</th>
                  <th align="left">Unit Price</th>
                  <th align="left">Total</th>
                  <th align="left">Profit</th>
                  <th align="left">Customer</th>
                  <th align="left">Status</th>
                  <th align="left">Notes</th>
                  <th align="left">Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.invoice_no}</td>
                    <td>{sale.sale_date}</td>
                    <td>{sale.product_name || sale.product_id}</td>
                    <td>{sale.quantity}</td>
                    <td>TZS {Number(sale.unit_price || 0).toLocaleString()}</td>
                    <td>TZS {Number(sale.total_price || 0).toLocaleString()}</td>
                    <td style={{ color: Number(sale.profit || 0) >= 0 ? 'green' : 'red' }}>
                      TZS {Number(sale.profit || 0).toLocaleString()}
                    </td>
                    <td>{sale.customer_name || '-'}</td>
                    <td>{sale.status || 'completed'}</td>
                    <td>{sale.notes || '-'}</td>
                    <td>
                      {sale.status === 'cancelled' ? (
                        <Button disabled>Cancelled</Button>
                      ) : (
                        <Button onClick={() => openCancelModal(sale)}>
                          Cancel Sale
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}

                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '20px' }}>
                      No sales found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        title="Create Sale"
      >
        <form onSubmit={handleCreateSale}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Sale Details</h3>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
                Record a sale with stock and profit preview before saving.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Branch ID
              </label>
              <Input
                type="number"
                placeholder="1"
                value={form.branch_id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleBranchChange(Number(e.target.value))
                }
              />
              <small style={{ color: '#6b7280' }}>
                Branch where this sale is being recorded.
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Product
              </label>
              <select
                value={form.product_id}
                onChange={(e) => handleProductChange(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: 8 }}
              >
                <option value={0}>Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
              <small style={{ color: '#6b7280' }}>
                Choose the product you want to sell.
              </small>

              {selectedProduct ? (
                <div
                  style={{
                    marginTop: '10px',
                    background: '#f9fafb',
                    borderRadius: 8,
                    padding: '10px',
                    fontSize: '13px',
                    display: 'grid',
                    gap: '4px',
                  }}
                >
                  <div>
                    <strong>Available Stock:</strong> {availableStock}
                  </div>
                  <div>
                    <strong>Buying Price:</strong>{' '}
                    TZS {Number(selectedProduct.current_avg_cost || 0).toLocaleString()}
                  </div>
                  <div>
                    <strong>Suggested Selling Price:</strong>{' '}
                    TZS {Number(selectedProduct.selling_price || 0).toLocaleString()}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Quantity
              </label>
              <Input
                type="number"
                placeholder="1"
                value={form.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
              />
              <small style={{ color: '#6b7280' }}>
                Number of units being sold.
              </small>

              {form.product_id > 0 && Number(form.quantity || 0) > availableStock ? (
                <div style={{ color: '#b91c1c', marginTop: '6px', fontSize: '13px' }}>
                  Not enough stock. Available: {availableStock}
                </div>
              ) : null}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Selling Price
              </label>
              <Input
                type="number"
                placeholder="0"
                value={form.unit_price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({
                    ...prev,
                    unit_price: Number(e.target.value),
                  }))
                }
              />
              <small style={{ color: '#6b7280' }}>
                Price per unit charged to the customer.
              </small>
            </div>

            <div
              style={{
                background: '#f3f4f6',
                borderRadius: 8,
                padding: '12px',
                display: 'grid',
                gap: '6px',
              }}
            >
              <strong>Sale Preview</strong>
              <div>Total: TZS {Number(total).toLocaleString()}</div>
              <div style={{ color: estimatedProfit >= 0 ? 'green' : 'red' }}>
                Profit: TZS {Number(estimatedProfit).toLocaleString()}
              </div>
              {estimatedProfit < 0 && (
                <div style={{ color: '#b91c1c', fontSize: '13px' }}>
                  ⚠️ You are selling below cost (LOSS)
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Sale Date
              </label>
              <Input
                type="date"
                value={form.sale_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({
                    ...prev,
                    sale_date: e.target.value,
                  }))
                }
              />
              <small style={{ color: '#6b7280' }}>
                Date when the sale happened.
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Customer Name
              </label>
              <Input
                placeholder="Optional customer name"
                value={form.customer_name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({
                    ...prev,
                    customer_name: e.target.value,
                  }))
                }
              />
              <small style={{ color: '#6b7280' }}>
                Optional. Leave blank if not needed.
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Payment Method
              </label>
              <Input
                placeholder="cash, mobile, bank"
                value={form.payment_method || 'cash'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({
                    ...prev,
                    payment_method: e.target.value,
                  }))
                }
              />
              <small style={{ color: '#6b7280' }}>
                Example: cash, mobile money, bank transfer.
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Sale Notes
              </label>
              <Input
                placeholder="Example: customer requested urgent delivery"
                value={form.notes || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
              <small style={{ color: '#6b7280' }}>
                Short explanation before saving the sale. Use for discounts, special instructions, or anything unusual.
              </small>
            </div>

            <Button
              type="submit"
              disabled={
                submitting ||
                !form.branch_id ||
                !form.product_id ||
                Number(form.quantity || 0) <= 0 ||
                Number(form.quantity || 0) > availableStock
              }
            >
              {submitting ? 'Saving...' : 'Create Sale'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        title="Cancel Sale"
      >
        <form onSubmit={handleCancelSale}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Cancellation Reason</h3>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
                Explain why this sale is being cancelled. Stock will be restored automatically.
              </p>
            </div>

            {saleToCancel ? (
              <div
                style={{
                  background: '#f9fafb',
                  borderRadius: 8,
                  padding: '10px',
                  fontSize: '13px',
                  display: 'grid',
                  gap: '4px',
                }}
              >
                <div>
                  <strong>Invoice:</strong> {saleToCancel.invoice_no}
                </div>
                <div>
                  <strong>Product:</strong> {saleToCancel.product_name || saleToCancel.product_id}
                </div>
                <div>
                  <strong>Quantity:</strong> {saleToCancel.quantity}
                </div>
                <div>
                  <strong>Total:</strong> TZS {Number(saleToCancel.total_price || 0).toLocaleString()}
                </div>
              </div>
            ) : null}

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Reason
              </label>
              <Input
                placeholder="Example: wrong quantity entered"
                value={cancelReason}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCancelReason(e.target.value)
                }
              />
              <small style={{ color: '#6b7280' }}>
                This explanation helps with review and audit history.
              </small>
            </div>

            <Button type="submit" disabled={cancelling || !cancelReason.trim()}>
              {cancelling ? 'Cancelling...' : 'Confirm Cancel Sale'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;