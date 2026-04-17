import api from './api';
import { Expense, ExpenseCreate, ExpenseSummary } from '../types';

export const expensesApi = {
  // Get expenses with filters
  getExpenses: async (
    branchId?: number,
    category?: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<Expense[]> => {
    const params = new URLSearchParams();
    if (branchId) params.append('branch_id', String(branchId));
    if (category) params.append('category', category);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', String(limit));
    params.append('offset', String(offset));
    
    return api.get(`/api/expenses?${params.toString()}`);
  },

  // Get single expense
  getExpense: async (id: number): Promise<Expense> => {
    return api.get(`/api/expenses/${id}`);
  },

  // Create expense
  createExpense: async (expense: ExpenseCreate): Promise<{ expense_id: number; expense_no: string }> => {
    return api.post('/api/expenses', expense);
  },

  // Update expense
  updateExpense: async (id: number, expense: ExpenseCreate): Promise<Expense> => {
    return api.put(`/api/expenses/${id}`, expense);
  },

  // Delete expense
  deleteExpense: async (id: number): Promise<{ message: string }> => {
    return api.delete(`/api/expenses/${id}`);
  },

  // Get expense categories
  getCategories: async (): Promise<Record<string, string[]>> => {
    return api.get('/api/expenses/categories');
  },

  // Get expense summary
  getSummary: async (
    branchId?: number,
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<ExpenseSummary> => {
    const params = new URLSearchParams();
    if (branchId) params.append('branch_id', String(branchId));
    params.append('period', period);
    
    return api.get(`/api/expenses/summary?${params.toString()}`);
  }
};