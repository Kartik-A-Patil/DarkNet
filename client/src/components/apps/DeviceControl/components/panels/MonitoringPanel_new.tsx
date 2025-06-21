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

export default MonitoringPanel;
