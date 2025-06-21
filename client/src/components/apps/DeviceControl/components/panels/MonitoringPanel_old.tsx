import React from 'react';
import { Device } from '../../types';
import NetworkMonitor from '../NetworkMonitor';

interface MonitoringPanelProps {
  devices: Device[];
  selectedDevice: Device | null;
}

const MonitoringPanel: React.FC<MonitoringPanelProps> = ({ devices, selectedDevice }) => {
  return (
    <div className="h-full bg-black p-6 overflow-y-auto">
      <div className="monitoring-section">
        <h3 className="monitoring-title">DEVICE MONITORING</h3>
        
        {/* Network Monitor */}
        <div className="monitoring-group">
          <NetworkMonitor devices={devices} selectedDevice={selectedDevice} />
        </div>

        {selectedDevice && (
          <div className="device-monitoring">
            <h4 className="device-monitor-title">DEVICE METRICS - {selectedDevice.name}</h4>
            
            <div className="monitoring-grid">
              {/* System Metrics */}
              <div className="monitoring-group">
                <h4>SYSTEM METRICS</h4>
                <div className="metrics-display">
                  {selectedDevice.cpu !== undefined && (
                    <div className="metric-item">
                      <span className="metric-label">CPU Usage:</span>
                      <div className="metric-bar">
                        <div 
                          className="metric-fill" 
                          style={{ width: `${selectedDevice.cpu}%` }}
                        />
                      </div>
                      <span className="metric-value">{selectedDevice.cpu.toFixed(1)}%</span>
                    </div>
                  )}
                  {selectedDevice.memory !== undefined && (
                    <div className="metric-item">
                      <span className="metric-label">Memory Usage:</span>
                      <div className="metric-bar">
                        <div 
                          className="metric-fill memory" 
                          style={{ width: `${selectedDevice.memory}%` }}
                        />
                      </div>
                      <span className="metric-value">{selectedDevice.memory.toFixed(1)}%</span>
                    </div>
                  )}
                  {selectedDevice.storage !== undefined && (
                    <div className="metric-item">
                      <span className="metric-label">Storage Usage:</span>
                      <div className="metric-bar">
                        <div 
                          className="metric-fill storage" 
                          style={{ width: `${selectedDevice.storage}%` }}
                        />
                      </div>
                      <span className="metric-value">{selectedDevice.storage.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Network Metrics */}
              {selectedDevice.network && (
                <div className="monitoring-group">
                  <h4>NETWORK METRICS</h4>
                  <div className="network-metrics">
                    <div className="network-metric">
                      <span className="metric-label">Upload:</span>
                      <span className="metric-value">{selectedDevice.network.upload.toFixed(1)} Mbps</span>
                    </div>
                    <div className="network-metric">
                      <span className="metric-label">Download:</span>
                      <span className="metric-value">{selectedDevice.network.download.toFixed(1)} Mbps</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Services */}
              {selectedDevice.services && selectedDevice.services.length > 0 && (
                <div className="monitoring-group">
                  <h4>RUNNING SERVICES</h4>
                  <div className="services-list">
                    {selectedDevice.services.map((service: string) => (
                      <div key={service} className="service-status">
                        <span className="service-name">{service}</span>
                        <span className="service-indicator online">RUNNING</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Status */}
              {selectedDevice.security && (
                <div className="monitoring-group">
                  <h4>SECURITY STATUS</h4>
                  <div className="security-status">
                    <div className="security-item">
                      <span className="security-label">Firewall:</span>
                      <span className={`security-value ${selectedDevice.security.firewall ? 'enabled' : 'disabled'}`}>
                        {selectedDevice.security.firewall ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="security-item">
                      <span className="security-label">Encryption:</span>
                      <span className={`security-value ${selectedDevice.security.encryption ? 'enabled' : 'disabled'}`}>
                        {selectedDevice.security.encryption ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="security-item">
                      <span className="security-label">Updates:</span>
                      <span className={`security-value ${selectedDevice.security.updates ? 'enabled' : 'disabled'}`}>
                        {selectedDevice.security.updates ? 'UP TO DATE' : 'OUTDATED'}
                      </span>
                    </div>
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
