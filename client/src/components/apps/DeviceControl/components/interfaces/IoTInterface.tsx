import React, { useState, useEffect } from 'react';
import { Device } from '../../types';

interface IoTInterfaceProps {
  device: Device;
  onUpdateDevice: (deviceId: string, settings: any) => void;
}

const IoTInterface: React.FC<IoTInterfaceProps> = ({ device, onUpdateDevice }) => {
  const [sensorData, setSensorData] = useState<any>({});
  const [showAutomation, setShowAutomation] = useState(false);
  
  const config = device.config || {};

  // Simulate real-time sensor data updates
  useEffect(() => {
    if (device.status === 'online') {
      const interval = setInterval(() => {
        setSensorData({
          temperature: (20 + Math.random() * 10).toFixed(1),
          humidity: (40 + Math.random() * 20).toFixed(0),
          motion: Math.random() > 0.8 ? 'detected' : 'clear',
          light: Math.floor(200 + Math.random() * 300),
          airQuality: Math.floor(50 + Math.random() * 200),
          timestamp: new Date().toLocaleTimeString()
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [device.status]);

  const handleToggleAutomation = (rule: string) => {
    const currentRules = config.automationRules || [];
    const updatedRules = currentRules.includes(rule)
      ? currentRules.filter(r => r !== rule)
      : [...currentRules, rule];
    
    onUpdateDevice(device.id, {
      config: {
        ...config,
        automationRules: updatedRules
      }
    });
  };

  const getSensorIcon = (sensor: string) => {
    const icons = {
      temperature: 'fa-thermometer-half',
      humidity: 'fa-tint',
      motion: 'fa-running',
      light: 'fa-sun',
      airQuality: 'fa-wind'
    };
    return icons[sensor as keyof typeof icons] || 'fa-sensor';
  };

  const getSensorValue = (sensor: string) => {
    const current = sensorData[sensor];
    const fallback = config.lastReading?.[sensor];
    
    switch (sensor) {
      case 'temperature':
        return `${current || fallback || '22.5'}°C`;
      case 'humidity':
        return `${current || fallback || '45'}%`;
      case 'motion':
        return current || fallback || 'clear';
      case 'light':
        return `${current || fallback || '350'} lux`;
      case 'airQuality':
        return `${current || fallback || '150'} AQI`;
      default:
        return 'N/A';
    }
  };

  const getSensorColor = (sensor: string, value: any) => {
    switch (sensor) {
      case 'temperature':
        const temp = parseFloat(value);
        return temp > 25 ? 'text-red-400' : temp < 18 ? 'text-blue-400' : 'text-green-400';
      case 'humidity':
        const humidity = parseInt(value);
        return humidity > 60 ? 'text-blue-400' : humidity < 30 ? 'text-yellow-400' : 'text-green-400';
      case 'motion':
        return value === 'detected' ? 'text-red-400' : 'text-green-400';
      case 'light':
        const light = parseInt(value);
        return light > 500 ? 'text-yellow-400' : light < 100 ? 'text-gray-400' : 'text-green-400';
      case 'airQuality':
        const aqi = parseInt(value);
        return aqi > 200 ? 'text-red-400' : aqi > 100 ? 'text-yellow-400' : 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="iot-interface p-6 bg-gray-900 text-white">
      <h3 className="text-xl font-bold text-green-400 mb-6">IoT GATEWAY CONTROL</h3>

      {/* Connection Status */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Gateway Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl mb-2 ${device.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
              <i className={`fa ${device.status === 'online' ? 'fa-wifi' : 'fa-times-circle'}`}></i>
            </div>
            <div className="text-sm text-gray-300">Connection</div>
            <div className="font-semibold">{device.status}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-blue-400 mb-2">
              <i className="fa fa-microchip"></i>
            </div>
            <div className="text-sm text-gray-300">CPU</div>
            <div className="font-semibold">{device.cpu}%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-purple-400 mb-2">
              <i className="fa fa-memory"></i>
            </div>
            <div className="text-sm text-gray-300">Memory</div>
            <div className="font-semibold">{device.memory}%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-green-400 mb-2">
              <i className="fa fa-clock"></i>
            </div>
            <div className="text-sm text-gray-300">Uptime</div>
            <div className="font-semibold text-xs">{device.uptime}</div>
          </div>
        </div>
      </div>

      {/* Sensor Readings */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-blue-400">Live Sensor Data</h4>
          <div className="text-xs text-gray-400">
            Last update: {sensorData.timestamp || 'Never'}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(config.sensors || ['temperature', 'humidity', 'motion', 'light']).map((sensor, index) => {
            const value = getSensorValue(sensor);
            const color = getSensorColor(sensor, value);
            return (
              <div key={index} className="bg-gray-700 p-4 rounded-lg text-center">
                <i className={`fa ${getSensorIcon(sensor)} text-2xl ${color} mb-3`}></i>
                <div className="text-sm text-gray-300 capitalize">{sensor}</div>
                <div className={`font-bold text-lg ${color}`}>
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Device Control</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setShowAutomation(!showAutomation)}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded flex flex-col items-center gap-2"
          >
            <i className="fa fa-cogs text-xl"></i>
            <span className="text-sm">Automation</span>
          </button>
          <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded flex flex-col items-center gap-2">
            <i className="fa fa-download text-xl"></i>
            <span className="text-sm">Export Data</span>
          </button>
          <button className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded flex flex-col items-center gap-2">
            <i className="fa fa-sync text-xl"></i>
            <span className="text-sm">Calibrate</span>
          </button>
          <button className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded flex flex-col items-center gap-2">
            <i className="fa fa-bell text-xl"></i>
            <span className="text-sm">Alerts</span>
          </button>
        </div>
      </div>

      {/* Automation Rules */}
      {showAutomation && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-purple-500">
          <h4 className="text-lg font-semibold mb-3 text-purple-400">Automation Rules</h4>
          <div className="space-y-3">
            {[
              'Auto lights at sunset',
              'Climate control',
              'Motion alerts',
              'Air quality monitoring',
              'Energy optimization'
            ].map((rule, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <div className="flex items-center gap-3">
                  <i className="fa fa-robot text-purple-400"></i>
                  <span>{rule}</span>
                </div>
                <button
                  onClick={() => handleToggleAutomation(rule)}
                  className={`px-3 py-1 rounded text-sm ${
                    (config.automationRules || []).includes(rule)
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {(config.automationRules || []).includes(rule) ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Services */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">Network Services</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(device.services || []).map((service, index) => (
            <div key={index} className="bg-green-900 border border-green-600 p-3 rounded text-center">
              <i className="fa fa-check-circle text-2xl text-green-400 mb-2"></i>
              <div className="text-sm font-semibold">{service}</div>
              <div className="text-xs text-gray-300">Active</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IoTInterface;