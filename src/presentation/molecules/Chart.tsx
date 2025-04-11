import React from 'react';

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data: ChartData;
  options?: any; // eslint-disable-line @typescript-eslint/no-explicit-any;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Chart component
 * Wrapper for visualization charts with consistent styling and types
 */
export const Chart: React.FC<ChartProps> = ({
  type,
  data,
  // options = {}, // Removed unused prop from destructuring
  height = 300,
  width,
  className = '',
  // Removed unused ...rest parameter
}) => {
  // In a real implementation, this would use a charting library like Chart.js
  // For now, we'll create a mockup that looks like a chart

  // Function to safely render empty state
  const renderEmptyState = () => (
    <div
      className={`flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800 ${className}`}
      style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
    >
      <div className="text-sm text-neutral-500 dark:text-neutral-400">No data available</div>
    </div>
  );

  // Safeguard for empty datasets
  if (!data || !data.datasets || data.datasets.length === 0) {
    return renderEmptyState();
  }

  // Safely get the primary dataset and data values
  const primaryDataset = data?.datasets?.[0];
  if (!primaryDataset || !primaryDataset.data || primaryDataset.data.length === 0) {
    return renderEmptyState();
  }

  // Now we can safely work with the dataset
  const dataValues = primaryDataset.data;
  const maxValue = Math.max(...dataValues);

  // Function to safely get background color
  const getBackgroundColor = (dataset: ChartDataset, index: number): string => {
    // Default color if backgroundColor is not defined
    if (!dataset.backgroundColor) return '#4F46E5';

    // If it's a string, return it directly
    if (typeof dataset.backgroundColor === 'string') {
      return dataset.backgroundColor;
    }

    // If it's an array, make sure it has elements before accessing
    if (Array.isArray(dataset.backgroundColor) && dataset.backgroundColor.length > 0) {
      const colorIndex = index % dataset.backgroundColor.length;
      // Extra type check to satisfy TypeScript
      const color = dataset.backgroundColor[colorIndex];
      return color || '#4F46E5';
    }

    // Default fallback
    return '#4F46E5';
  };

  // Function to safely get border color
  const getBorderColor = (dataset: ChartDataset): string => {
    if (!dataset.borderColor) return '#4F46E5'; // Default color
    return typeof dataset.borderColor === 'string' ? dataset.borderColor : '#4F46E5';
  };

  const getRandomBars = () => {
    return dataValues.map((value, index) => {
      const barHeight = `${(value / maxValue) * 100}%`;
      const bgColor = getBackgroundColor(primaryDataset, index);

      return (
        <div key={index} className="relative mx-1 flex-1" style={{ height: '100%' }}>
          <div
            className="absolute bottom-0 w-full rounded-t transition-all duration-500 ease-in-out"
            style={{
              height: barHeight,
              backgroundColor: bgColor,
              minWidth: '20px',
            }}
          ></div>
          <div className="absolute -bottom-6 w-full truncate text-center text-xs">
            {data.labels[index]}
          </div>
        </div>
      );
    });
  };

  const getRandomLine = () => {
    // Create a mock SVG path that looks like a line chart
    const totalPoints = dataValues.length;
    const pointWidth = 100 / (totalPoints - 1);

    const points = dataValues.map((value, index) => {
      const normalizedValue = 100 - (value / maxValue) * 100;
      const x = index * pointWidth;
      return `${x},${normalizedValue}`;
    });

    // Get line color safely
    const lineColor = getBorderColor(primaryDataset);

    return (
      <div className="relative h-full w-full">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <polyline points={points.join(' ')} fill="none" stroke={lineColor} strokeWidth="2" />
        </svg>
        <div className="absolute bottom-0 flex w-full justify-between px-2">
          {data.labels.map((label, index) => (
            <div key={index} className="truncate text-xs">
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getRandomPie = () => {
    const total = dataValues.reduce((sum, value) => sum + value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="40" fill="#f3f4f6" />
          {dataValues.map((value, index) => {
            const percentage = (value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;

            // Calculate the SVG arc path
            const startX = 50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180);
            const startY = 50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180);
            const endX = 50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180);
            const endY = 50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180);

            const largeArcFlag = percentage > 50 ? 1 : 0;

            const path = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

            // Get slice color safely
            const sliceColor = getBackgroundColor(primaryDataset, index);

            cumulativePercentage += percentage;

            return <path key={index} d={path} fill={sliceColor} />;
          })}
        </svg>
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800 ${className}`}
      style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
    >
      <div className="mt-2 h-[calc(100%-30px)] w-full">
        {type === 'bar' && <div className="flex h-5/6 w-full items-end">{getRandomBars()}</div>}
        {type === 'line' && getRandomLine()}
        {(type === 'pie' || type === 'doughnut') && getRandomPie()}

        {/* Legend */}
        <div className="mt-4 flex justify-center">
          {data.datasets.map((dataset, index) => {
            // Get legend color safely
            const legendColor = getBackgroundColor(dataset, 0);

            return (
              <div key={index} className="mx-2 flex items-center">
                <div
                  className="mr-1 h-3 w-3 rounded-full"
                  style={{ backgroundColor: legendColor }}
                ></div>
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  {dataset.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
