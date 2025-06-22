import React, { useState, useEffect } from 'react';
import { useNetworkFileSystem } from '../../../lib/useNetworkFileSystem';
import { NetworkDevice, NetworkNode, debugNetworkDatabase, clearNetworkDatabase, initializeSampleNetworkData } from '../../../lib/networkFileSystem';

interface NetworkViewProps {
  onNavigateToPath: (path: string) => void;
}

const NetworkView: React.FC<NetworkViewProps> = ({ onNavigateToPath }) => {
  console.log('NetworkView: Component mounting...');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'devices' | 'files'>('devices');
  
  // Use the network file system hook
  const {
    networkDevices,
    currentDevice,
    currentPath,
    currentNodes,
    isLoading,
    error,
    connectToDevice,
    disconnectFromDevice,
    refreshDevices,
    navigateToPath,
    navigateUp,
    createFile,
    createDirectory,
    deleteNode,
    readFile,
    getNodeIcon,
    formatFileSize,
    getDeviceStatus
  } = useNetworkFileSystem();

  // Auto-refresh devices periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDevices();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [refreshDevices]);

  const selectedDevice = networkDevices.find(d => d.id === selectedDeviceId) || null;

  const handleDeviceClick = async (device: NetworkDevice) => {
    try {
      setSelectedDeviceId(device.id);
      
      // Connect to the device and navigate to root
      const connectedDevice = await connectToDevice(device.ip);
      if (connectedDevice) {
        setViewMode('files');
        await navigateToPath(device.id, '/');
      }
    } catch (error) {
      console.error('Failed to connect to device:', error);
    }
  };

  const handleFolderClick = async (node: NetworkNode) => {
    if (node.type === 'directory' && currentDevice) {
      try {
        await navigateToPath(currentDevice.id, node.path);
      } catch (error) {
        console.error('Failed to navigate to folder:', error);
      }
    }
  };

  const handleFileClick = async (node: NetworkNode) => {
    if (node.type === 'file') {
      try {
        const content = await readFile(node.id);
        if (content) {
          // For now, show the file content in an alert
          // In a real implementation, this would open the file in the appropriate app
          alert(`File: ${node.name}\n\nContent:\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`);
          
          // Or navigate to the file path in the main file manager
          onNavigateToPath(`//network/${currentDevice?.ip}${node.path}`);
        }
      } catch (error) {
        console.error('Failed to read file:', error);
      }
    }
  };

  const handleCreateFolder = async () => {
    if (!currentDevice) return;
    
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      try {
        await createDirectory(folderName);
        // Refresh the current directory
        await navigateToPath(currentDevice.id, currentPath);
      } catch (error) {
        console.error('Failed to create folder:', error);
      }
    }
  };

  const handleCreateFile = async () => {
    if (!currentDevice) return;
    
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const content = prompt('Enter file content (optional):') || '';
      try {
        await createFile(fileName, content);
        // Refresh the current directory
        await navigateToPath(currentDevice.id, currentPath);
      } catch (error) {
        console.error('Failed to create file:', error);
      }
    }
  };

  const handleDeleteNode = async (node: NetworkNode) => {
    if (confirm(`Are you sure you want to delete ${node.name}?`)) {
      try {
        await deleteNode(node.id);
        // Refresh the current directory
        if (currentDevice) {
          await navigateToPath(currentDevice.id, currentPath);
        }
      } catch (error) {
        console.error('Failed to delete node:', error);
      }
    }
  };

  const handleBackToDevices = () => {
    setViewMode('devices');
    setSelectedDeviceId(null);
    disconnectFromDevice();
  };

  const getDeviceIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'server': 'fa-server',
      'workstation': 'fa-desktop',
      'nas': 'fa-hdd',
      'router': 'fa-wifi',
      'switch': 'fa-network-wired',
      'printer': 'fa-print',
      'camera': 'fa-camera',
      'iot': 'fa-microchip',
      'database': 'fa-database'
    };
    return icons[type] || 'fa-question';
  };

  const getDeviceTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'database': 'text-purple-400',
      'server': 'text-blue-400',
      'router': 'text-green-400',
      'nas': 'text-yellow-400',
      'workstation': 'text-cyan-400',
      'switch': 'text-orange-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const getDeviceDescription = (device: NetworkDevice) => {
    switch (device.type) {
      case 'database':
        return 'Database server with live monitoring and real-time traffic analysis';
      case 'router':
        return 'Network router with configuration access and traffic logs';
      case 'server':
        return 'File server with shared resources and web services';
      case 'nas':
        return 'Network attached storage with media and backup files';
      default:
        return `${device.type} device with network capabilities`;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'text-green-400';
      case 'limited': return 'text-yellow-400';
      case 'read-only': return 'text-blue-400';
      case 'restricted': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderDatabaseMonitoring = (device: NetworkDevice) => {
    if (device.type !== 'database') return null;

    return (
      <div className="bg-gray-800 p-4 rounded-lg mt-4 border border-purple-500/30">
        <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
          <i className="fa fa-heartbeat mr-2"></i>
          Live Database Monitoring
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Connection Stats */}
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Active Connections</div>
            <div className="text-2xl font-bold text-green-400">45/200</div>
            <div className="text-xs text-gray-500">Max connections: 200</div>
          </div>

          {/* Query Performance */}
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Queries/sec</div>
            <div className="text-2xl font-bold text-blue-400">127</div>
            <div className="text-xs text-gray-500">Avg response: 0.05ms</div>
          </div>

          {/* Storage Usage */}
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Storage Used</div>
            <div className="text-2xl font-bold text-yellow-400">78%</div>
            <div className="text-xs text-gray-500">2.3TB / 3TB</div>
          </div>

          {/* CPU Usage */}
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">CPU Usage</div>
            <div className="text-2xl font-bold text-orange-400">23%</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
              <div className="bg-orange-400 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Memory Usage</div>
            <div className="text-2xl font-bold text-red-400">67%</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
              <div className="bg-red-400 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>

          {/* Network I/O */}
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Network I/O</div>
            <div className="text-sm text-green-400">↑ 125.5 MB/s</div>
            <div className="text-sm text-blue-400">↓ 89.2 MB/s</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-4">
          <div className="text-sm font-semibold text-gray-300 mb-2">Recent Database Activity</div>
          <div className="bg-gray-900 p-3 rounded font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
            <div className="text-green-400">{new Date().toISOString()} [INFO] Connection from 192.168.1.100 accepted</div>
            <div className="text-blue-400">{new Date().toISOString()} [QUERY] SELECT * FROM users WHERE active=1</div>
            <div className="text-yellow-400">{new Date().toISOString()} [SLOW] Query took 2.3s to execute</div>
            <div className="text-red-400">{new Date().toISOString()} [WARNING] Failed login attempt from 192.168.1.25</div>
            <div className="text-green-400">{new Date().toISOString()} [INFO] Backup process completed successfully</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs">
            <i className="fa fa-chart-bar mr-1"></i>
            View Metrics
          </button>
          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">
            <i className="fa fa-list mr-1"></i>
            Query Logs
          </button>
          <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs">
            <i className="fa fa-users mr-1"></i>
            Active Sessions
          </button>
          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs">
            <i className="fa fa-download mr-1"></i>
            Export Data
          </button>
        </div>
      </div>
    );
  };

  // Real-time database monitoring simulation
  useEffect(() => {
    if (currentDevice?.type === 'database' && viewMode === 'files') {
      const interval = setInterval(() => {
        // Simulate real-time database activity
        // This would trigger re-renders to show live data
        // In a real implementation, this would fetch actual metrics
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentDevice, viewMode]);

  if (isLoading) {
    return (
      <div className="network-view h-full bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <i className="fa fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <div className="text-xl text-gray-400">Loading Network Devices...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="network-view h-full bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <i className="fa fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <div className="text-xl text-gray-400 mb-4">Network Error</div>
          <div className="text-sm text-gray-500 mb-4 bg-gray-800 p-3 rounded font-mono">
            {error}
          </div>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={refreshDevices}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              <i className="fa fa-refresh mr-2"></i>
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
            >
              <i className="fa fa-reload mr-2"></i>
              Reload Page
            </button>
          </div>
          <div className="text-xs text-gray-600 mt-4">
            Check the browser console for more details
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="network-view h-full bg-gray-900 text-white">
      {/* Debug Header - Always Visible */}
      <div className="p-4 bg-gray-800 border-b border-blue-500">
        <h3 className="text-lg font-bold text-blue-400 mb-2">Network File System Debug</h3>
        <div className="text-sm space-y-1">
          <div>Hook Status: <span className="text-yellow-400">
            {isLoading ? 'Loading...' : error ? 'Error' : 'Ready'}
          </span></div>
          <div>Devices Found: <span className="text-green-400">{networkDevices.length}</span></div>
          <div>Current Device: <span className="text-cyan-400">{currentDevice?.name || 'None'}</span></div>
          <div>View Mode: <span className="text-purple-400">{viewMode}</span></div>
          {error && <div className="text-red-400">Error: {error}</div>}
        </div>
      </div>
      
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              {viewMode === 'devices' ? 'NETWORK RESOURCES' : `${currentDevice?.name || 'Unknown Device'}`}
            </h2>
            <p className="text-gray-400 text-sm">
              {viewMode === 'devices' 
                ? 'Access shared folders and network storage from connected devices'
                : `${currentPath} - ${currentNodes.length} items`
              }
            </p>
          </div>
          <div className="flex gap-2">
            {viewMode === 'files' && (
              <>
                <button
                  onClick={handleBackToDevices}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  <i className="fa fa-arrow-left mr-2"></i>
                  Back to Devices
                </button>
                {currentPath !== '/' && (
                  <button
                    onClick={navigateUp}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    <i className="fa fa-level-up-alt mr-2"></i>
                    Up
                  </button>
                )}
              </>
            )}
            <button
              onClick={refreshDevices}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              <i className="fa fa-refresh mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 h-full overflow-auto">
        {viewMode === 'devices' ? (
          /* Device List View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {networkDevices.map((device) => (
              <div
                key={device.id}
                onClick={() => handleDeviceClick(device)}
                className="bg-gray-800 p-4 rounded-lg cursor-pointer transition-all border border-gray-700 hover:border-blue-500 hover:bg-gray-750 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <i className={`fa ${getDeviceIcon(device.type)} text-2xl ${getDeviceTypeColor(device.type)}`}></i>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{device.name}</div>
                    <div className="text-sm text-gray-400">{device.ip}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getDeviceDescription(device)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${
                      device.status === 'online' ? 'bg-green-400' : 
                      device.status === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    {device.type === 'database' && (
                      <div className="text-xs text-purple-400">
                        <i className="fa fa-heartbeat"></i>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className={`capitalize font-medium ${getDeviceTypeColor(device.type)}`}>
                      {device.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Access:</span>
                    <span className={`${getAccessLevelColor(device.accessLevel)} font-medium`}>
                      {device.accessLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {device.type === 'database' ? 'Tables' : 'Shares'}:
                    </span>
                    <span>{device.shares?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {device.type === 'database' ? 'Uptime' : 'Status'}:
                    </span>
                    <span className={
                      device.status === 'online' ? 'text-green-400' : 
                      device.status === 'connecting' ? 'text-yellow-400' : 'text-red-400'
                    }>
                      {device.type === 'database' ? '45d 12h' : device.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Live indicators for database */}
                {device.type === 'database' && device.status === 'online' && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Live Activity:</span>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 text-green-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Queries</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span>Monitoring</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {renderDatabaseMonitoring(device)}
              </div>
            ))}

            {networkDevices.length === 0 && (
              <div className="col-span-full bg-gray-800 p-8 rounded-lg text-center">
                <i className="fa fa-wifi-slash text-6xl text-gray-600 mb-4"></i>
                <div className="text-xl text-gray-400 mb-2">No Network Devices Found</div>
                <div className="text-sm text-gray-500 mb-4">
                  The network file system is running but no devices are available.
                </div>
                <div className="flex gap-2 justify-center mb-4">
                  <button 
                    onClick={refreshDevices}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    <i className="fa fa-search mr-2"></i>
                    Scan Network
                  </button>
                  <button 
                    onClick={async () => {
                      console.log('Manual debug triggered...');
                      await debugNetworkDatabase();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded mr-2"
                  >
                    <i className="fa fa-bug mr-2"></i>
                    Debug DB
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm('This will reset the network database and reinitialize with fresh data including database devices. Continue?')) {
                        try {
                          console.log('Clearing network database...');
                          await clearNetworkDatabase();
                          console.log('Reinitializing...');
                          await initializeSampleNetworkData();
                          console.log('Refreshing devices...');
                          await refreshDevices();
                          console.log('Reset complete!');
                        } catch (error) {
                          console.error('Reset failed:', error);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
                  >
                    <i className="fa fa-database mr-2"></i>
                    Reset & Reinitialize
                  </button>
                </div>
                <details className="text-left">
                  <summary className="text-sm text-blue-400 cursor-pointer mb-2">
                    Debug Information
                  </summary>
                  <div className="text-xs text-gray-400 bg-gray-900 p-3 rounded font-mono">
                    <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                    <div>Error: {error || 'None'}</div>
                    <div>Devices: {networkDevices.length}</div>
                    <div>Current Device: {currentDevice?.name || 'None'}</div>
                    <div>View Mode: {viewMode}</div>
                  </div>
                </details>
              </div>
            )}
          </div>
        ) : (
          /* File Browser View */
          <div className="space-y-4">
            {/* Database Monitoring Panel */}
            {currentDevice && renderDatabaseMonitoring(currentDevice)}
            
            {/* Action Bar */}
            {currentDevice && currentDevice.accessLevel !== 'read-only' && (
              <div className="flex gap-2 p-3 bg-gray-800 rounded-lg">
                <button
                  onClick={handleCreateFolder}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  <i className="fa fa-folder-plus mr-2"></i>
                  New Folder
                </button>
                <button
                  onClick={handleCreateFile}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
                >
                  <i className="fa fa-file-plus mr-2"></i>
                  New File
                </button>
                
                {/* Database-specific actions */}
                {currentDevice.type === 'database' && (
                  <>
                    <button
                      onClick={() => alert('Database backup initiated!\n\nThis would start a full database backup process.')}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                    >
                      <i className="fa fa-database mr-2"></i>
                      Backup DB
                    </button>
                    <button
                      onClick={() => alert('Opening database console...\n\nThis would open a MySQL/database command line interface.')}
                      className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm"
                    >
                      <i className="fa fa-terminal mr-2"></i>
                      DB Console
                    </button>
                  </>
                )}
              </div>
            )}

            {/* File/Folder Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {currentNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => node.type === 'directory' ? handleFolderClick(node) : handleFileClick(node)}
                  className="bg-gray-800 p-4 rounded-lg cursor-pointer transition-all border border-gray-700 hover:border-blue-500 hover:bg-gray-750 group relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <i className={`fa ${getNodeIcon(node)} text-3xl mb-2 ${
                      node.type === 'directory' ? 'text-yellow-400' : 
                      node.path.includes('.sql') ? 'text-purple-400' :
                      node.path.includes('.log') ? 'text-orange-400' :
                      node.path.includes('.cnf') || node.path.includes('.conf') ? 'text-cyan-400' :
                      node.path.includes('.ibd') ? 'text-red-400' :
                      'text-blue-400'
                    }`}></i>
                    <div className="font-medium text-sm mb-1 truncate w-full">{node.name}</div>
                    {node.type === 'file' && node.size && (
                      <div className="text-xs text-gray-400">{formatFileSize(node.size)}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(node.modified).toLocaleDateString()}
                    </div>
                    
                    {/* Special indicators for database files */}
                    {node.type === 'file' && (
                      <div className="text-xs text-gray-400 mt-1">
                        {node.path.includes('.sql') && <span className="text-purple-400">SQL</span>}
                        {node.path.includes('.log') && <span className="text-orange-400">LOG</span>}
                        {node.path.includes('.ibd') && <span className="text-red-400">DATA</span>}
                        {node.path.includes('.cnf') && <span className="text-cyan-400">CONFIG</span>}
                      </div>
                    )}
                    
                    {/* Delete button (only show on hover for non-read-only access) */}
                    {currentDevice?.accessLevel !== 'read-only' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {currentNodes.length === 0 && (
                <div className="col-span-full bg-gray-800 p-8 rounded-lg text-center">
                  <i className="fa fa-folder-open text-6xl text-gray-600 mb-4"></i>
                  <div className="text-xl text-gray-400 mb-2">Empty Directory</div>
                  <div className="text-sm text-gray-500">
                    This folder contains no files or subdirectories
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkView;