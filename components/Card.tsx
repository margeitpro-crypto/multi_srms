import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  description?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon, colorClass, description }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex items-center space-x-6 transform hover:scale-105 transition-transform duration-300 border border-gray-200 dark:border-gray-700">
      <div className={`p-4 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>}
      </div>
    </div>
  );
};

export default Card;