import React from 'react';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  fullscreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  fullscreen = false,
}) => {
  if (fullscreen) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size={size} />
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Spin size={size} />
    </div>
  );
};

export default LoadingSpinner;