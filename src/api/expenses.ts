import { apiClient } from './client';
import { storage } from '../utils/storage';

export interface Expense {
  id: number;
  expense_no: string;
  branch_id?: number | null;
  category: string;
  subcategory?: string | null;
  amount: number;
  description: string;
  expense_date: string;
  paid_to?: string | null;
  payment_method?: string;
  recorded_by: number;
  recorder_name?: string;
  created_at?: string;
  branch_name?: string;
  // NEW FIELDS
  is_recurring?: boolean;
  recurring_type?: string;  // monthly, weekly, yearly
  receipt_path?: string | null;
  approved_by?: number | null;
  approver_name?: string | null;
  status?: string;  // pending, approved, rejected
  approval_date?: string | null;
  rejection_reason?: string | null;
}

export interface CreateExpensePayload {
  branch_id?: number | null;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  expense_date: string;
  paid_to?: string;
  payment_method?: string;
  notes?: string;
  // NEW FIELDS
  is_recurring?: boolean;
  recurring_type?: string;
  receipt_path?: string;
}

export interface UpdateExpensePayload {
  branch_id?: number | null;
  category?: string;
  subcategory?: string;
  amount?: number;
  description?: string;
  expense_date?: string;
  paid_to?: string;
  payment_method?: string;
  notes?: string;
  // NEW FIELDS
  is_recurring?: boolean;
  recurring_type?: string;
}

export interface ExpenseApprovePayload {
  approved: boolean;
  rejection_reason?: string;
}

export interface PendingExpense {
  id: number;
  expense_no: string;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  recorder_name: string;
  status: string;
}

export interface PendingExpensesResponse {
  count: number;
  total_amount: number;
  expenses: PendingExpense[];
}

export interface ReceiptUploadResponse {
  receipt_path: string;
  filename: string;
  message: string;
}

export interface RentExpensePayload {
  branch_id: number;
  amount: number;
  expense_date: string;
  paid_to: string;
  notes?: string;
}

export interface RecurringExpense {
  id: number;
  expense_no: string;
  category: string;
  amount: number;
  recurring_type: string;
  next_due_date: string;
  last_paid_date?: string;
}

// Helper to add company_id to params
const addCompanyId = (params?: Record<string, any>): Record<string, any> => {
  const companyId = storage.getCompanyId();
  return { ...params, company_id: companyId || '' };
};

export const expensesApi = {
  // Existing methods
  getExpenses: (params?: {
    branch_id?: number;
    category?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    is_recurring?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const allParams = addCompanyId(params);
    return apiClient.get<Expense[]>('/api/expenses', allParams);
  },

  getExpenseById: (expenseId: number) => {
    const companyId = storage.getCompanyId();
    return apiClient.get<Expense>(`/api/expenses/${expenseId}?company_id=${companyId}`);
  },

  createExpense: (payload: CreateExpensePayload) => {
    const companyId = storage.getCompanyId();
    return apiClient.post<{ message: string; expense_id: number; expense_no: string; status: string }>(
      '/api/expenses', 
      { ...payload, company_id: companyId }
    );
  },

  updateExpense: (expenseId: number, payload: UpdateExpensePayload) => {
    const companyId = storage.getCompanyId();
    return apiClient.put<{ message: string }>(
      `/api/expenses/${expenseId}?company_id=${companyId}`, 
      payload
    );
  },

  deleteExpense: (expenseId: number) => {
    const companyId = storage.getCompanyId();
    return apiClient.delete<{ message: string }>(`/api/expenses/${expenseId}?company_id=${companyId}`);
  },

  // NEW METHODS

  // Get pending expenses waiting for approval
  getPendingExpenses: (branchId?: number) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    return apiClient.get<PendingExpensesResponse>(`/api/expenses/pending?${params.toString()}`);
  },

  // Approve or reject an expense
  approveExpense: (expenseId: number, payload: ExpenseApprovePayload) => {
    const companyId = storage.getCompanyId();
    return apiClient.post<{ message: string; status: string }>(
      `/api/expenses/${expenseId}/approve?company_id=${companyId}`, 
      payload
    );
  },

  // Upload receipt image
  uploadReceipt: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ReceiptUploadResponse>('/api/expenses/receipt/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Special endpoint for rent expenses (recurring)
  createRentExpense: (payload: RentExpensePayload) => {
    const companyId = storage.getCompanyId();
    return apiClient.post<{ message: string; expense_id: number; expense_no: string }>(
      '/api/expenses/rent/create', 
      { ...payload, company_id: companyId }
    );
  },

  // Get all recurring expenses (rent, salaries, etc.)
  getRecurringExpenses: (branchId?: number) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    return apiClient.get<RecurringExpense[]>(`/api/expenses/recurring?${params.toString()}`);
  },

  // Get receipt image for an expense
  getReceipt: (expenseId: number) => {
    const companyId = storage.getCompanyId();
    return apiClient.get<Blob>(`/api/expenses/${expenseId}/receipt?company_id=${companyId}`, undefined, { 
      responseType: 'blob' 
    });
  },

  // Get expense summary by category
  getExpenseSummary: (params?: {
    branch_id?: number;
    period?: 'week' | 'month' | 'year';
  }) => {
    const companyId = storage.getCompanyId();
    const allParams = { ...params, company_id: companyId || '' };
    return apiClient.get<{
      period: string;
      start_date: string;
      end_date: string;
      total_count: number;
      total_amount: number;
      by_category: Array<{ category: string; count: number; total: number }>;
    }>('/api/expenses/summary', allParams);
  },
};

export default expensesApi;