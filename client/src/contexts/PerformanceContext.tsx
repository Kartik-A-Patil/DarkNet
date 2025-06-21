import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useAppPerformance, PerformanceMetrics } from '@/hooks/useAppPerformance';

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  isLowPerformanceMode: boolean;
  toggleLowPerformanceMode: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export const PerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const metrics = useAppPerformance();
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);
  
  // Auto-detect if we should enable low performance mode
  React.useEffect(() => {
    const consistentlyLowFps = metrics.fps < 30;
    const highMemoryUsage = metrics.memory.usagePercent > 80;
    const highEventLoopLag = metrics.eventLoopLag > 20;
    
    if ((consistentlyLowFps && highMemoryUsage) || highEventLoopLag) {
      // Only enable low performance mode if these conditions persist
      const timer = setTimeout(() => {
        setIsLowPerformanceMode(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [metrics]);
  
  const toggleLowPerformanceMode = () => {
    setIsLowPerformanceMode(prev => !prev);
  };
  
  return (
    <PerformanceContext.Provider 
      value={{
        metrics, 
        isLowPerformanceMode,
        toggleLowPerformanceMode
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};
