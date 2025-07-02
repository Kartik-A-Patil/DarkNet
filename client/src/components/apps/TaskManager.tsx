import React, { useState, useEffect, useMemo } from 'react';
import { useProcessManager } from '../../core/processManager/useProcessManager';
import { Process, ProcessType, ProcessStatus, ProcessTree } from '../../core/processManager/types';

interface TaskManagerProps {
  onClose?: () => void;
}

interface ProcessTreeNodeProps {
  tree: ProcessTree;
  onProcessClick: (process: Process) => void;
  onProcessCrash?: (pid: number) => void;
}

const ProcessTreeNode: React.FC<ProcessTreeNodeProps> = ({ tree, onProcessClick, onProcessCrash }) => {
  const [expanded, setExpanded] = useState(true);
  const { process, children, depth } = tree;

  const getStatusColor = (status: ProcessStatus) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'sleeping': return 'text-blue-400';
      case 'stopped': return 'text-gray-400';
      case 'zombie': return 'text-red-400';
      case 'waiting': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: ProcessType) => {
    switch (type) {
      case 'system': return 'fa-cog';
      case 'service': return 'fa-server';
      case 'app': return 'fa-window-maximize';
      case 'tab': return 'fa-globe';
      case 'terminal': return 'fa-terminal';
      case 'subprocess': return 'fa-code-branch';
      default: return 'fa-circle';
    }
  };

  const indentStyle = {
    marginLeft: `${depth * 24}px`
  };

  return (
    <div className="font-mono text-sm">
      <div 
        className="flex items-center space-x-2 p-1 hover:bg-gray-700 rounded cursor-pointer"
        style={indentStyle}
        onClick={() => onProcessClick(process)}
      >
        {children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <i className={`fa ${expanded ? 'fa-chevron-down' : 'fa-chevron-right'} text-xs`}></i>
          </button>
        )}
        {children.length === 0 && <div className="w-4"></div>}
        
        <div className="flex items-center space-x-2 flex-1">
          <i className={`fa ${getTypeIcon(process.type)} text-gray-400`}></i>
          <span className="font-medium">{process.name}</span>
          <span className="text-gray-500">({process.pid})</span>
          <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(process.status)}`}>
            {process.status}
          </span>
          {process.isMalicious && (
            <span className="px-1 py-0.5 rounded text-xs bg-red-900 text-red-300">
              <i className="fa fa-virus mr-1"></i>
              MALICIOUS
            </span>
          )}
          {process.status === 'zombie' && (
            <span className="px-1 py-0.5 rounded text-xs bg-red-900 text-red-300">
              <i className="fa fa-skull mr-1"></i>
              ZOMBIE
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span>CPU: {process.resources.cpuPercent.toFixed(1)}%</span>
          <span>MEM: {process.resources.memoryPercent.toFixed(1)}%</span>
          {onProcessCrash && process.status === 'running' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProcessCrash(process.pid);
              }}
              className="px-1 py-0.5 bg-red-600 hover:bg-red-700 rounded text-white"
              title="Simulate crash"
            >
              <i className="fa fa-bomb"></i>
            </button>
          )}
        </div>
      </div>
      
      {expanded && children.map(child => (
        <ProcessTreeNode
          key={child.process.pid}
          tree={child}
          onProcessClick={onProcessClick}
          onProcessCrash={onProcessCrash}
        />
      ))}
    </div>
  );
};

const TaskManager: React.FC<TaskManagerProps> = ({ onClose }) => {
  const {
    processes,
    processTree,
    filteredProcesses,
    systemInfo,
    killProcess,
    suspendProcess,
    resumeProcess,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    getProcess,
    onMaliciousActivity
  } = useProcessManager();

  const [activeTab, setActiveTab] = useState<'processes' | 'performance' | 'services' | 'network' | 'tree'>('processes');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [showProcessDetails, setShowProcessDetails] = useState(false);
  const [showAdvancedView, setShowAdvancedView] = useState(false);
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'warning' | 'error'; message: string; timestamp: Date }>>([]);
  const [statistics, setStatistics] = useState<any>(null);

  // Listen for malicious activity
  useEffect(() => {
    const unsubscribe = onMaliciousActivity((pid, activity) => {
      const process = getProcess(pid);
      const alert = {
        id: `alert_${Date.now()}`,
        type: 'error' as const,
        message: `Malicious activity detected in ${process?.name || 'unknown process'} (PID: ${pid}): ${activity}`,
        timestamp: new Date()
      };
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    });

    return unsubscribe;
  }, [onMaliciousActivity, getProcess]);

  // Update statistics periodically
  useEffect(() => {
    const updateStats = () => {
      // Access the processManager singleton to get additional statistics
      import('../../core/processManager/ProcessManager').then(({ processManager }) => {
        setStatistics(processManager.getProcessStatistics());
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (column: keyof Process) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const handleProcessClick = (process: Process) => {
    setSelectedProcess(process);
    setShowProcessDetails(true);
  };

  const handleKillProcess = (pid: number, force = false) => {
    if (force) {
      killProcess(pid, 'SIGKILL');
    } else {
      killProcess(pid, 'SIGTERM');
    }
    setShowProcessDetails(false);
    setSelectedProcess(null);
  };

  const handleCleanupZombies = () => {
    import('../../core/processManager/ProcessManager').then(({ processManager }) => {
      const cleaned = processManager.cleanupZombieProcesses();
      const alert = {
        id: `cleanup_${Date.now()}`,
        type: 'warning' as const,
        message: `Cleaned up ${cleaned} zombie processes`,
        timestamp: new Date()
      };
      setAlerts(prev => [alert, ...prev.slice(0, 9)]);
    });
  };

  const handleSimulateMalicious = () => {
    import('../../core/processManager/ProcessManager').then(({ processManager }) => {
      processManager.simulateMaliciousActivity();
    });
  };

  const handleProcessCrash = (pid: number) => {
    import('../../core/processManager/ProcessManager').then(({ processManager }) => {
      processManager.simulateProcessCrash(pid);
    });
  };

  const formatMemoryAddress = (address: string) => {
    return address.length > 10 ? `${address.substring(0, 10)}...` : address;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: ProcessStatus) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'sleeping': return 'text-blue-400';
      case 'stopped': return 'text-gray-400';
      case 'zombie': return 'text-red-400';
      case 'waiting': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: ProcessType) => {
    switch (type) {
      case 'system': return 'fa-cog';
      case 'service': return 'fa-server';
      case 'app': return 'fa-window-maximize';
      case 'tab': return 'fa-globe';
      case 'terminal': return 'fa-terminal';
      case 'subprocess': return 'fa-code-branch';
      default: return 'fa-circle';
    }
  };

  const networkProcesses = useMemo(() => {
    return filteredProcesses.filter(p => p.network?.port);
  }, [filteredProcesses]);

  const serviceProcesses = useMemo(() => {
    return filteredProcesses.filter(p => p.type === 'service' || p.type === 'system');
  }, [filteredProcesses]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <i className="fa fa-tasks text-cyan-400 text-xl"></i>
          <h1 className="text-xl font-bold">Task Manager</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Processes: {systemInfo.totalProcesses}</span>
            <span>•</span>
            <span>Running: {systemInfo.runningProcesses}</span>
            <span>•</span>
            <span>CPU: {systemInfo.totalCpuUsage.toFixed(1)}%</span>
            <span>•</span>
            <span>Memory: {systemInfo.totalMemoryUsage.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvancedView(!showAdvancedView)}
            className={`px-3 py-1 rounded text-sm ${showAdvancedView ? 'bg-cyan-600' : 'bg-gray-700'} hover:bg-cyan-700`}
          >
            Advanced
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <i className="fa fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="p-2 bg-red-900 border-b border-red-700">
          <div className="flex items-center space-x-2">
            <i className="fa fa-exclamation-triangle text-red-400"></i>
            <span className="text-sm">{alerts[0].message}</span>
            <button
              onClick={() => setAlerts(alerts.slice(1))}
              className="ml-auto text-red-400 hover:text-white"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        {[
          { id: 'processes', label: 'Processes', icon: 'fa-list' },
          { id: 'performance', label: 'Performance', icon: 'fa-chart-line' },
          { id: 'services', label: 'Services', icon: 'fa-server' },
          { id: 'network', label: 'Network', icon: 'fa-network-wired' },
          { id: 'tree', label: 'Process Tree', icon: 'fa-sitemap' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 ${
              activeTab === tab.id ? 'bg-gray-700 border-b-2 border-cyan-400' : ''
            }`}
          >
            <i className={`fa ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'processes' && (
          <div className="flex flex-col h-full">
            {/* Search and Filter */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search processes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <select
                  value={filter.type?.[0] || ''}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value ? [e.target.value as ProcessType] : undefined })}
                  className="px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="system">System</option>
                  <option value="service">Service</option>
                  <option value="app">Application</option>
                  <option value="tab">Tab</option>
                  <option value="terminal">Terminal</option>
                  <option value="subprocess">Subprocess</option>
                </select>
                <select
                  value={filter.status?.[0] || ''}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value ? [e.target.value as ProcessStatus] : undefined })}
                  className="px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="">All Status</option>
                  <option value="running">Running</option>
                  <option value="sleeping">Sleeping</option>
                  <option value="stopped">Stopped</option>
                  <option value="zombie">Zombie</option>
                  <option value="waiting">Waiting</option>
                </select>
              </div>
            </div>

            {/* Process List */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 sticky top-0">
                  <tr>
                    <th 
                      className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('pid')}
                    >
                      PID {sortBy === 'pid' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('type')}
                    >
                      Type {sortBy === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('status')}
                    >
                      Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('owner')}
                    >
                      Owner {sortBy === 'owner' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-3 py-2 text-right">CPU %</th>
                    <th className="px-3 py-2 text-right">Memory %</th>
                    {showAdvancedView && (
                      <>
                        <th className="px-3 py-2 text-left">Memory Addr</th>
                        <th className="px-3 py-2 text-right">Port</th>
                        <th className="px-3 py-2 text-right">Uptime</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredProcesses.map(process => (
                    <tr
                      key={process.pid}
                      className={`hover:bg-gray-800 cursor-pointer border-t border-gray-800 ${
                        selectedProcess?.pid === process.pid ? 'bg-gray-700' : ''
                      } ${process.isMalicious ? 'bg-red-900' : ''}`}
                      onClick={() => handleProcessClick(process)}
                    >
                      <td className="px-3 py-2">{process.pid}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <i className={`fa ${getTypeIcon(process.type)} text-gray-400`}></i>
                          <span className={process.isHidden ? 'text-gray-500 italic' : ''}>
                            {process.name}
                          </span>
                          {process.isMalicious && (
                            <i className="fa fa-exclamation-triangle text-red-400" title="Malicious process detected"></i>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {process.type}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(process.status)}`}>
                          {process.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{process.owner}</td>
                      <td className="px-3 py-2 text-right">{process.resources.cpuPercent.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">{process.resources.memoryPercent.toFixed(1)}</td>
                      {showAdvancedView && (
                        <>
                          <td className="px-3 py-2 font-mono text-xs">{formatMemoryAddress(process.memory.address)}</td>
                          <td className="px-3 py-2 text-right">{process.network?.port || '-'}</td>
                          <td className="px-3 py-2 text-right">{formatUptime(process.uptime)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statistics */}
            {statistics && (
              <div className="p-4 bg-gray-800 border-t border-gray-700">
                <h3 className="text-lg font-semibold">Statistics</h3>
                <pre className="text-sm text-gray-400">{JSON.stringify(statistics, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="p-4 space-y-6">
            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Processes</p>
                    <p className="text-2xl font-bold">{systemInfo.totalProcesses}</p>
                  </div>
                  <i className="fa fa-list text-cyan-400 text-2xl"></i>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Running</p>
                    <p className="text-2xl font-bold text-green-400">{systemInfo.runningProcesses}</p>
                  </div>
                  <i className="fa fa-play text-green-400 text-2xl"></i>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">CPU Usage</p>
                    <p className="text-2xl font-bold text-orange-400">{systemInfo.totalCpuUsage.toFixed(1)}%</p>
                  </div>
                  <i className="fa fa-microchip text-orange-400 text-2xl"></i>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Memory Usage</p>
                    <p className="text-2xl font-bold text-blue-400">{systemInfo.totalMemoryUsage.toFixed(1)}%</p>
                  </div>
                  <i className="fa fa-memory text-blue-400 text-2xl"></i>
                </div>
              </div>
            </div>

            {/* Network Ports */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Network Ports</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Available Ports</p>
                  <p className="text-xl font-bold text-green-400">{systemInfo.availablePorts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Used Ports</p>
                  <p className="text-xl font-bold text-red-400">{systemInfo.usedPorts}</p>
                </div>
              </div>
            </div>

            {/* System Uptime */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">System Uptime</h3>
              <p className="text-2xl font-bold text-cyan-400">{formatUptime(systemInfo.uptime)}</p>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="p-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold">System Services</h3>
              </div>
              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Service</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Owner</th>
                      <th className="px-3 py-2 text-right">CPU %</th>
                      <th className="px-3 py-2 text-right">Memory %</th>
                      <th className="px-3 py-2 text-right">Uptime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceProcesses.map(service => (
                      <tr key={service.pid} className="hover:bg-gray-700 border-t border-gray-800">
                        <td className="px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <i className={`fa ${getTypeIcon(service.type)} text-gray-400`}></i>
                            <span>{service.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">{service.owner}</td>
                        <td className="px-3 py-2 text-right">{service.resources.cpuPercent.toFixed(1)}</td>
                        <td className="px-3 py-2 text-right">{service.resources.memoryPercent.toFixed(1)}</td>
                        <td className="px-3 py-2 text-right">{formatUptime(service.uptime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="p-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Network Processes</h3>
              </div>
              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Process</th>
                      <th className="px-3 py-2 text-right">PID</th>
                      <th className="px-3 py-2 text-right">Port</th>
                      <th className="px-3 py-2 text-left">Connections</th>
                      <th className="px-3 py-2 text-right">Network RX</th>
                      <th className="px-3 py-2 text-right">Network TX</th>
                    </tr>
                  </thead>
                  <tbody>
                    {networkProcesses.map(process => (
                      <tr key={process.pid} className="hover:bg-gray-700 border-t border-gray-800">
                        <td className="px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <i className={`fa ${getTypeIcon(process.type)} text-gray-400`}></i>
                            <span>{process.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">{process.pid}</td>
                        <td className="px-3 py-2 text-right">{process.network?.port}</td>
                        <td className="px-3 py-2">{process.network?.connections.length || 0}</td>
                        <td className="px-3 py-2 text-right">{formatBytes(process.resources.networkRx)}</td>
                        <td className="px-3 py-2 text-right">{formatBytes(process.resources.networkTx)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tree' && (
          <div className="p-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Process Tree</h3>
                <div className="flex items-center space-x-2">
                  {showAdvancedView && (
                    <>
                      <button
                        onClick={handleCleanupZombies}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                      >
                        <i className="fa fa-broom mr-1"></i>
                        Cleanup Zombies
                      </button>
                      <button
                        onClick={handleSimulateMalicious}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                      >
                        <i className="fa fa-virus mr-1"></i>
                        Simulate Malicious
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="overflow-auto max-h-96 p-4">
                {processTree.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <i className="fa fa-tree text-4xl mb-4"></i>
                    <p>No process tree available</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {processTree.map((tree, index) => (
                      <ProcessTreeNode 
                        key={tree.process.pid} 
                        tree={tree} 
                        onProcessClick={handleProcessClick}
                        onProcessCrash={showAdvancedView ? handleProcessCrash : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
              {statistics && (
                <div className="p-4 border-t border-gray-700 bg-gray-900">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Zombies</div>
                      <div className="text-red-400 font-bold">{statistics.zombies}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Malicious</div>
                      <div className="text-red-400 font-bold">{statistics.malicious}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Hidden</div>
                      <div className="text-yellow-400 font-bold">{statistics.hidden}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Avg CPU</div>
                      <div className="text-green-400 font-bold">{statistics.avgCpu.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Process Details Modal */}
      {showProcessDetails && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Process Details</h2>
              <button
                onClick={() => setShowProcessDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Process ID</label>
                <p className="text-lg font-mono">{selectedProcess.pid}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Parent PID</label>
                <p className="text-lg font-mono">{selectedProcess.ppid}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <p className="text-lg">{selectedProcess.name}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <p className="text-lg">{selectedProcess.type}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedProcess.status)}`}>
                  {selectedProcess.status}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Owner</label>
                <p className="text-lg">{selectedProcess.owner}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Memory Address</label>
                <p className="text-lg font-mono">{selectedProcess.memory.address}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Memory Size</label>
                <p className="text-lg">{formatBytes(selectedProcess.memory.size * 1024)}</p>
              </div>
              {selectedProcess.network?.port && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Network Port</label>
                  <p className="text-lg font-mono">{selectedProcess.network.port}</p>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Uptime</label>
                <p className="text-lg">{formatUptime(selectedProcess.uptime)}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-1">Command</label>
              <div className="bg-gray-900 p-3 rounded font-mono text-sm">
                {selectedProcess.environment.command}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {selectedProcess.canKill && (
                <>
                  <button
                    onClick={() => handleKillProcess(selectedProcess.pid)}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
                  >
                    <i className="fa fa-stop mr-2"></i>
                    Terminate
                  </button>
                  <button
                    onClick={() => handleKillProcess(selectedProcess.pid, true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                  >
                    <i className="fa fa-skull mr-2"></i>
                    Force Kill
                  </button>
                </>
              )}
              <button
                onClick={() => setShowProcessDetails(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
