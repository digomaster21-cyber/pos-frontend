import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps } from 'antd';

export const Modal: React.FC<ModalProps> = ({ children, ...props }) => {
  return <AntModal {...props}>{children}</AntModal>;
};

export default Modal;