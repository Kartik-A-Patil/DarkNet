import React from 'react';
import { Device } from '../../types';

interface ControlPanelProps {
  devices: Device[];
  selectedDevice: Device | null;
  onToggleDevice: (deviceId: string) => void;
  onRestartDevice: (deviceId: string) => void;
  onUpdateDevice: (deviceId: string, settings: any) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  devices,
  selectedDevice,
  onToggleDevice,
  onRestartDevice,
  onUpdateDevice
}) => {
  if (!selectedDevice) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">⚙️</div>
          <div>SELECT A DEVICE TO CONTROL</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black p-6">
      <div className="control-section">
        <h3 className="control-title">DEVICE CONTROL - {selectedDevice.name}</h3>
        
        <div className="controls-grid">
          {/* Power Control */}
          <div className="control-group">
            <h4>POWER</h4>
            <div className="control-buttons">
              <button
                className="control-btn power"
                onClick={() => onToggleDevice(selectedDevice.id)}
              >
                {selectedDevice.status === 'online' ? 'SHUTDOWN' : 'POWER ON'}
              </button>
              <button
                className="control-btn restart"
                onClick={() => onRestartDevice(selectedDevice.id)}
                disabled={selectedDevice.status === 'offline'}
              >
                RESTART
              </button>
            </div>
          </div>

          {/* Network Control */}
          <div className="control-group">
            <h4>NETWORK</h4>
            <div className="control-field">
              <label>IP ADDRESS:</label>
              <input 
                type="text" 
                value={selectedDevice.ip} 
                className="control-input"
                onChange={(e) => onUpdateDevice(selectedDevice.id, { ip: e.target.value })}
              />
            </div>
          </div>

          {/* Status Display */}
          <div className="control-group">
            <h4>STATUS</h4>
            <div className="status-display">
              <div className="status-item">
                STATUS: <span className={`status-value ${selectedDevice.status}`}>
                  {selectedDevice.status.toUpperCase()}
                </span>
              </div>
              <div className="status-item">
                TYPE: <span className="status-value">{selectedDevice.type.toUpperCase()}</span>
              </div>
              {selectedDevice.cpu && (
                <div className="status-item">
                  CPU: <span className="status-value">{selectedDevice.cpu.toFixed(1)}%</span>
                </div>
              )}
              {selectedDevice.memory && (
                <div className="status-item">
                  MEMORY: <span className="status-value">{selectedDevice.memory.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;