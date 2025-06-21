import React from 'react';
import { Device } from '../../types';
import DatabaseInterface from '../interfaces/DatabaseInterface';
import RouterInterface from '../interfaces/RouterInterface';
import ComputerInterface from '../interfaces/ComputerInterface';
import ServerInterface from '../interfaces/ServerInterface';
import IoTInterface from '../interfaces/IoTInterface';

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

  const renderDeviceInterface = () => {
    const commonProps = {
      device: selectedDevice,
      onUpdate: onUpdateDevice
    };

    switch (selectedDevice.type) {
      case 'database':
        return <DatabaseInterface {...commonProps} />;
      case 'router':
        return <RouterInterface {...commonProps} />;
      case 'computer':
        return <ComputerInterface {...commonProps} />;
      case 'server':
        return <ServerInterface {...commonProps} />;
      case 'iot':
        return <IoTInterface {...commonProps} />;
      default:
        return <DefaultInterface {...commonProps} />;
    }
  };

  return (
    <div className="h-full bg-black p-6 overflow-y-auto">
      <div className="control-section">
        <h3 className="control-title">DEVICE CONTROL - {selectedDevice.name}</h3>
        
        {/* Basic Device Controls */}
        <div className="basic-controls">
          <div className="control-group">
            <h4>BASIC CONTROLS</h4>
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

          {/* Device Info */}
          <div className="control-group">
            <h4>DEVICE INFO</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">TYPE:</span>
                <span className="info-value">{selectedDevice.type.toUpperCase()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">STATUS:</span>
                <span className={`info-value status-${selectedDevice.status}`}>
                  {selectedDevice.status.toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">IP:</span>
                <span className="info-value">{selectedDevice.ip}</span>
              </div>
              <div className="info-item">
                <span className="info-label">OS:</span>
                <span className="info-value">{selectedDevice.os || 'Unknown'}</span>
              </div>
              {selectedDevice.uptime && (
                <div className="info-item">
                  <span className="info-label">UPTIME:</span>
                  <span className="info-value">{selectedDevice.uptime}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Device-Specific Interface */}
        <div className="device-interface">
          {renderDeviceInterface()}
        </div>
      </div>
    </div>
  );
};

// Default interface for unsupported device types
const DefaultInterface: React.FC<{ device: Device; onUpdate: (deviceId: string, data: any) => void }> = ({ device, onUpdate }) => {
  return (
    <div className="default-interface">
      <h4>BASIC DEVICE INTERFACE</h4>
      <div className="default-info">
        <p>This device type ({device.type}) does not have a specialized interface yet.</p>
        <div className="device-services">
          <h5>SERVICES:</h5>
          <div className="services-list">
            {device.services?.map((service: string) => (
              <div key={service} className="service-item">
                {service}
              </div>
            ))}
          </div>
        </div>
        {device.data && (
          <div className="device-data">
            <h5>DEVICE DATA:</h5>
            <pre className="data-display">
              {JSON.stringify(device.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;