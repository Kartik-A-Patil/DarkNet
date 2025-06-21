import React from 'react';
import { ConnectionAnimation } from '../types';

interface ConnectionOverlayProps {
  connectionAnimations: ConnectionAnimation[];
}

const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({ connectionAnimations }) => {
  const getConnectionPath = (fromDeviceId: string, toDeviceId: string): string => {
    // Device positions based on topology layout
    const positions = {
      '1': { x: 200, y: 200 }, // Database
      '2': { x: 400, y: 100 }, // Router
      '3': { x: 300, y: 300 }, // Current Workstation
      '4': { x: 600, y: 200 }, // Web Server
      '5': { x: 500, y: 300 }, // IoT Gateway
      '6': { x: 400, y: 250 }  // Mobile Device
    };

    const fromPos = positions[fromDeviceId as keyof typeof positions];
    const toPos = positions[toDeviceId as keyof typeof positions];

    if (!fromPos || !toPos) return '';

    // Create a smooth curved path
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2 - 30; // Slight curve
    
    return `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`;
  };

  const getAnimationColor = (type: ConnectionAnimation['type']): string => {
    switch (type) {
      case 'data': return '#3b82f6'; // Blue
      case 'control': return '#f59e0b'; // Amber
      case 'attack': return '#ef4444'; // Red
      case 'secure': return '#10b981'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  return (
    <div className="connection-overlay absolute inset-0 pointer-events-none z-10">
      <svg className="w-full h-full">
        <defs>
          <filter id="connectionGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Animated gradient for data flow */}
          <linearGradient id="dataFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent">
              <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8">
              <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </stop>
            <stop offset="100%" stopColor="transparent">
              <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s" />
            </stop>
          </linearGradient>
          
          {/* Animated gradient for control signals */}
          <linearGradient id="controlFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9">
              <animate attributeName="stop-opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          {/* Pulsing effect for attack animations */}
          <radialGradient id="attackPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8">
              <animate attributeName="stop-opacity" values="0.8;0.2;0.8" dur="0.8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        
        {connectionAnimations.filter(anim => anim.active).map((animation, index) => {
          const path = getConnectionPath(animation.from, animation.to);
          const color = getAnimationColor(animation.type);
          
          return (
            <g key={`${animation.from}-${animation.to}-${animation.type}-${index}`}>
              {/* Base connection line */}
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeOpacity="0.3"
                filter="url(#connectionGlow)"
              />
              
              {/* Animated flow effect */}
              <path
                d={path}
                fill="none"
                stroke={animation.type === 'data' ? 'url(#dataFlow)' : 
                       animation.type === 'control' ? 'url(#controlFlow)' : 
                       animation.type === 'attack' ? 'url(#attackPulse)' : color}
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#connectionGlow)"
              >
                {animation.type === 'data' && (
                  <animate
                    attributeName="stroke-dasharray"
                    values="0,100;20,80;0,100"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                )}
                {animation.type === 'control' && (
                  <animate
                    attributeName="stroke-dasharray"
                    values="0,50;10,40;0,50"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
                {animation.type === 'attack' && (
                  <animate
                    attributeName="stroke-width"
                    values="2;6;2"
                    dur="0.5s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
              
              {/* Connection type indicator */}
              <circle
                cx="0"
                cy="0"
                r="4"
                fill={color}
                opacity="0.8"
              >
                <animateMotion
                  dur={animation.type === 'attack' ? '0.8s' : '2s'}
                  repeatCount="indefinite"
                >
                  <mpath href={`#connection-${index}`} />
                </animateMotion>
              </circle>
              
              {/* Hidden path for motion animation */}
              <path
                id={`connection-${index}`}
                d={path}
                fill="none"
                stroke="none"
              />
            </g>
          );
        })}
      </svg>
      
      {/* Connection status indicators */}
      <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur rounded-lg p-3 text-xs text-white border border-gray-700">
        <div className="flex items-center space-x-2 mb-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          <span>Active Connections: {connectionAnimations.filter(a => a.active).length}</span>
        </div>
        
        {connectionAnimations.filter(a => a.active).map((anim, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs opacity-75">
            <span 
              className={`w-1.5 h-1.5 rounded-full`}
              style={{ backgroundColor: getAnimationColor(anim.type) }}
            ></span>
            <span className="capitalize">{anim.type} flow</span>
          </div>
        ))}
      </div>
      
      {/* Network activity legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur rounded-lg p-3 text-xs text-white border border-gray-700">
        <div className="font-semibold mb-2">Connection Types:</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span>Data Transfer</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            <span>Control Signal</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            <span>Security Alert</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Secure Channel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionOverlay;
