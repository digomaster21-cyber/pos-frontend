// frontend/src/context/BranchContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { branchesApi } from '../services/branches';

interface Branch {
  id: number;
  code: string;
  name: string;
  location: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  opening_date?: string;
  is_active: boolean;
  created_at?: string;
}

interface BranchContextType {
  currentBranch: Branch | null;
  setCurrentBranch: (branch: Branch) => void;
  branches: Branch[];
  loading: boolean;
  fetchBranches: () => Promise<void>;
  refreshBranch: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = (): BranchContextType => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

interface BranchProviderProps {
  children: ReactNode;
}

export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await branchesApi.getBranches(false);
      setBranches(data);
      
      const savedBranchId = storage.getBranchId();
      const activeBranches = data.filter(b => b.is_active);
      
      if (savedBranchId && data.length > 0) {
        const saved = data.find(b => b.id === parseInt(savedBranchId));
        if (saved && saved.is_active) {
          setCurrentBranch(saved);
        } else if (activeBranches.length > 0) {
          setCurrentBranch(activeBranches[0]);
          storage.setBranchId(activeBranches[0].id.toString());
        }
      } else if (activeBranches.length > 0) {
        setCurrentBranch(activeBranches[0]);
        storage.setBranchId(activeBranches[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBranch = async () => {
    await fetchBranches();
  };

  const handleSetCurrentBranch = (branch: Branch) => {
    if (!branch.is_active) {
      console.warn('Cannot select inactive branch');
      return;
    }
    setCurrentBranch(branch);
    storage.setBranchId(branch.id.toString());
    window.dispatchEvent(new CustomEvent('branchChanged', { detail: branch }));
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <BranchContext.Provider
      value={{
        currentBranch,
        setCurrentBranch: handleSetCurrentBranch,
        branches,
        loading,
        fetchBranches,
        refreshBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};