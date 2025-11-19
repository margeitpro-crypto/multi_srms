import React from 'react';
import Loader from './Loader';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, index: number) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading: boolean;
  renderActions?: (item: T) => React.ReactNode;
}

function Table<T,>({ columns, data, isLoading, renderActions }: TableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            {columns.map((col, index) => (
              <th key={index} scope="col" className={`px-6 py-3 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
            {renderActions && <th scope="col" className="px-6 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-8">
                <Loader />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-8 text-gray-500 dark:text-gray-400">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={rowIndex} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 ${col.className || ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(item, rowIndex)
                      : String(item[col.accessor as keyof T])}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {renderActions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;