// src/components/common/forms/CreateSaleForm.tsx
import React, { useState, ChangeEvent } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Printer, FileDown } from "lucide-react";
import { z } from "zod";
import receiptService from '../../../services/receiptService';

import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/select";

import type { Product } from "../../../api/inventory";
import type { CreateSaleDto } from "../../../api/sales";

// Validation schema for the form
const saleValidationSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  customer_name: z.string().optional(),
  payment_method: z.enum(["cash", "card", "transfer", "credit"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof saleValidationSchema>;

interface SaleItemForm {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateSaleFormProps {
  products: Product[];
  onSubmit: (data: CreateSaleDto) => Promise<{ sale_id: number; invoice_no: string }>;
  isLoading: boolean;
  onCancel: () => void;
  branches?: Array<{ id: number; name: string }>;
}

// Receipt Modal Component
const ReceiptModal: React.FC<{
  saleId: number;
  invoiceNo: string;
  onClose: () => void;
  onPrint: () => void;
  onDownload: () => void;
  printing: boolean;
  downloading: boolean;
}> = ({ saleId: _saleId, invoiceNo, onClose, onPrint, onDownload, printing, downloading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Sale Complete!</h2>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">Invoice Number</p>
            <p className="text-2xl font-mono font-bold text-gray-800">{invoiceNo}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onPrint}
              disabled={printing}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {printing ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Preparing Print...
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  Print Receipt
                </>
              )}
            </button>

            <button
              onClick={onDownload}
              disabled={downloading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  Download PDF
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>

          <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              💡 <strong>Tip:</strong> For wireless printing, make sure your printer is connected to the same network.
              The print dialog will allow you to select any available printer (USB, WiFi, Bluetooth).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreateSaleForm: React.FC<CreateSaleFormProps> = ({
  products,
  onSubmit,
  isLoading,
  onCancel,
  branches = [],
}) => {
  const [items, setItems] = useState<SaleItemForm[]>([
    { productId: "", quantity: 1, unitPrice: 0 },
  ]);
  
  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);
  const [lastInvoiceNo, setLastInvoiceNo] = useState("");
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(saleValidationSchema),
    defaultValues: {
      branch_id: branches.length === 1 ? String(branches[0].id) : "",
      customer_name: "",
      payment_method: "cash",
      notes: "",
    },
  });

  const paymentOptions = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "transfer", label: "Bank Transfer" },
    { value: "credit", label: "Credit" },
  ];

  const branchOptions = branches.map(branch => ({
    value: String(branch.id),
    label: branch.name,
  }));

  const addItem = () =>
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }]);

  const removeItem = (index: number) => {
    if (items.length > 1)
      setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof SaleItemForm,
    value: string | number
  ) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];

      if (field === "quantity" || field === "unitPrice") {
        newItems[index][field] = Number(value);
      } else {
        newItems[index][field] = value as string;
      }

      // When product is selected, auto-fill the unit price and check stock
      if (field === "productId" && value) {
        const product = products.find((p) => String(p.id) === value);
        if (product) {
          newItems[index].unitPrice = product.selling_price || 0;
          
          // Check if enough stock is available
          const stockAvailable = (product as any).stock_quantity || 0;
          if (stockAvailable <= 0) {
            alert(`Warning: ${product.name} has ${stockAvailable} units in stock!`);
          }
        }
      }

      return newItems;
    });
  };

  // Get available stock for a product
  const getAvailableStock = (productId: string): number => {
    const product = products.find((p) => String(p.id) === productId);
    if (!product) return 0;
    return (product as any).stock_quantity || 0;
  };

  // Validate stock before submission
  const validateStock = (): boolean => {
    for (const item of items) {
      if (item.productId && item.quantity > 0) {
        const availableStock = getAvailableStock(item.productId);
        if (item.quantity > availableStock) {
          const product = products.find((p) => String(p.id) === item.productId);
          alert(`Not enough stock for ${product?.name}. Available: ${availableStock}, Requested: ${item.quantity}`);
          return false;
        }
      }
    }
    return true;
  };

  const calculateSubtotal = () =>
    items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );

  // Receipt functions
  const handlePrintReceipt = async () => {
    if (!lastSaleId) return;
    setPrinting(true);
    try {
      await receiptService.printReceipt(lastSaleId);
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to print receipt. Please check your printer connection.');
    } finally {
      setPrinting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!lastSaleId || !lastInvoiceNo) return;
    setDownloading(true);
    try {
      await receiptService.downloadPDF(lastSaleId, lastInvoiceNo);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download receipt');
    } finally {
      setDownloading(false);
    }
  };

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    // Filter out empty items
    const validItems = items.filter(
      (item) => item.productId && item.quantity > 0 && item.unitPrice > 0
    );

    if (validItems.length === 0) {
      alert("Please add at least one product");
      return;
    }

    // Validate stock before submission
    if (!validateStock()) {
      return;
    }

    const saleData: CreateSaleDto = {
      items: validItems.map((item) => ({
        product_id: parseInt(item.productId),
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
      branch_id: parseInt(data.branch_id),
      customer_name: data.customer_name || undefined,
      payment_method: data.payment_method,
      notes: data.notes || undefined,
    };

    try {
      const result = await onSubmit(saleData);
      
      // Store sale info for receipt
      setLastSaleId(result.sale_id);
      setLastInvoiceNo(result.invoice_no);
      
      // Reset form
      reset();
      setItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
      
      // Show receipt modal
      setShowReceipt(true);
    } catch (error) {
      console.error('Sale submission failed:', error);
      alert('Failed to complete sale. Please try again.');
    }
  };

  const subtotal = calculateSubtotal();
  const taxRate = 0.1; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Sale Items</h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={addItem}
            >
              Add Item
            </Button>
          </div>

          {items.map((item, index) => {
            const availableStock = getAvailableStock(item.productId);
            const isLowStock = availableStock > 0 && availableStock < 10;
            const isOutOfStock = availableStock === 0;
            
            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-end border-b pb-3"
              >
                <div className="col-span-5">
                  <Select
                    label="Product"
                    value={item.productId}
                    onChange={(value: string) =>
                      updateItem(index, "productId", value)
                    }
                    options={[
                      { value: "", label: "Select a product..." },
                      ...products.map((product) => {
                        const stock = (product as any).stock_quantity || 0;
                        const stockWarning = stock === 0 ? "❌ OUT OF STOCK" : stock < 10 ? "⚠️ Low Stock" : "✅";
                        
                        return {
                          value: String(product.id),
                          label: `${product.name} (${product.sku}) - Stock: ${stock} - TZS ${product.selling_price} ${stockWarning}`,
                        };
                      }),
                    ]}
                  />
                  {item.productId && isOutOfStock && (
                    <p className="text-red-500 text-xs mt-1">
                      ❌ This product is out of stock!
                    </p>
                  )}
                  {item.productId && isLowStock && !isOutOfStock && (
                    <p className="text-yellow-500 text-xs mt-1">
                      ⚠️ Low stock! Only {availableStock} units available.
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <Input
                    label="Quantity"
                    type="number"
                    min={1}
                    max={availableStock || undefined}
                    value={item.quantity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateItem(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                  {item.productId && item.quantity > availableStock && availableStock > 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      Max: {availableStock}
                    </p>
                  )}
                </div>

                <div className="col-span-3">
                  <Input
                    label="Unit Price (TZS)"
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={item.unitPrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateItem(
                        index,
                        "unitPrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Subtotal</p>
                  <p className="font-semibold text-sm">
                    TZS {(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>

                {items.length > 1 && (
                  <div className="col-span-12 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Customer & Payment Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Customer Name (Optional)"
              placeholder="Walk-in Customer"
              {...register("customer_name")}
            />
          </div>

          <div>
            <Controller
              name="payment_method"
              control={control}
              render={({ field }) => (
                <Select
                  label="Payment Method"
                  options={paymentOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="branch_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Branch"
                  options={branchOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.branch_id && (
              <p className="text-red-500 text-xs mt-1">{errors.branch_id.message}</p>
            )}
          </div>

          <div>
            <Input
              label="Notes (Optional)"
              placeholder="Additional notes..."
              {...register("notes")}
            />
          </div>
        </div>

        {/* Totals Section */}
        <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>TZS {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%):</span>
              <span>TZS {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total:</span>
              <span className="text-blue-600 text-lg">TZS {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={
              items.length === 0 ||
              items.some((item) => !item.productId || item.quantity <= 0)
            }
          >
            Complete Sale
          </Button>
        </div>
      </form>

      {/* Receipt Modal */}
      {showReceipt && lastSaleId && (
        <ReceiptModal
          saleId={lastSaleId}
          invoiceNo={lastInvoiceNo}
          onClose={() => setShowReceipt(false)}
          onPrint={handlePrintReceipt}
          onDownload={handleDownloadReceipt}
          printing={printing}
          downloading={downloading}
        />
      )}
    </>
  );
};