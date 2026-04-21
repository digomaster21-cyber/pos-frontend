import React, { useEffect, useState } from 'react';
import { Select, Badge, message, Tooltip } from 'antd';
import { SwapOutlined, ShopOutlined } from '@ant-design/icons';
import { branchesApi, Branch } from '../api/branches';
import { storage } from '../utils/storage';

const { Option } = Select;

interface BranchSwitcherProps {
  onBranchChange?: (branchId: number) => void;
}

const BranchSwitcher: React.FC<BranchSwitcherProps> = ({ onBranchChange }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState<number>(1); // Default to 1
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved branch ID
    const savedBranchId = storage.getBranchId();
    if (savedBranchId) {
      setCurrentBranchId(parseInt(savedBranchId, 10));
    }
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await branchesApi.getBranches({ active_only: true });
      setBranches(data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      message.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = (branchId: number) => {
    setCurrentBranchId(branchId);
    storage.setBranchId(branchId);
    
    // Find branch name for display
    const branch = branches.find(b => b.id === branchId);
    message.success(`Switched to ${branch?.name || `Branch ${branchId}`}`);
    
    if (onBranchChange) {
      onBranchChange(branchId);
    }
    
    // Reload page data after branch change
    window.location.reload();
  };

  return (
    <Tooltip title="Switch Branch">
      <Select
        value={currentBranchId}
        onChange={handleBranchChange}
        loading={loading}
        style={{ width: 180 }}
        suffixIcon={<SwapOutlined />}
        placeholder="Select Branch"
      >
        {branches.map((branch) => (
          <Option key={branch.id} value={branch.id}>
            <ShopOutlined /> {branch.name}
            {!branch.is_active && <Badge status="default" text="Inactive" />}
          </Option>
        ))}
      </Select>
    </Tooltip>
  );
};

export default BranchSwitcher;