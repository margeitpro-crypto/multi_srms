import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  maxVal?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, maxVal = 4.0 }) => {
  const maxValue = maxVal;

  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
        No performance data available.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-end justify-around gap-4 p-4 border-t border-gray-200 dark:border-gray-700 mt-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center h-full">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg flex-grow flex items-end">
            <div
              className="w-full bg-primary-500 rounded-t-lg transition-all duration-500 ease-out"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
              title={`GPA: ${item.value.toFixed(2)}`}
            >
              <div className="text-center text-white text-xs font-bold pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value > 0 ? item.value.toFixed(2) : ''}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
