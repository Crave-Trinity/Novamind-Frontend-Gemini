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
  options?: any;
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
  options = {}, 
  height = 300,
  width,
  className = '' 
}) => {
  // In a real implementation, this would use a charting library like Chart.js
  // For now, we'll create a mockup that looks like a chart
  
  const getRandomBars = () => {
    return data.datasets[0].data.map((value, index) => {
      const height = `${(value / Math.max(...data.datasets[0].data)) * 100}%`;
      const bg = Array.isArray(data.datasets[0].backgroundColor) 
        ? data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]
        : data.datasets[0].backgroundColor || '#4F46E5';
      
      return (
        <div 
          key={index} 
          className="relative flex-1 mx-1"
          style={{ height: '100%' }}
        >
          <div 
            className="absolute bottom-0 w-full rounded-t transition-all duration-500 ease-in-out"
            style={{ 
              height, 
              backgroundColor: bg,
              minWidth: '20px'
            }}
          ></div>
          <div className="absolute -bottom-6 text-xs text-center w-full truncate">
            {data.labels[index]}
          </div>
        </div>
      );
    });
  };
  
  const getRandomLine = () => {
    // Create a mock SVG path that looks like a line chart
    const totalPoints = data.datasets[0].data.length;
    const pointWidth = 100 / (totalPoints - 1);
    
    const points = data.datasets[0].data.map((value, index) => {
      const normalizedValue = 100 - ((value / Math.max(...data.datasets[0].data)) * 100);
      const x = index * pointWidth;
      return `${x},${normalizedValue}`;
    });
    
    return (
      <div className="relative w-full h-full">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke={typeof data.datasets[0].borderColor === 'string' ? data.datasets[0].borderColor : '#4F46E5'}
            strokeWidth="2"
          />
        </svg>
        <div className="absolute bottom-0 w-full flex justify-between px-2">
          {data.labels.map((label, index) => (
            <div key={index} className="text-xs truncate">
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const getRandomPie = () => {
    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    let cumulativePercentage = 0;
    
    return (
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="#f3f4f6" />
          {data.datasets[0].data.map((value, index) => {
            const percentage = (value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            
            // Calculate the SVG arc path
            const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            
            const path = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
            
            const backgroundColor = Array.isArray(data.datasets[0].backgroundColor) 
              ? data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]
              : '#4F46E5';
            
            cumulativePercentage += percentage;
            
            return (
              <path 
                key={index}
                d={path}
                fill={backgroundColor}
              />
            );
          })}
        </svg>
      </div>
    );
  };
  
  return (
    <div 
      className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 ${className}`}
      style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
    >
      {data.datasets.length > 0 && (
        <div className="h-[calc(100%-30px)] w-full mt-2">
          {type === 'bar' && (
            <div className="flex items-end h-5/6 w-full">
              {getRandomBars()}
            </div>
          )}
          {type === 'line' && getRandomLine()}
          {(type === 'pie' || type === 'doughnut') && getRandomPie()}
          
          {/* Legend */}
          <div className="flex justify-center mt-4">
            {data.datasets.map((dataset, index) => (
              <div key={index} className="flex items-center mx-2">
                <div 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ 
                    backgroundColor: typeof dataset.backgroundColor === 'string' 
                      ? dataset.backgroundColor 
                      : (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : '#4F46E5')
                  }}
                ></div>
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  {dataset.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
