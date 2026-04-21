import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext';
import { PrivateRoute } from './auth/PrivateRoute';

import MainLayout from './components/layout/MainLayout';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';

import ForgotPassword from './pages/ResetPassword';
import ResetPassword from './pages/ResetPassword';

import UsersList from './pages/Users/UsersList';
import UserForm from './pages/Users/UserForm';

import SettingsPage from './pages/Settings/Settings';
import SyncPage from './pages/Sync';
import { ReportsPage } from './pages/ReportsPage';
import ExpensesPage from './pages/Expenses';
import BranchesPage from './pages/BranchesPage';  // FIXED: Changed from 'nchesPage' to 'BranchesPage'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="branches" element={<BranchesPage />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="users" element={<UsersList />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/:id/edit" element={<UserForm />} />

          <Route path="settings" element={<SettingsPage />} />
          <Route path="sync" element={<SyncPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;