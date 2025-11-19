import React from 'react';
import { ToastMessage } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const baseClasses = 'flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 transition-all duration-300 animate-fade-in';
  const typeClasses = {
    success: 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200',
    error: 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200',
    info: 'text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200',
    warning: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-200',
  };

  const iconClasses = `inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${typeClasses[toast.type]}`;

  return (
    <div className={baseClasses} role="alert">
      <div className={iconClasses}>
        {/* You can add specific icons here */}
        <span className="text-lg">
          {toast.type === 'success' && '✓'}
          {toast.type === 'error' && '×'}
          {toast.type === 'info' && 'i'}
          {toast.type === 'warning' && '!'}
        </span>
      </div>
      <div className="ml-3 text-xs font-normal">{toast.message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={() => onRemove(toast.id)}
      >
        <span className="sr-only">Close</span>
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-50">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;