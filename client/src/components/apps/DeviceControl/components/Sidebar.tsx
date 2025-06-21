import React from 'react';
import { Device } from '../types';

interface SidebarProps {
  devices: Device[];
  selectedDevice: Device | null;
  onDeviceSelect: (device: Device) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  devices,
  selectedDevice,
  onDeviceSelect
}) => {
  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'online': return '#00ff41';
      case 'offline': return '#ff4444';
      case 'connecting': return '#ffaa00';
      case 'error': return '#ff6b6b';
      default: return '#666';
    }
  };

  const getDeviceIcon = (type: Device['type']) => {
    const icons = {
      database: '📊',
      router: '🌐',
      computer: '💻',
      server: '🖥️',
      iot: '📱',
      mobile: '📞'
    };
    return icons[type];
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="header-title">
          <div className="title-icon">🌐</div>
          <h3>Network Devices</h3>
        </div>
        <div className="device-count-display">
          <div className="count-item online">
            <span className="count-dot"></span>
            <span>{devices.filter(d => d.status === 'online').length} Online</span>
          </div>
          <div className="count-item total">
            <span>{devices.length} Total</span>
          </div>
        </div>
      </div>
      
      <div className="device-list">
        {devices.map(device => (
          <div
            key={device.id}
            className={`device-card ${selectedDevice?.id === device.id ? 'selected' : ''} ${device.status}`}
            onClick={() => onDeviceSelect(device)}
          >
            <div className="device-header">
              <div className="device-icon">
                {getDeviceIcon(device.type)}
              </div>
              <div className="device-status-indicator">
                <div 
                  className={`status-dot ${device.status}`}
                  style={{ backgroundColor: getStatusColor(device.status) }}
                />
              </div>
            </div>
            
            <div className="device-info">
              <div className="device-name">{device.name}</div>
              <div className="device-details">
                <span className="device-ip">{device.ip}</span>
                <span className="device-type">{device.type.toUpperCase()}</span>
              </div>
            </div>
            
            {device.status === 'online' && device.cpu && (
              <div className="device-metrics">
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${device.cpu}%` }}></div>
                </div>
                <span className="metric-text">CPU: {device.cpu.toFixed(0)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
