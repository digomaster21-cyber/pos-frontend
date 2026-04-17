import { z } from 'zod';

export const validationSchemas = {
  login: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters'),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
  }),

  sale: z.object({
    items: z.array(z.object({
      productId: z.string().min(1, 'Product is required'),
      quantity: z.number()
        .min(1, 'Quantity must be at least 1')
        .max(1000, 'Quantity must be less than 1000'),
      unitPrice: z.number()
        .min(0.01, 'Price must be greater than 0')
        .max(1000000, 'Price must be reasonable'),
    })).min(1, 'At least one item is required'),
    branch: z.string().min(1, 'Branch is required'),
    customerName: z.string().max(100).optional(),
    paymentMethod: z.enum(['cash', 'card', 'transfer', 'credit']),
  }),

  expense: z.object({
    amount: z.number()
      .min(0.01, 'Amount must be greater than 0')
      .max(1000000, 'Amount must be reasonable'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().max(500).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    branch: z.string().min(1, 'Branch is required'),
  }),

  product: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(200, 'Name must be less than 200 characters'),
    sku: z.string()
      .min(1, 'SKU is required')
      .max(50, 'SKU must be less than 50 characters'),
    price: z.number()
      .min(0.01, 'Price must be greater than 0')
      .max(1000000, 'Price must be reasonable'),
    stock: z.number()
      .min(0, 'Stock cannot be negative')
      .max(1000000, 'Stock must be reasonable'),
    category: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
  }),
};

export type LoginSchema = z.infer<typeof validationSchemas.login>;
export type SaleSchema = z.infer<typeof validationSchemas.sale>;
export type ExpenseSchema = z.infer<typeof validationSchemas.expense>;
export type ProductSchema = z.infer<typeof validationSchemas.product>;

export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; errors?: Record<string, string> } => {
  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: 'Validation failed' } };
  }
};