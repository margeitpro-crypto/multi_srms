
import React from 'react';

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  size?: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, size = 150 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
        <div style={{ width: size, height: size }} className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">No Data</p>
        </div>
    );
  }

  let cumulativePercentage = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <svg height={size} width={size} viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
      {data.map((item) => {
        if (item.value === 0) return null;

        const percentage = item.value / total;
        const [startX, startY] = getCoordinatesForPercent(cumulativePercentage);
        cumulativePercentage += percentage;
        const [endX, endY] = getCoordinatesForPercent(cumulativePercentage);
        
        const largeArcFlag = percentage > 0.5 ? 1 : 0;
        
        const pathData = [
          `M ${startX} ${startY}`, // Move
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
          `L 0 0`, // Line to center
        ].join(' ');

        return <path key={item.name} d={pathData} fill={item.color} />;
      })}
    </svg>
  );
};

export default PieChart;
