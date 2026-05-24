// src/components/common/forms/CreateSaleForm.tsx
import React, { useState, ChangeEvent } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { z } from "zod";

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
  onSubmit: (data: CreateSaleDto) => void;
  isLoading: boolean;
  onCancel: () => void;
  branches?: Array<{ id: number; name: string }>;
}

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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(saleValidationSchema),
    defaultValues: {
      branch_id: "",
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
          // ✅ FIXED: Use correct field names from API
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

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
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

    onSubmit(saleData);
  };

  const subtotal = calculateSubtotal();
  const taxRate = 0.1; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
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
          Create Sale
        </Button>
      </div>
    </form>
  );
};