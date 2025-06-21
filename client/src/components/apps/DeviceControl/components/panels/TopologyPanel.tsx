import React from 'react';
import { Device } from '../../types';

interface TopologyPanelProps {
  devices: Device[];
  selectedDevice: Device | null;
  onDeviceSelect: (device: Device) => void;
}

const TopologyPanel: React.FC<TopologyPanelProps> = ({
  devices,
  selectedDevice,
  onDeviceSelect
}) => {
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

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'online': return '#ffffff';
      case 'offline': return '#666666';
      case 'connecting': return '#cccccc';
      case 'error': return '#999999';
      default: return '#666666';
    }
  };

  return (
    <div className="h-full bg-black p-6">
      <div className="topology-container h-full">
        <svg className="w-full h-full" viewBox="0 0 800 600">
          {/* Network connections */}
          <g className="connections">
            {/* Hub to spoke topology */}
            <line x1="400" y1="200" x2="200" y2="300" className="connection-line" />
            <line x1="400" y1="200" x2="600" y2="300" className="connection-line" />
            <line x1="400" y1="200" x2="300" y2="450" className="connection-line" />
            <line x1="400" y1="200" x2="500" y2="450" className="connection-line" />
            <line x1="400" y1="200" x2="400" y2="350" className="connection-line" />
            <line x1="400" y1="200" x2="150" y2="150" className="connection-line" />
          </g>
          
          {/* Device nodes */}
          {devices.map((device, index) => {
            const positions = {
              '2': { x: 400, y: 200 }, // Router (center hub)
              '1': { x: 200, y: 300 }, // Database
              '4': { x: 600, y: 300 }, // Server
              '3': { x: 300, y: 450 }, // Computer
              '5': { x: 500, y: 450 }, // IoT
              '6': { x: 400, y: 350 }  // Mobile
            };
            
            const pos = positions[device.id as keyof typeof positions] || { x: 150 + index * 100, y: 150 };
            const isSelected = selectedDevice?.id === device.id;
            const statusColor = getStatusColor(device.status);
            
            return (
              <g key={device.id} transform={`translate(${pos.x}, ${pos.y})`}>
                {/* Device circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "24" : "20"}
                  fill={device.status === 'online' ? '#1a1a1a' : '#0a0a0a'}
                  stroke={statusColor}
                  strokeWidth={isSelected ? "3" : "2"}
                  className="device-node"
                  onClick={() => onDeviceSelect(device)}
                />
                
                {/* Device type indicator */}
                <circle
                  cx="0"
                  cy="0"
                  r="12"
                  fill="none"
                  stroke={statusColor}
                  strokeWidth="1"
                  opacity="0.5"
                />
                
                {/* Device label */}
                <text
                  x="0"
                  y="35"
                  textAnchor="middle"
                  className="fill-white text-xs font-mono pointer-events-none"
                  fontSize="11"
                >
                  {device.name.split(' ')[0].toUpperCase()}
                </text>
                
                {/* IP address */}
                <text
                  x="0"
                  y="48"
                  textAnchor="middle"
                  className="fill-gray-400 text-xs font-mono pointer-events-none"
                  fontSize="9"
                >
                  {device.ip}
                </text>
                
                {/* Status indicator */}
                <circle
                  cx="15"
                  cy="-15"
                  r="4"
                  fill={statusColor}
                  className={device.status === 'connecting' ? 'status-pulse' : ''}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-black border border-gray-600 p-4">
          <div className="text-white font-mono text-sm mb-3 font-bold">NETWORK STATUS</div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <span className="text-gray-300 text-sm font-mono">ONLINE</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-gray-300 text-sm font-mono">CONNECTING</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
              <span className="text-gray-300 text-sm font-mono">OFFLINE</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="text-gray-400 text-xs font-mono">
              DEVICES: {devices.length} | ONLINE: {devices.filter(d => d.status === 'online').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopologyPanel;
