import React, { useState, useEffect } from "react";
import { useAppPerformance } from "@/hooks/useAppPerformance";

interface SparklineProps {
  data: number[];
  height: number;
  width: number;
  color: string;
  lineWidth?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, height, width, color, lineWidth = 1 }) => {
  if (!data || data.length < 2) return null;
  
  const maxValue = Math.max(...data, 1); // Avoid division by zero
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (value / maxValue) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={lineWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const PerformanceMonitorWidget: React.FC = () => {
  const metrics = useAppPerformance();
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState({
    fps: Array(30).fill(0),
    cpu: Array(30).fill(0),
    memory: Array(30).fill(0),
    lag: Array(30).fill(0),
  });
  
  // Update history (now with 5-second averages)
  useEffect(() => {
    // Only update history when metrics change
    const metricsString = JSON.stringify(metrics);
    setHistory(prev => ({
      fps: [...prev.fps.slice(1), metrics.fps],
      cpu: [...prev.cpu.slice(1), metrics.cpu],
      memory: [...prev.memory.slice(1), metrics.memory.usagePercent],
      lag: [...prev.lag.slice(1), Math.min(metrics.eventLoopLag, 100)], 
    }));
  }, [metrics]);
  
  // Get color based on performance level
  const getHealthColor = (value: number, thresholds: [number, number]) => {
    const [warning, critical] = thresholds;
    if (value >= critical) return "bg-red-500";
    if (value >= warning) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const getFpsColor = (fps: number) => {
    if (fps >= 60) return "bg-green-500"; // Great performance
    if (fps >= 30) return "bg-yellow-500"; // Acceptable
    return "bg-red-500"; // Low performance
  };

  return (
    <div className="bg-gray-800 bg-opacity-80 rounded-lg shadow-lg p-3 text-white backdrop-blur-sm min-w-[240px]">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <h3 className="text-sm font-medium">Performance Monitor</h3>
          <button 
            className="ml-2 text-xs text-gray-400 hover:text-white" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <span>5s avg</span>
          <i className="fa fa-chart-line ml-2 text-accent"></i>
        </div>
      </div>
      
      {/* FPS Meter */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">FPS</span>
          <div className="flex items-center">
            <Sparkline data={history.fps} height={12} width={30} color="rgba(74, 222, 128, 0.6)" />
            <span className="text-xs ml-1 font-mono">{metrics.fps.toFixed(0)}</span>
          </div>
        </div>
        <div className="relative h-1.5 bg-gray-900 rounded">
          <div 
            className={`absolute top-0 left-0 h-full rounded ${getFpsColor(metrics.fps)}`}
            style={{ width: `${Math.min(100, (metrics.fps / 120) * 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* CPU Usage */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">CPU</span>
          <div className="flex items-center">
            <Sparkline data={history.cpu} height={12} width={30} color="rgba(239, 68, 68, 0.6)" />
            <span className="text-xs ml-1 font-mono">{metrics.cpu.toFixed(0)}%</span>
          </div>
        </div>
        <div className="relative h-1.5 bg-gray-900 rounded">
          <div 
            className={`absolute top-0 left-0 h-full rounded ${getHealthColor(metrics.cpu, [70, 90])}`}
            style={{ width: `${metrics.cpu}%` }}
          ></div>
        </div>
      </div>
      
      {/* Memory Usage */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">Memory</span>
          <div className="flex items-center">
            <Sparkline data={history.memory} height={12} width={30} color="rgba(59, 130, 246, 0.6)" />
            <span className="text-xs ml-1 font-mono">
              {metrics.memory.usagePercent.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="relative h-1.5 bg-gray-900 rounded">
          <div 
            className="absolute top-0 left-0 h-full rounded bg-blue-500"
            style={{ width: `${metrics.memory.usagePercent}%` }}
          ></div>
        </div>
      </div>
      
      {/* Event Loop Lag */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">Lag</span>
          <div className="flex items-center">
            <Sparkline data={history.lag} height={12} width={30} color="rgba(168, 85, 247, 0.6)" />
            <span className="text-xs ml-1 font-mono">{metrics.eventLoopLag.toFixed(1)}ms</span>
          </div>
        </div>
        <div className="relative h-1.5 bg-gray-900 rounded">
          <div 
            className={`absolute top-0 left-0 h-full rounded ${getHealthColor(metrics.eventLoopLag, [8, 16])}`}
            style={{ width: `${Math.min(100, metrics.eventLoopLag * 5)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Additional metrics in expanded view */}
      {expanded && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="text-gray-400">DOM Nodes:</div>
            <div className="text-right font-mono">{metrics.domNodes}</div>
            
            <div className="text-gray-400">Render Count:</div>
            <div className="text-right font-mono">{metrics.renderCount}</div>
            
            {metrics.network.downlink !== null && (
              <>
                <div className="text-gray-400">Network:</div>
                <div className="text-right font-mono">
                  {metrics.network.downlink} Mbps
                </div>
                
                <div className="text-gray-400">Latency:</div>
                <div className="text-right font-mono">
                  {metrics.network.rtt} ms
                </div>
              </>
            )}
            
            <div className="text-gray-400">Heap Used:</div>
            <div className="text-right font-mono">
              {metrics.memory.usedJSHeapSize.toFixed(1)} MB
            </div>
            
            <div className="text-gray-400">Heap Size:</div>
            <div className="text-right font-mono">
              {metrics.memory.totalJSHeapSize.toFixed(1)} MB
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitorWidget;
