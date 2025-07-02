import { useState, useEffect, useCallback, useRef } from 'react';
import { processManager } from './ProcessManager';
import { 
  Process, 
  ProcessFilter, 
  ProcessTree, 
  ProcessStatus,
  ProcessType,
  ProcessAction,
  ProcessSignal
} from './types';

export interface UseProcessManagerReturn {
  // Process data
  processes: Process[];
  processTree: ProcessTree[];
  filteredProcesses: Process[];
  
  // System info
  systemInfo: {
    totalProcesses: number;
    runningProcesses: number;
    totalCpuUsage: number;
    totalMemoryUsage: number;
    availablePorts: number;
    usedPorts: number;
    uptime: number;
  };
  
  // Process operations
  createAppProcess: (appName: string, windowId?: string, needsNetwork?: boolean) => Process;
  createTabProcess: (tabTitle: string, browserPid: number, url?: string) => Process;
  createTerminalProcess: (command: string, terminalPid: number, needsNetwork?: boolean) => Process;
  createServiceProcess: (serviceName: string, owner?: string, needsNetwork?: boolean) => Process;
  
  killProcess: (pid: number, signal?: ProcessSignal['signal']) => boolean;
  suspendProcess: (pid: number) => boolean;
  resumeProcess: (pid: number) => boolean;
  
  // Process queries
  getProcess: (pid: number) => Process | undefined;
  getProcessByPort: (port: number) => Process | undefined;
  getNetworkProcesses: () => Process[];
  
  // Filtering and search
  filter: ProcessFilter;
  setFilter: (filter: ProcessFilter) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Sorting
  sortBy: keyof Process;
  setSortBy: (field: keyof Process) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Events
  onProcessCreated: (callback: (process: Process) => void) => () => void;
  onProcessDestroyed: (callback: (pid: number, exitCode: number) => void) => () => void;
  onProcessStatusChanged: (callback: (pid: number, oldStatus: ProcessStatus, newStatus: ProcessStatus) => void) => () => void;
  onMaliciousActivity: (callback: (pid: number, activity: string) => void) => () => void;
}

export function useProcessManager(): UseProcessManagerReturn {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processTree, setProcessTree] = useState<ProcessTree[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const [systemInfo, setSystemInfo] = useState({
    totalProcesses: 0,
    runningProcesses: 0,
    totalCpuUsage: 0,
    totalMemoryUsage: 0,
    availablePorts: 0,
    usedPorts: 0,
    uptime: 0
  });
  
  const [filter, setFilter] = useState<ProcessFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Process>('pid');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update processes from process manager
  const updateProcesses = useCallback(() => {
    try {
      const allProcesses = processManager.getProcessList();
      const tree = processManager.getProcessTree();
      const info = processManager.getSystemInfo();
      
      setProcesses(allProcesses);
      setProcessTree(tree);
      setSystemInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update processes');
    }
  }, []);
  
  // Apply filtering and sorting to processes
  const applyFiltering = useCallback(() => {
    let filtered = processManager.getProcessList({
      ...filter,
      searchTerm: searchTerm || undefined
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      let comparison = 0;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProcesses(filtered);
  }, [filter, searchTerm, sortBy, sortDirection]);
  
  // Initialize and setup periodic updates
  useEffect(() => {
    updateProcesses();
    applyFiltering();
    
    // Update every second
    updateIntervalRef.current = setInterval(() => {
      updateProcesses();
      applyFiltering();
    }, 1000);
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateProcesses, applyFiltering]);
  
  // Re-apply filtering when dependencies change
  useEffect(() => {
    applyFiltering();
  }, [applyFiltering]);
  
  // Process creation methods
  const createAppProcess = useCallback((appName: string, windowId?: string, needsNetwork: boolean = false) => {
    try {
      return processManager.createAppProcess(appName, windowId, needsNetwork);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create app process');
      throw err;
    }
  }, []);
  
  const createTabProcess = useCallback((tabTitle: string, browserPid: number, url?: string) => {
    try {
      return processManager.createTabProcess(tabTitle, browserPid, url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tab process');
      throw err;
    }
  }, []);
  
  const createTerminalProcess = useCallback((command: string, terminalPid: number, needsNetwork: boolean = false) => {
    try {
      return processManager.createTerminalCommandProcess(command, terminalPid, needsNetwork);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create terminal process');
      throw err;
    }
  }, []);
  
  const createServiceProcess = useCallback((serviceName: string, owner: string = 'root', needsNetwork: boolean = true) => {
    try {
      return processManager.createServiceProcess(serviceName, owner, needsNetwork);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service process');
      throw err;
    }
  }, []);
  
  // Process control methods
  const killProcess = useCallback((pid: number, signal: ProcessSignal['signal'] = 'SIGTERM') => {
    try {
      return processManager.killProcess(pid, signal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to kill process');
      return false;
    }
  }, []);
  
  const suspendProcess = useCallback((pid: number) => {
    try {
      return processManager.suspendProcess(pid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend process');
      return false;
    }
  }, []);
  
  const resumeProcess = useCallback((pid: number) => {
    try {
      return processManager.resumeProcess(pid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume process');
      return false;
    }
  }, []);
  
  // Process query methods
  const getProcess = useCallback((pid: number) => {
    return processManager.getProcess(pid);
  }, []);
  
  const getProcessByPort = useCallback((port: number) => {
    return processManager.getProcessByPort(port);
  }, []);
  
  const getNetworkProcesses = useCallback(() => {
    return processManager.getNetworkProcesses();
  }, []);
  
  // Event handlers
  const onProcessCreated = useCallback((callback: (process: Process) => void) => {
    processManager.on('PROCESS_CREATED', callback);
    return () => processManager.off('PROCESS_CREATED', callback);
  }, []);
  
  const onProcessDestroyed = useCallback((callback: (pid: number, exitCode: number) => void) => {
    processManager.on('PROCESS_DESTROYED', callback);
    return () => processManager.off('PROCESS_DESTROYED', callback);
  }, []);
  
  const onProcessStatusChanged = useCallback((callback: (pid: number, oldStatus: ProcessStatus, newStatus: ProcessStatus) => void) => {
    processManager.on('PROCESS_STATUS_CHANGED', callback);
    return () => processManager.off('PROCESS_STATUS_CHANGED', callback);
  }, []);
  
  const onMaliciousActivity = useCallback((callback: (pid: number, activity: string) => void) => {
    processManager.on('MALICIOUS_ACTIVITY_DETECTED', callback);
    return () => processManager.off('MALICIOUS_ACTIVITY_DETECTED', callback);
  }, []);
  
  return {
    // Process data
    processes,
    processTree,
    filteredProcesses,
    
    // System info
    systemInfo,
    
    // Process operations
    createAppProcess,
    createTabProcess,
    createTerminalProcess,
    createServiceProcess,
    
    killProcess,
    suspendProcess,
    resumeProcess,
    
    // Process queries
    getProcess,
    getProcessByPort,
    getNetworkProcesses,
    
    // Filtering and search
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    
    // Sorting
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    
    // State
    isLoading,
    error,
    
    // Events
    onProcessCreated,
    onProcessDestroyed,
    onProcessStatusChanged,
    onMaliciousActivity
  };
}
