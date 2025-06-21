import React from 'react';
import { Device } from '../../types';

interface MonitoringPanelProps {
  devices: Device[];
  selectedDevice: Device | null;
}

const MonitoringPanel: React.FC<MonitoringPanelProps> = ({ devices, selectedDevice }) => {
  if (!selectedDevice) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📈</div>
          <div>SELECT A DEVICE FOR MONITORING</div>
        </div>
      </div>
    );
  }

  const isOnline = selectedDevice.status === 'online';

  return (
    <div className="h-full bg-black p-6">
      <div className="monitoring-section">
        <h3 className="monitoring-title">MONITORING - {selectedDevice.name}</h3>
        
        <div className="monitoring-grid">
          {/* System Metrics */}
          <div className="monitoring-group">
            <h4>SYSTEM METRICS</h4>
            <div className="monitoring-display">
              {isOnline ? (
                <>
                  <div className="monitoring-item">
                    <div className="metric-header">
                      <span>CPU USAGE</span>
                      <span className="metric-value">
                        {selectedDevice.cpu?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <div className="metric-graph">
                      <div className="graph-bars">
                        {Array.from({ length: 20 }, (_, i) => (
                          <div 
                            key={i} 
                            className="graph-bar" 
                            style={{ 
                              height: `${Math.random() * 80 + 10}%`,
                              backgroundColor: '#00ff41'
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="monitoring-item">
                    <div className="metric-header">
                      <span>MEMORY USAGE</span>
                      <span className="metric-value">
                        {selectedDevice.memory?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <div className="metric-graph">
                      <div className="graph-bars">
                        {Array.from({ length: 20 }, (_, i) => (
                          <div 
                            key={i} 
                            className="graph-bar" 
                            style={{ 
                              height: `${Math.random() * 60 + 20}%`,
                              backgroundColor: '#0099ff'
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="monitoring-item offline">
                  <span>DEVICE OFFLINE</span>
                </div>
              )}
            </div>
          </div>

          {/* Network Activity */}
          <div className="monitoring-group">
            <h4>NETWORK ACTIVITY</h4>
            <div className="monitoring-display">
              {isOnline && selectedDevice.network ? (
                <>
                  <div className="monitoring-item">
                    UPLOAD: <span className="metric-value">
                      {selectedDevice.network.upload.toFixed(1)} KB/s
                    </span>
                  </div>
                  <div className="monitoring-item">
                    DOWNLOAD: <span className="metric-value">
                      {selectedDevice.network.download.toFixed(1)} KB/s
                    </span>
                  </div>
                  <div className="monitoring-item">
                    PACKETS: <span className="metric-value">
                      {Math.floor(Math.random() * 1000 + 500)}/s
                    </span>
                  </div>
                </>
              ) : (
                <div className="monitoring-item offline">
                  <span>NO NETWORK DATA</span>
                </div>
              )}
            </div>
          </div>

          {/* Alerts & Logs */}
          <div className="monitoring-group">
            <h4>RECENT EVENTS</h4>
            <div className="monitoring-display">
              <div className="event-log">
                <div className="log-entry">
                  <span className="log-time">12:34:56</span>
                  <span className="log-message">Device connected</span>
                </div>
                <div className="log-entry">
                  <span className="log-time">12:33:42</span>
                  <span className="log-message">Status updated</span>
                </div>
                <div className="log-entry">
                  <span className="log-time">12:32:18</span>
                  <span className="log-message">Performance check</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="monitoring-group">
            <h4>STATUS SUMMARY</h4>
            <div className="monitoring-display">
              <div className="monitoring-item">
                UPTIME: <span className="metric-value">
                  {isOnline ? '2h 45m' : 'N/A'}
                </span>
              </div>
              <div className="monitoring-item">
                RESPONSE: <span className="metric-value">
                  {isOnline ? '< 1ms' : 'N/A'}
                </span>
              </div>
              <div className="monitoring-item">
                HEALTH: <span className={`metric-value ${isOnline ? 'healthy' : 'offline'}`}>
                  {isOnline ? 'HEALTHY' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPanel;
