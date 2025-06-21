import { useState, useEffect, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    usagePercent: number;
  };
  cpu: number;
  renderCount: number;
  network: {
    downlink: number | null;
    rtt: number | null;
    effectiveType: string | null;
  };
  domNodes: number;
  eventLoopLag: number;
  paintTiming: number;
}

export function useAppPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      usagePercent: 0,
    },
    cpu: 0,
    renderCount: 0,
    network: {
      downlink: null,
      rtt: null,
      effectiveType: null,
    },
    domNodes: 0,
    eventLoopLag: 0,
    paintTiming: 0,
  });

  // For FPS calculation
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderCountRef = useRef(0);
  const eventLoopLagRef = useRef(0);

  // For data collection over time
  const samplesRef = useRef({
    fps: [] as number[],
    memory: [] as number[],
    cpu: [] as number[],
    lag: [] as number[]
  });

  // Measure event loop lag
  useEffect(() => {
    let rafId: number;
    let lastFrameTime = performance.now();
    
    const measureEventLoopLag = () => {
      const now = performance.now();
      const lag = now - lastFrameTime - 16.667; // Assuming 60fps (16.667ms per frame)
      lastFrameTime = now;
      
      eventLoopLagRef.current = Math.max(0, lag);
      rafId = requestAnimationFrame(measureEventLoopLag);
    };
    
    rafId = requestAnimationFrame(measureEventLoopLag);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Track render count
  useEffect(() => {
    renderCountRef.current++;
  });

  // Main metrics collection
  useEffect(() => {
    const memoryHistory: number[] = [];
    const fpsHistory: number[] = [];
    
    // Function to collect current metrics
    const collectMetrics = () => {
      frameCountRef.current++;
      
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;
      
      // Collect instantaneous metrics for averaging
      if (elapsed >= 1000) {
        // Calculate FPS
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        samplesRef.current.fps.push(currentFps);
        
        // Get memory info
        let memoryUsage = 0;
        if (performance && (performance as any).memory) {
          const memory = (performance as any).memory;
          const usagePercent = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
          samplesRef.current.memory.push(usagePercent);
          memoryUsage = usagePercent;
        }
        
        // CPU usage estimation (approximated from FPS and event loop lag)
        const cpuUsageEstimate = Math.min(100, 
          100 - ((currentFps / 60) * 50) + 
          (Math.min(eventLoopLagRef.current, 100) / 2)
        );
        samplesRef.current.cpu.push(cpuUsageEstimate);
        samplesRef.current.lag.push(eventLoopLagRef.current);
        
        // Reset frame counter and update time reference
        frameCountRef.current = 0;
        lastTimeRef.current = now;
        
        // Update metrics every 5 seconds with averaged data
        if (samplesRef.current.fps.length >= 5) {
          // Calculate averages
          const avgFps = samplesRef.current.fps.reduce((sum, val) => sum + val, 0) / samplesRef.current.fps.length;
          const avgMemory = samplesRef.current.memory.reduce((sum, val) => sum + val, 0) / samplesRef.current.memory.length;
          const avgCpu = samplesRef.current.cpu.reduce((sum, val) => sum + val, 0) / samplesRef.current.cpu.length;
          const avgLag = samplesRef.current.lag.reduce((sum, val) => sum + val, 0) / samplesRef.current.lag.length;
          
          // Get memory details
          let memoryInfo = { usedJSHeapSize: 0, totalJSHeapSize: 0, usagePercent: avgMemory };
          if (performance && (performance as any).memory) {
            const memory = (performance as any).memory;
            memoryInfo.usedJSHeapSize = memory.usedJSHeapSize / (1024 * 1024);
            memoryInfo.totalJSHeapSize = memory.totalJSHeapSize / (1024 * 1024);
          }
          
          // Get network info
          let networkInfo = { downlink: null, rtt: null, effectiveType: null };
          if ('connection' in navigator) {
            const conn = (navigator as any).connection;
            networkInfo = {
              downlink: conn.downlink,
              rtt: conn.rtt,
              effectiveType: conn.effectiveType,
            };
          }
          
          // Count DOM nodes
          const domNodes = document.querySelectorAll('*').length;
          
          // Update state with all averaged metrics
          setMetrics({
            fps: Math.round(avgFps),
            memory: memoryInfo,
            cpu: avgCpu,
            renderCount: renderCountRef.current,
            network: networkInfo,
            domNodes,
            eventLoopLag: avgLag,
            paintTiming: 0 // We don't average this
          });
          
          // Clear samples for next collection period
          samplesRef.current = {
            fps: [],
            memory: [],
            cpu: [],
            lag: []
          };
        }
      }
      
      requestAnimationFrame(collectMetrics);
    };
    
    const rafId = requestAnimationFrame(collectMetrics);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);
  
  return metrics;
}
