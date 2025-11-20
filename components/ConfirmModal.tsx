import React from 'react';
import Button from './Button';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-3 w-full">
      <Button variant="secondary" onClick={onClose}>
        {cancelText}
      </Button>
      <Button variant={confirmVariant} onClick={handleConfirm}>
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
    >
      <div className="py-4">
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;