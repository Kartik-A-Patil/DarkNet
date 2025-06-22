import React, { useState } from 'react';
import { Device } from '../../types';

interface DatabaseInterfaceProps {
  device: Device;
  onUpdateDevice: (deviceId: string, settings: any) => void;
}

const DatabaseInterface: React.FC<DatabaseInterfaceProps> = ({ device, onUpdateDevice }) => {
  const [showBackup, setShowBackup] = useState(false);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [showQuery, setShowQuery] = useState(false);
  
  const config = device.config || {};
  const connectionPercent = config.maxConnections ? (config.connections || 0) / config.maxConnections * 100 : 0;

  const handleBackupNow = () => {
    if (confirm('Start database backup now? This may affect performance.')) {
      // Simulate backup process
      alert('Backup started successfully. You will be notified when complete.');
    }
  };

  const handleOptimize = () => {
    if (confirm('Optimize database? This will temporarily lock tables.')) {
      alert('Database optimization started. Performance may improve after completion.');
    }
  };

  const runSampleQuery = () => {
    // Simulate running a query
    const sampleData = [
      { id: 1, username: 'admin', email: 'admin@darknet.local', last_login: '2024-01-15 14:30:22' },
      { id: 2, username: 'hackos', email: 'hackos@darknet.local', last_login: '2024-01-15 09:15:45' },
      { id: 3, username: 'analyst', email: 'analyst@darknet.local', last_login: '2024-01-14 16:22:11' },
    ];
    setQueryResults(sampleData);
    setShowQuery(true);
  };

  return (
    <div className="database-interface p-6 bg-gray-900 text-white">
      <h3 className="text-xl font-bold text-green-400 mb-6">DATABASE MANAGEMENT</h3>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-blue-400">Database Status</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Engine:</span>
              <span className="text-green-400">{config.dbEngine || 'MySQL 8.0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-semibold ${device.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                {device.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="text-blue-400">{device.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Backup:</span>
              <span className="text-yellow-400">2 hours ago</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-blue-400">Connection Pool</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Active Connections:</span>
              <span className="text-green-400">{config.connections || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Max Connections:</span>
              <span className="text-blue-400">{config.maxConnections || 100}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(connectionPercent, 100)}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-400">
              {connectionPercent.toFixed(1)}% Pool Usage
            </div>
          </div>
        </div>
      </div>

      {/* Database Services */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Active Services</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(device.services || []).map((service, index) => (
            <div key={index} className="bg-green-900 border border-green-600 p-3 rounded text-center">
              <i className="fa fa-database text-2xl text-green-400 mb-2"></i>
              <div className="text-sm font-semibold">{service}</div>
              <div className="text-xs text-gray-300">Running</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Database Operations</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setShowBackup(!showBackup)}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded flex flex-col items-center gap-2"
          >
            <i className="fa fa-download text-xl"></i>
            <span className="text-sm">Backup</span>
          </button>
          <button
            onClick={handleOptimize}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded flex flex-col items-center gap-2"
          >
            <i className="fa fa-tachometer-alt text-xl"></i>
            <span className="text-sm">Optimize</span>
          </button>
          <button
            onClick={runSampleQuery}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded flex flex-col items-center gap-2"
          >
            <i className="fa fa-search text-xl"></i>
            <span className="text-sm">Query</span>
          </button>
          <button className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded flex flex-col items-center gap-2">
            <i className="fa fa-chart-line text-xl"></i>
            <span className="text-sm">Monitor</span>
          </button>
        </div>
      </div>

      {/* Backup Panel */}
      {showBackup && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-green-500">
          <h4 className="text-lg font-semibold mb-3 text-green-400">Backup Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold mb-2 text-blue-400">Schedule</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Schedule:</span>
                  <span className="text-yellow-400">{config.backupSchedule || 'Daily at 2:00 AM'}</span>
                </div>
                <button
                  onClick={handleBackupNow}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                >
                  <i className="fa fa-play mr-2"></i>
                  Backup Now
                </button>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-2 text-blue-400">Recent Backups</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>backup_2024_01_15.sql</span>
                  <span className="text-green-400">Success</span>
                </div>
                <div className="flex justify-between">
                  <span>backup_2024_01_14.sql</span>
                  <span className="text-green-400">Success</span>
                </div>
                <div className="flex justify-between">
                  <span>backup_2024_01_13.sql</span>
                  <span className="text-green-400">Success</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Query Results */}
      {showQuery && queryResults.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-purple-500">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-purple-400">Query Results</h4>
            <button
              onClick={() => setShowQuery(false)}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Username</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {queryResults.map((row, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-2 font-mono text-blue-400">{row.id}</td>
                    <td className="p-2">{row.username}</td>
                    <td className="p-2 text-green-400">{row.email}</td>
                    <td className="p-2 text-gray-300">{row.last_login}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Query executed in 0.045s | {queryResults.length} rows returned
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Performance Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-3 rounded text-center">
            <i className="fa fa-clock text-2xl text-blue-400 mb-2"></i>
            <div className="text-sm text-gray-300">Avg Query Time</div>
            <div className="font-semibold">0.025s</div>
          </div>
          <div className="bg-gray-700 p-3 rounded text-center">
            <i className="fa fa-exchange-alt text-2xl text-green-400 mb-2"></i>
            <div className="text-sm text-gray-300">Queries/sec</div>
            <div className="font-semibold">127</div>
          </div>
          <div className="bg-gray-700 p-3 rounded text-center">
            <i className="fa fa-memory text-2xl text-yellow-400 mb-2"></i>
            <div className="text-sm text-gray-300">Buffer Pool</div>
            <div className="font-semibold">85%</div>
          </div>
          <div className="bg-gray-700 p-3 rounded text-center">
            <i className="fa fa-lock text-2xl text-red-400 mb-2"></i>
            <div className="text-sm text-gray-300">Lock Waits</div>
            <div className="font-semibold">2</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseInterface;
