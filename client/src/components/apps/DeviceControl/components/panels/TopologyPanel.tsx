import React, { useState, useEffect } from 'react';
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
  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
    console.log('TopologyPanel: devices updated', devices.length, 'devices');
    console.log('Online devices:', devices.filter(d => d.status === 'online').length);
  }, [devices]);

  const getDeviceIcon = (type: Device['type']) => {
    const icons: Record<Device['type'], string> = {
      database: '🗄️',
      router: '🌐', 
      computer: '💻',
      server: '🖥️',
      iot: '📡',
      mobile: '📱',
      nas: '💾',
      camera: '📹',
      switch: '🔀'
    };
    return icons[type] || '📟';
  };

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'online': return '#00ff88';
      case 'offline': return '#666666';
      case 'connecting': return '#ffaa00';
      case 'error': return '#ff4444';
      default: return '#666666';
    }
  };

  const getDevicePositions = () => {
    const centerX = 400;
    const centerY = 280;
    const radius = 180;
    
    const positions: Record<string, { x: number; y: number }> = {
      '2': { x: centerX, y: centerY - 80 }, // Router (center hub)
      '1': { x: centerX - radius, y: centerY }, // Database
      '4': { x: centerX + radius, y: centerY }, // Server  
      '3': { x: centerX - radius * 0.7, y: centerY + radius * 0.8 }, // Computer
      '5': { x: centerX + radius * 0.7, y: centerY + radius * 0.8 }, // IoT
      '6': { x: centerX, y: centerY + radius * 0.6 }  // Mobile
    };
    
    return positions;
  };

  const renderConnections = () => {
    const positions = getDevicePositions();
    const hubPos = positions['2'];
    
    return (
      <g className="connections">
        {Object.entries(positions).map(([id, pos]) => {
          if (id === '2') return null; // Skip hub itself
          
          const device = devices.find(d => d.id === id);
          const isActive = device?.status === 'online';
          const isSelected = selectedDevice?.id === id || selectedDevice?.id === '2';
          
          return (
            <g key={`connection-${id}`}>
              {/* Connection line */}
              <line
                x1={hubPos.x}
                y1={hubPos.y}
                x2={pos.x}
                y2={pos.y}
                stroke={isActive ? '#00ff88' : '#333333'}
                strokeWidth={isSelected ? '3' : '2'}
                opacity={isActive ? '0.8' : '0.3'}
                className="transition-all duration-500 ease-in-out connection-line"
                strokeDasharray={isActive ? "5,5" : "none"}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 4px #00ff88)' : 'none',
                  animation: isActive ? 'dash 2s linear infinite' : 'none'
                }}
              />
              
              {/* Data flow animation */}
              {isActive && (
                <>
                  {/* Simple pulsing circles for data flow */}
                  <circle 
                    cx={hubPos.x + (pos.x - hubPos.x) * 0.3} 
                    cy={hubPos.y + (pos.y - hubPos.y) * 0.3}
                    r="3" 
                    fill="#00ff88" 
                    className="animate-dataflow"
                    opacity="0.8"
                  />
                  <circle 
                    cx={hubPos.x + (pos.x - hubPos.x) * 0.7} 
                    cy={hubPos.y + (pos.y - hubPos.y) * 0.7}
                    r="2" 
                    fill="#ffffff" 
                    className="animate-dataflow"
                    opacity="0.6"
                    style={{ animationDelay: '0.5s' }}
                  />
                  {/* Original SVG animateMotion for browsers that support it */}
                  <circle r="3" fill="#00ff88" opacity="0.8">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={`M ${hubPos.x} ${hubPos.y} L ${pos.x} ${pos.y}`}
                    />
                  </circle>
                  <circle r="2" fill="#ffffff" opacity="0.6">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      begin="0.5s"
                      path={`M ${pos.x} ${pos.y} L ${hubPos.x} ${hubPos.y}`}
                    />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-pattern animate-pulse"></div>
      </div>
      
      {/* Scan line animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scan-line"></div>
      </div>
      
      <div className="topology-container h-full relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-mono font-bold text-green-400 tracking-wider">
            NETWORK TOPOLOGY
          </h2>
          <div className="flex space-x-4 text-sm font-mono">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">SCANNING</span>
            </div>
            <div className="text-gray-400">
              {devices.filter(d => d.status === 'online').length}/{devices.length} ONLINE
            </div>
            {/* Debug info */}
            <div className="text-yellow-400 text-xs">
              DEBUG: {devices.length} devices loaded
            </div>
          </div>
        </div>
        
        <svg className="w-full h-full" viewBox="0 0 800 600" key={animationKey}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="nodeGradient" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8"/>
              <stop offset="70%" stopColor="#333333" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0.9"/>
            </radialGradient>
          </defs>
          
          {/* Render connections */}
          {renderConnections()}
          
          {/* Device nodes */}
          {devices.map((device, index) => {
            const positions = getDevicePositions();
            const pos = positions[device.id] || { 
              x: 150 + (index % 4) * 150, 
              y: 150 + Math.floor(index / 4) * 120 
            };
            
            const isSelected = selectedDevice?.id === device.id;
            const isHovered = hoveredDevice === device.id;
            const statusColor = getStatusColor(device.status);
            const deviceIcon = getDeviceIcon(device.type);
            
            return (
              <g 
                key={device.id} 
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-all duration-300 ease-out"
                onMouseEnter={() => setHoveredDevice(device.id)}
                onMouseLeave={() => setHoveredDevice(null)}
              >
                {/* Device glow effect */}
                {(isSelected || isHovered) && (
                  <circle
                    cx="0"
                    cy="0"
                    r="35"
                    fill="none"
                    stroke={statusColor}
                    strokeWidth="1"
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}
                
                {/* Device main circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "28" : isHovered ? "24" : "20"}
                  fill="url(#nodeGradient)"
                  stroke={statusColor}
                  strokeWidth={isSelected ? "4" : isHovered ? "3" : "2"}
                  filter="url(#glow)"
                  className={`transition-all duration-300 ease-out ${device.status === 'online' ? 'animate-node-glow' : ''}`}
                  onClick={() => onDeviceSelect(device)}
                  style={{
                    filter: device.status === 'online' ? `drop-shadow(0 0 8px ${statusColor})` : 'none',
                  }}
                />
                
                {/* Device type icon */}
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  fontSize={isSelected ? "20" : "16"}
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                >
                  {deviceIcon}
                </text>
                
                {/* Device name */}
                <text
                  x="0"
                  y="45"
                  textAnchor="middle"
                  className="fill-white text-xs font-mono font-bold pointer-events-none select-none tracking-wider"
                  fontSize="12"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                >
                  {device.name.split(' ')[0].toUpperCase()}
                </text>
                
                {/* IP address */}
                <text
                  x="0"
                  y="58"
                  textAnchor="middle"
                  className="fill-gray-300 text-xs font-mono pointer-events-none select-none"
                  fontSize="10"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                >
                  {device.ip}
                </text>
                
                {/* Status indicator */}
                <circle
                  cx="20"
                  cy="-20"
                  r="5"
                  fill={statusColor}
                  className={device.status === 'connecting' ? 'animate-pulse' : ''}
                  style={{
                    filter: device.status === 'online' ? `drop-shadow(0 0 4px ${statusColor})` : 'none',
                  }}
                />
                
                {/* Device type badge */}
                <rect
                  x="-15"
                  y="-35"
                  width="30"
                  height="12"
                  rx="6"
                  fill="rgba(0,0,0,0.8)"
                  stroke={statusColor}
                  strokeWidth="1"
                  opacity={isHovered || isSelected ? "1" : "0"}
                  className="transition-opacity duration-300"
                />
                <text
                  x="0"
                  y="-27"
                  textAnchor="middle"
                  className="fill-white text-xs font-mono font-bold pointer-events-none select-none"
                  fontSize="8"
                  opacity={isHovered || isSelected ? "1" : "0"}
                  style={{ transition: 'opacity 0.3s' }}
                >
                  {device.type.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Enhanced Legend */}
        <div className="absolute bottom-6 left-6 bg-black/90 border border-green-400/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="text-green-400 font-mono text-sm mb-4 font-bold tracking-wider border-b border-green-400/30 pb-2">
            NETWORK STATUS
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 group">
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
              <span className="text-gray-200 text-sm font-mono group-hover:text-green-400 transition-colors">
                ONLINE ({devices.filter(d => d.status === 'online').length})
              </span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-gray-200 text-sm font-mono group-hover:text-yellow-400 transition-colors">
                CONNECTING ({devices.filter(d => d.status === 'connecting').length})
              </span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-200 text-sm font-mono group-hover:text-red-400 transition-colors">
                ERROR ({devices.filter(d => d.status === 'error').length})
              </span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <span className="text-gray-200 text-sm font-mono group-hover:text-gray-400 transition-colors">
                OFFLINE ({devices.filter(d => d.status === 'offline').length})
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-green-400/30">
            <div className="text-green-400/80 text-xs font-mono tracking-wider">
              TOTAL DEVICES: {devices.length}
            </div>
            <div className="text-green-400/60 text-xs font-mono mt-1">
              ACTIVE CONNECTIONS: {devices.filter(d => d.status === 'online').length - 1}
            </div>
          </div>
        </div>
        
        {/* Device info tooltip */}
        {hoveredDevice && (
          <div className="absolute top-6 right-6 bg-black/95 border border-green-400/50 rounded-lg p-4 backdrop-blur-sm">
            {(() => {
              const device = devices.find(d => d.id === hoveredDevice);
              if (!device) return null;
              
              return (
                <div className="space-y-2">
                  <div className="text-green-400 font-mono font-bold text-lg">
                    {device.name}
                  </div>
                  <div className="text-gray-300 text-sm font-mono space-y-1">
                    <div>Type: <span className="text-white">{device.type.toUpperCase()}</span></div>
                    <div>IP: <span className="text-white">{device.ip}</span></div>
                    <div>Status: <span className={`${
                      device.status === 'online' ? 'text-green-400' :
                      device.status === 'connecting' ? 'text-yellow-400' :
                      device.status === 'error' ? 'text-red-400' : 'text-gray-400'
                    }`}>{device.status.toUpperCase()}</span></div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopologyPanel;
