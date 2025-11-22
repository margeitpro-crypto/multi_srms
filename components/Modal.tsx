import React, { Fragment } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'default' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'default' }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in ${size === 'full' ? 'p-0' : ''}`}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full transform transition-all animate-slide-in-up ${size === 'full' ? 'max-w-none h-full rounded-none' : 'max-w-4xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between ${size === 'full' ? 'p-6' : 'p-4'} border-b dark:border-gray-700`}>
          <h3 className={`font-semibold text-gray-900 dark:text-white ${size === 'full' ? 'text-2xl' : 'text-lg'}`}>{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs p-1.5 ml-auto inline-flex items-center"
          >
            <XMarkIcon className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className={`${size === 'full' ? 'p-6 h-[calc(100%-4rem)]' : 'p-6'} space-y-6 ${size === 'full' ? '' : 'max-h-[70vh]'} overflow-y-auto`}>
          {children}
        </div>
        {footer && (
          <div className="flex items-center p-4 border-t dark:border-gray-700 rounded-b">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;