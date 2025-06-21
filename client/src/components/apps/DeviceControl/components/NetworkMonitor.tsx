import React, { useState, useEffect } from 'react';
import { Device } from '../types';
import { getNetworkLogs, getNetworkStats, clearAllNetworkData } from '../utils/networkDatabase';

interface NetworkMonitorProps {
  devices: Device[];
  selectedDevice?: Device | null;
}

const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ devices, selectedDevice }) => {
  const [networkLogs, setNetworkLogs] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'command' | 'sync' | 'backup' | 'file'>('all');

  useEffect(() => {
    loadNetworkData();
    const interval = setInterval(loadNetworkData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [selectedDevice]);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      const [logs, stats] = await Promise.all([
        getNetworkLogs(selectedDevice?.id),
        getNetworkStats()
      ]);
      setNetworkLogs(logs);
      setNetworkStats(stats);
    } catch (error) {
      console.error('Failed to load network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (confirm('Are you sure you want to clear all network data?')) {
      await clearAllNetworkData();
      setNetworkLogs([]);
      setNetworkStats(null);
    }
  };

  const filteredLogs = networkLogs.filter(log => 
    filter === 'all' || log.type === filter
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'command': return '⚡';
      case 'sync': return '🔄';
      case 'backup': return '💾';
      case 'file': return '📁';
      default: return '📡';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'command': return '#ffaa00';
      case 'sync': return '#0066cc';
      case 'backup': return '#00aa00';
      case 'file': return '#cc6600';
      default: return '#cccccc';
    }
  };

  return (
    <div className="network-monitor">
      <div className="monitor-header">
        <h4>
          NETWORK MONITOR
          {selectedDevice && ` - ${selectedDevice.name}`}
        </h4>
        <div className="monitor-controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Activity</option>
            <option value="command">Commands</option>
            <option value="sync">Sync</option>
            <option value="backup">Backup</option>
            <option value="file">Files</option>
          </select>
          <button onClick={loadNetworkData} disabled={loading} className="refresh-btn">
            {loading ? 'REFRESHING...' : 'REFRESH'}
          </button>
          <button onClick={clearLogs} className="clear-btn">
            CLEAR LOGS
          </button>
        </div>
      </div>

      {/* Network Statistics */}
      {networkStats && (
        <div className="network-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{networkStats.totalLogs}</div>
              <div className="stat-label">Network Activities</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{networkStats.totalRecords}</div>
              <div className="stat-label">Database Records</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{networkStats.totalConnections}</div>
              <div className="stat-label">Active Connections</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{networkStats.deviceCount}</div>
              <div className="stat-label">Network Devices</div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="activity-timeline">
        <h5>NETWORK ACTIVITY TIMELINE</h5>
        <div className="timeline-container">
          {filteredLogs.length === 0 ? (
            <div className="no-activity">
              <div className="no-activity-icon">📡</div>
              <div>No network activity recorded</div>
              {selectedDevice && (
                <div className="activity-hint">
                  Try interacting with {selectedDevice.name} to see activity here
                </div>
              )}
            </div>
          ) : (
            <div className="timeline-list">
              {filteredLogs.map((log, index) => (
                <div key={log.id || index} className="timeline-item">
                  <div className="timeline-marker">
                    <div 
                      className="activity-icon"
                      style={{ backgroundColor: getActivityColor(log.type) }}
                    >
                      {getActivityIcon(log.type)}
                    </div>
                  </div>
                  <div className="timeline-content">
                    <div className="activity-header">
                      <div className="activity-type">{log.type.toUpperCase()}</div>
                      <div className="activity-time">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="activity-details">
                      <div className="activity-path">
                        <span className="source-device">
                          {log.sourceDevice === 'current' ? 'YOU' : 
                           devices.find(d => d.id === log.sourceDevice)?.name || log.sourceDevice}
                        </span>
                        <span className="activity-arrow">→</span>
                        <span className="target-device">
                          {devices.find(d => d.id === log.targetDevice)?.name || log.targetDevice}
                        </span>
                      </div>
                      <div className="activity-description">
                        {log.data?.action && (
                          <span className="action-name">{log.data.action.replace('_', ' ')}</span>
                        )}
                        {log.data?.deviceName && (
                          <span className="device-name">({log.data.deviceName})</span>
                        )}
                        {log.data?.command && (
                          <span className="command-info">Command: {log.data.command}</span>
                        )}
                        {log.data?.fileName && (
                          <span className="file-info">File: {log.data.fileName}</span>
                        )}
                        {log.data?.table && (
                          <span className="table-info">Table: {log.data.table}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Device Connection Matrix */}
      <div className="connection-matrix">
        <h5>DEVICE CONNECTIONS</h5>
        <div className="matrix-grid">
          {devices.map(device => (
            <div key={device.id} className="matrix-device">
              <div className="device-node">
                <div className={`device-indicator ${device.status}`}>
                  {device.name.charAt(0)}
                </div>
                <div className="device-label">{device.name}</div>
              </div>
              <div className="connection-count">
                {networkLogs.filter(log => 
                  log.sourceDevice === device.id || log.targetDevice === device.id
                ).length} activities
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity Indicator */}
      <div className="realtime-indicator">
        <div className="indicator-dot"></div>
        <span>Live Network Monitoring</span>
        <span className="last-update">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default NetworkMonitor;
