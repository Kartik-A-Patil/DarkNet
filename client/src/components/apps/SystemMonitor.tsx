import React, { useState, useEffect } from 'react';
import { useOS } from '../../contexts/OSContext';

// Mock process type
interface Process {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  memory: number;
  status: 'running' | 'sleeping' | 'stopped';
  startTime: Date;
  command: string;
}

// Mock resource usage type
interface ResourceUsage {
  cpu: number;
  memory: number;
  swap: number;
  disk: number;
  network: {
    up: number;
    down: number;
  };
}

const SystemMonitor: React.FC = () => {
  const { isSudoMode } = useOS();
  const [activeTab, setActiveTab] = useState<'processes' | 'resources' | 'services'>('processes');
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage>({
    cpu: 0,
    memory: 0,
    swap: 0,
    disk: 0,
    network: { up: 0, down: 0 }
  });
  const [sortBy, setSortBy] = useState<keyof Process>('cpu');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProcessInfo, setShowProcessInfo] = useState(false);

  // Generate mock processes
  useEffect(() => {
    const mockProcesses: Process[] = [
      { pid: 1, name: 'systemd', user: 'root', cpu: 0.2, memory: 0.5, status: 'running', startTime: new Date(Date.now() - 86400000), command: '/sbin/init' },
      { pid: 412, name: 'NetworkManager', user: 'root', cpu: 0.4, memory: 1.2, status: 'running', startTime: new Date(Date.now() - 85400000), command: '/usr/sbin/NetworkManager --no-daemon' },
      { pid: 623, name: 'Xorg', user: 'root', cpu: 1.5, memory: 3.5, status: 'running', startTime: new Date(Date.now() - 82400000), command: '/usr/lib/xorg/Xorg :0 -seat seat0 -auth /var/run/lightdm/root/:0' },
      { pid: 842, name: 'gnome-shell', user: 'hackos', cpu: 2.8, memory: 8.2, status: 'running', startTime: new Date(Date.now() - 75400000), command: '/usr/bin/gnome-shell' },
      { pid: 1124, name: 'pulseaudio', user: 'hackos', cpu: 0.3, memory: 1.8, status: 'running', startTime: new Date(Date.now() - 73400000), command: '/usr/bin/pulseaudio --start' },
      { pid: 1286, name: 'firefox', user: 'hackos', cpu: 12.5, memory: 15.3, status: 'running', startTime: new Date(Date.now() - 63400000), command: '/usr/lib/firefox/firefox' },
      { pid: 1423, name: 'terminal', user: 'hackos', cpu: 0.7, memory: 2.3, status: 'running', startTime: new Date(Date.now() - 53400000), command: '/usr/bin/gnome-terminal' },
      { pid: 1625, name: 'ssh-agent', user: 'hackos', cpu: 0.1, memory: 0.4, status: 'running', startTime: new Date(Date.now() - 43400000), command: '/usr/bin/ssh-agent' },
      { pid: 1852, name: 'metasploit', user: 'hackos', cpu: 5.2, memory: 9.7, status: 'running', startTime: new Date(Date.now() - 33400000), command: 'ruby /usr/share/metasploit-framework/msfconsole' },
      { pid: 2034, name: 'nmap', user: 'hackos', cpu: 8.6, memory: 3.2, status: 'running', startTime: new Date(Date.now() - 23400000), command: '/usr/bin/nmap -sV -p 1-1000 192.168.1.1' },
      { pid: 2156, name: 'wireshark', user: 'hackos', cpu: 6.3, memory: 7.8, status: 'running', startTime: new Date(Date.now() - 13400000), command: '/usr/bin/wireshark' },
      { pid: 2268, name: 'hydra', user: 'root', cpu: 15.4, memory: 4.5, status: 'running', startTime: new Date(Date.now() - 3400000), command: '/usr/bin/hydra -l admin -P /usr/share/wordlists/rockyou.txt 192.168.1.5 ssh' },
    ];

    setProcesses(mockProcesses);

    // Simulate CPU and memory usage fluctuations
    const interval = setInterval(() => {
      setProcesses(prev => 
        prev.map(process => ({
          ...process,
          cpu: Math.min(100, Math.max(0.1, process.cpu + (Math.random() - 0.5) * 2)),
          memory: Math.min(25, Math.max(0.1, process.memory + (Math.random() - 0.5)))
        }))
      );

      setResourceUsage({
        cpu: Math.min(100, Math.max(10, resourceUsage.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.min(100, Math.max(20, resourceUsage.memory + (Math.random() - 0.5) * 5)),
        swap: Math.min(100, Math.max(5, resourceUsage.swap + (Math.random() - 0.5) * 3)),
        disk: 68 + Math.random() * 0.2,
        network: {
          up: Math.max(0, resourceUsage.network.up + (Math.random() - 0.3) * 50),
          down: Math.max(0, resourceUsage.network.down + (Math.random() - 0.3) * 100)
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sort and filter processes
  const filteredProcesses = processes
    .filter(process => 
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.command.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (valueA instanceof Date && valueB instanceof Date) {
        return sortDirection === 'asc' ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
      }
      
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

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
    setShowProcessInfo(true);
  };

  const killProcess = (pid: number) => {
    if (!isSudoMode && selectedProcess?.user === 'root') {
      alert('Permission denied: Cannot kill root process without sudo privileges');
      return;
    }
    
    setProcesses(processes.filter(p => p.pid !== pid));
    setShowProcessInfo(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (startTime: Date) => {
    const diff = Date.now() - startTime.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="h-full flex flex-col bg-window text-white">
      {/* Tabs */}
      <div className="flex bg-gray-900 px-2 pt-2">
        <div 
          className={`px-4 py-2 rounded-t cursor-pointer ${activeTab === 'processes' ? 'bg-window text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('processes')}
        >
          Processes
        </div>
        <div 
          className={`px-4 py-2 rounded-t cursor-pointer ${activeTab === 'resources' ? 'bg-window text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </div>
        <div 
          className={`px-4 py-2 rounded-t cursor-pointer ${activeTab === 'services' ? 'bg-window text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </div>
      </div>
      
      {/* Processes Tab */}
      {activeTab === 'processes' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search and action bar */}
          <div className="p-2 flex items-center bg-gray-800">
            <div className="flex items-center bg-gray-900 rounded px-2 flex-grow">
              <i className="fa fa-search text-gray-500 mr-2"></i>
              <input 
                type="text" 
                placeholder="Search processes..." 
                className="bg-transparent border-none p-1 focus:outline-none text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
              onClick={() => selectedProcess && killProcess(selectedProcess.pid)}
              disabled={!selectedProcess}
            >
              <i className="fa fa-times-circle mr-1"></i>
              End Process
            </button>
          </div>
          
          {/* Process list */}
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
                    Process Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('user')}
                  >
                    User {sortBy === 'user' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('cpu')}
                  >
                    CPU % {sortBy === 'cpu' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('memory')}
                  >
                    Memory % {sortBy === 'memory' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('startTime')}
                  >
                    Time {sortBy === 'startTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProcesses.map(process => (
                  <tr 
                    key={process.pid}
                    className={`hover:bg-gray-800 cursor-pointer ${selectedProcess?.pid === process.pid ? 'bg-gray-700' : ''}`}
                    onClick={() => handleProcessClick(process)}
                  >
                    <td className="px-3 py-1.5 border-t border-gray-800">{process.pid}</td>
                    <td className="px-3 py-1.5 border-t border-gray-800">{process.name}</td>
                    <td className="px-3 py-1.5 border-t border-gray-800">{process.user}</td>
                    <td className="px-3 py-1.5 border-t border-gray-800">
                      <span className={`px-1.5 py-0.5 rounded text-xs
                        ${process.status === 'running' ? 'bg-green-900 text-green-300' : 
                         process.status === 'sleeping' ? 'bg-blue-900 text-blue-300' : 
                         'bg-gray-700 text-gray-300'}`}>
                        {process.status}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 border-t border-gray-800">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              process.cpu > 70 ? 'bg-red-500' : 
                              process.cpu > 30 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, process.cpu)}%` }}
                          ></div>
                        </div>
                        {process.cpu.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-3 py-1.5 border-t border-gray-800">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, process.memory * 4)}%` }}
                          ></div>
                        </div>
                        {process.memory.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-3 py-1.5 border-t border-gray-800">
                      {formatDuration(process.startTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Status bar */}
          <div className="py-1 px-3 bg-gray-800 text-xs text-gray-400 flex justify-between">
            <div>{filteredProcesses.length} processes (showing {Math.min(filteredProcesses.length, 100)})</div>
            <div>Total CPU: {resourceUsage.cpu.toFixed(1)}% | Memory: {resourceUsage.memory.toFixed(1)}%</div>
          </div>
        </div>
      )}
      
      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* CPU Usage */}
            <div className="bg-gray-800 p-3 rounded">
              <h3 className="text-md font-medium mb-2">CPU Usage</h3>
              <div className="relative h-5 bg-gray-900 rounded mb-1">
                <div 
                  className={`absolute top-0 left-0 h-full rounded ${
                    resourceUsage.cpu > 80 ? 'bg-red-500' : 
                    resourceUsage.cpu > 60 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${resourceUsage.cpu}%` }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-semibold">
                  {resourceUsage.cpu.toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-gray-400 mb-3">
                <div className="grid grid-cols-2 gap-1">
                  <div>CPU Model: Intel Xeon X5650 @ 2.67GHz</div>
                  <div>Cores: 6 (12 threads)</div>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-1">Core Utilization</h4>
              <div className="grid grid-cols-4 gap-1 text-xs">
                {Array.from({ length: 12 }).map((_, i) => {
                  const usage = Math.min(100, Math.max(10, resourceUsage.cpu + (Math.random() - 0.5) * 30));
                  return (
                    <div key={i} className="mb-1">
                      <div className="mb-1">Core {i}</div>
                      <div className="relative h-2 bg-gray-900 rounded">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded ${
                            usage > 80 ? 'bg-red-500' : 
                            usage > 60 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${usage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Memory Usage */}
            <div className="bg-gray-800 p-3 rounded">
              <h3 className="text-md font-medium mb-2">Memory Usage</h3>
              <div className="relative h-5 bg-gray-900 rounded mb-1">
                <div 
                  className="absolute top-0 left-0 h-full rounded bg-blue-500"
                  style={{ width: `${resourceUsage.memory}%` }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-semibold">
                  {resourceUsage.memory.toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-gray-400 mb-3">
                <div className="grid grid-cols-2 gap-1">
                  <div>Total Memory: 16.0 GB</div>
                  <div>Available: {(16 * (100 - resourceUsage.memory) / 100).toFixed(1)} GB</div>
                  <div>Used: {(16 * resourceUsage.memory / 100).toFixed(1)} GB</div>
                  <div>Cached: 2.5 GB</div>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-1">Swap Usage</h4>
              <div className="relative h-2 bg-gray-900 rounded mb-3">
                <div 
                  className="absolute top-0 left-0 h-full rounded bg-purple-500"
                  style={{ width: `${resourceUsage.swap}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400">
                <div className="grid grid-cols-2 gap-1">
                  <div>Total Swap: 8.0 GB</div>
                  <div>Used: {(8 * resourceUsage.swap / 100).toFixed(1)} GB</div>
                </div>
              </div>
            </div>
            
            {/* Disk Usage */}
            <div className="bg-gray-800 p-3 rounded">
              <h3 className="text-md font-medium mb-2">Disk Usage</h3>
              <div className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-3">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <circle 
                        cx="18" cy="18" r="16" 
                        fill="none" 
                        stroke="#1f2937" 
                        strokeWidth="3"
                      />
                      <circle 
                        cx="18" cy="18" r="16" 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="3"
                        strokeDasharray={`${resourceUsage.disk} ${100 - resourceUsage.disk}`}
                        strokeDashoffset="25"
                        transform="rotate(-90 18 18)"
                      />
                      <text 
                        x="18" y="18" 
                        textAnchor="middle" 
                        dy=".3em" 
                        fontSize="8px" 
                        fill="white"
                      >
                        {resourceUsage.disk.toFixed(1)}%
                      </text>
                    </svg>
                  </div>
                </div>
                <div className="col-span-9">
                  <div className="text-sm mb-1">Mount Points</div>
                  <div className="text-xs text-gray-400">
                    <div className="grid grid-cols-12 gap-1 mb-1">
                      <div className="col-span-3 font-medium">Device</div>
                      <div className="col-span-2 font-medium">Size</div>
                      <div className="col-span-2 font-medium">Used</div>
                      <div className="col-span-2 font-medium">Available</div>
                      <div className="col-span-3 font-medium">Mount</div>
                    </div>
                    <div className="grid grid-cols-12 gap-1 mb-1">
                      <div className="col-span-3">/dev/sda1</div>
                      <div className="col-span-2">120 GB</div>
                      <div className="col-span-2">{(120 * resourceUsage.disk / 100).toFixed(1)} GB</div>
                      <div className="col-span-2">{(120 * (100 - resourceUsage.disk) / 100).toFixed(1)} GB</div>
                      <div className="col-span-3">/</div>
                    </div>
                    <div className="grid grid-cols-12 gap-1 mb-1">
                      <div className="col-span-3">/dev/sdb1</div>
                      <div className="col-span-2">500 GB</div>
                      <div className="col-span-2">125 GB</div>
                      <div className="col-span-2">375 GB</div>
                      <div className="col-span-3">/data</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-1">Disk I/O</h4>
              <div className="text-xs text-gray-400">
                <div className="grid grid-cols-3 gap-1">
                  <div>Read: 2.5 MB/s</div>
                  <div>Write: 1.2 MB/s</div>
                  <div>IOPS: 32</div>
                </div>
              </div>
            </div>
            
            {/* Network Usage */}
            <div className="bg-gray-800 p-3 rounded">
              <h3 className="text-md font-medium mb-2">Network Traffic</h3>
              <div className="mb-3">
                <div className="text-sm mb-1">Download</div>
                <div className="relative h-3 bg-gray-900 rounded mb-1">
                  <div 
                    className="absolute top-0 left-0 h-full rounded bg-green-500"
                    style={{ width: `${Math.min(100, resourceUsage.network.down / 10)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 text-right">{resourceUsage.network.down.toFixed(1)} KB/s</div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm mb-1">Upload</div>
                <div className="relative h-3 bg-gray-900 rounded mb-1">
                  <div 
                    className="absolute top-0 left-0 h-full rounded bg-blue-500"
                    style={{ width: `${Math.min(100, resourceUsage.network.up / 5)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 text-right">{resourceUsage.network.up.toFixed(1)} KB/s</div>
              </div>
              
              <h4 className="text-sm font-medium mb-1">Network Interfaces</h4>
              <div className="text-xs text-gray-400">
                <div className="grid grid-cols-12 gap-1 mb-1">
                  <div className="col-span-3 font-medium">Interface</div>
                  <div className="col-span-4 font-medium">IP Address</div>
                  <div className="col-span-3 font-medium">RX/TX</div>
                  <div className="col-span-2 font-medium">Status</div>
                </div>
                <div className="grid grid-cols-12 gap-1 mb-1">
                  <div className="col-span-3">eth0</div>
                  <div className="col-span-4">192.168.1.105</div>
                  <div className="col-span-3">{resourceUsage.network.down.toFixed(1)}/{resourceUsage.network.up.toFixed(1)} KB/s</div>
                  <div className="col-span-2 text-green-400">UP</div>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-3">lo</div>
                  <div className="col-span-4">127.0.0.1</div>
                  <div className="col-span-3">0/0 KB/s</div>
                  <div className="col-span-2 text-green-400">UP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4">
            <div className="text-sm mb-2">System Services Status</div>
            <div className="bg-gray-800 rounded p-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold p-2 border-b border-gray-700">
                <div className="col-span-4">Service Name</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-3">Description</div>
              </div>
              
              <div className="py-1 px-2 border-b border-gray-700 grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-4">apache2.service</div>
                <div className="col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-900 text-green-300">active</span>
                </div>
                <div className="col-span-3 text-xs">web server</div>
                <div className="col-span-3 text-xs text-gray-400">Apache HTTP Server</div>
              </div>
              
              <div className="py-1 px-2 border-b border-gray-700 grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-4">postgresql.service</div>
                <div className="col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-900 text-green-300">active</span>
                </div>
                <div className="col-span-3 text-xs">database</div>
                <div className="col-span-3 text-xs text-gray-400">PostgreSQL Database Server</div>
              </div>
              
              <div className="py-1 px-2 border-b border-gray-700 grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-4">ssh.service</div>
                <div className="col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-900 text-green-300">active</span>
                </div>
                <div className="col-span-3 text-xs">network</div>
                <div className="col-span-3 text-xs text-gray-400">OpenSSH Server</div>
              </div>
              
              <div className="py-1 px-2 border-b border-gray-700 grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-4">nginx.service</div>
                <div className="col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-red-900 text-red-300">inactive</span>
                </div>
                <div className="col-span-3 text-xs">web server</div>
                <div className="col-span-3 text-xs text-gray-400">Nginx HTTP Server</div>
              </div>
              
              <div className="py-1 px-2 border-b border-gray-700 grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-4">mysql.service</div>
                <div className="col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-red-900 text-red-300">inactive</span>
                </div>
                <div className="col-span-3 text-xs">database</div>
                <div className="col-span-3 text-xs text-gray-400">MySQL Database Server</div>
              </div>
              
              <div className="py-1 px-2 border-b border-gray-700 grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-4">NetworkManager.service</div>
                <div className="col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-900 text-green-300">active</span>
                </div>
                <div className="col-span-3 text-xs">network</div>
                <div className="col-span-3 text-xs text-gray-400">Network Manager</div>
              </div>
              
              <div className="py-1 px-2 border-b border-gray-700 grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-4">lightdm.service</div>
                <div className="col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-900 text-green-300">active</span>
                </div>
                <div className="col-span-3 text-xs">display manager</div>
                <div className="col-span-3 text-xs text-gray-400">Light Display Manager</div>
              </div>
              
              <div className="py-1 px-2 grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-4">bluetooth.service</div>
                <div className="col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-900 text-yellow-300">inactive</span>
                </div>
                <div className="col-span-3 text-xs">bluetooth</div>
                <div className="col-span-3 text-xs text-gray-400">Bluetooth Service</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded p-3">
              <h3 className="text-md font-medium mb-2">Service Management</h3>
              <div className="text-sm mb-3">
                <p>Service management requires root privileges for most operations.</p>
              </div>
              <div className="flex space-x-2">
                <button className={`px-3 py-1 rounded text-white text-sm ${isSudoMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}>
                  <i className="fa fa-play mr-1"></i>
                  Start Service
                </button>
                <button className={`px-3 py-1 rounded text-white text-sm ${isSudoMode ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}>
                  <i className="fa fa-stop mr-1"></i>
                  Stop Service
                </button>
                <button className={`px-3 py-1 rounded text-white text-sm ${isSudoMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}>
                  <i className="fa fa-sync mr-1"></i>
                  Restart
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded p-3">
              <h3 className="text-md font-medium mb-2">Startup Services</h3>
              <div className="text-sm mb-2">
                <p>Services configured to start automatically on boot:</p>
              </div>
              <div className="text-xs space-y-1 text-gray-300">
                <div className="flex items-center">
                  <input type="checkbox" checked className="mr-2" />
                  <span>NetworkManager.service</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked className="mr-2" />
                  <span>ssh.service</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked className="mr-2" />
                  <span>apache2.service</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked className="mr-2" />
                  <span>postgresql.service</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>mysql.service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Process Details Modal */}
      {showProcessInfo && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowProcessInfo(false)}>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Process Details: {selectedProcess.name}</h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowProcessInfo(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-gray-400">Process ID:</div>
                <div>{selectedProcess.pid}</div>
                <div className="text-gray-400">Name:</div>
                <div>{selectedProcess.name}</div>
                <div className="text-gray-400">User:</div>
                <div>{selectedProcess.user}</div>
                <div className="text-gray-400">Status:</div>
                <div>
                  <span className={`px-1.5 py-0.5 rounded text-xs
                    ${selectedProcess.status === 'running' ? 'bg-green-900 text-green-300' : 
                     selectedProcess.status === 'sleeping' ? 'bg-blue-900 text-blue-300' : 
                     'bg-gray-700 text-gray-300'}`}>
                    {selectedProcess.status}
                  </span>
                </div>
                <div className="text-gray-400">CPU Usage:</div>
                <div>{selectedProcess.cpu.toFixed(1)}%</div>
                <div className="text-gray-400">Memory Usage:</div>
                <div>{selectedProcess.memory.toFixed(1)}% ({(selectedProcess.memory * 0.16).toFixed(2)} GB)</div>
                <div className="text-gray-400">Started:</div>
                <div>{selectedProcess.startTime.toLocaleString()}</div>
                <div className="text-gray-400">Runtime:</div>
                <div>{formatDuration(selectedProcess.startTime)}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm font-medium mb-1">Command:</div>
              <div className="bg-gray-900 p-2 rounded text-xs font-mono overflow-x-auto">
                {selectedProcess.command}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                onClick={() => killProcess(selectedProcess.pid)}
              >
                <i className="fa fa-times-circle mr-1"></i>
                End Process
              </button>
              <button 
                className={`px-3 py-1 rounded text-white text-sm ${
                  isSudoMode || selectedProcess.user !== 'root' ? 
                  'bg-yellow-600 hover:bg-yellow-700' : 
                  'bg-gray-700 opacity-50 cursor-not-allowed'
                }`}
                disabled={!isSudoMode && selectedProcess.user === 'root'}
              >
                <i className="fa fa-skull mr-1"></i>
                Force Kill
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
                <i className="fa fa-pause-circle mr-1"></i>
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitor;