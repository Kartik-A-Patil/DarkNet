import React from 'react';
import { Device } from '../../types';

interface OverviewPanelProps {
  devices: Device[];
  selectedDevice: Device | null;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({ devices, selectedDevice }) => {
  if (!selectedDevice) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <div>SELECT A DEVICE FOR OVERVIEW</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black p-6">
      <div className="overview-section">
        <h3 className="overview-title">OVERVIEW - {selectedDevice.name}</h3>
        
        <div className="overview-grid">
          {/* Device Info */}
          <div className="overview-group">
            <h4>DEVICE INFO</h4>
            <div className="overview-display">
              <div className="overview-item">
                NAME: <span className="overview-value">{selectedDevice.name}</span>
              </div>
              <div className="overview-item">
                IP: <span className="overview-value">{selectedDevice.ip}</span>
              </div>
              <div className="overview-item">
                TYPE: <span className="overview-value">{selectedDevice.type.toUpperCase()}</span>
              </div>
              <div className="overview-item">
                STATUS: <span className={`overview-value ${selectedDevice.status}`}>
                  {selectedDevice.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {selectedDevice.cpu !== undefined && (
            <div className="overview-group">
              <h4>PERFORMANCE</h4>
              <div className="overview-display">
                <div className="overview-item">
                  CPU: <span className="overview-value">{selectedDevice.cpu.toFixed(1)}%</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill cpu" 
                      style={{ width: `${selectedDevice.cpu}%` }}
                    />
                  </div>
                </div>
                {selectedDevice.memory && (
                  <div className="overview-item">
                    MEMORY: <span className="overview-value">{selectedDevice.memory.toFixed(1)}%</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill memory" 
                        style={{ width: `${selectedDevice.memory}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Network Info */}
          {selectedDevice.network && (
            <div className="overview-group">
              <h4>NETWORK</h4>
              <div className="overview-display">
                <div className="overview-item">
                  UPLOAD: <span className="overview-value">
                    {selectedDevice.network.upload.toFixed(1)} KB/s
                  </span>
                </div>
                <div className="overview-item">
                  DOWNLOAD: <span className="overview-value">
                    {selectedDevice.network.download.toFixed(1)} KB/s
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="overview-group">
            <h4>NETWORK SUMMARY</h4>
            <div className="overview-display">
              <div className="overview-item">
                TOTAL DEVICES: <span className="overview-value">{devices.length}</span>
              </div>
              <div className="overview-item">
                ONLINE: <span className="overview-value online">
                  {devices.filter(d => d.status === 'online').length}
                </span>
              </div>
              <div className="overview-item">
                OFFLINE: <span className="overview-value offline">
                  {devices.filter(d => d.status === 'offline').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
