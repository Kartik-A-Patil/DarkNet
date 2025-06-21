import React, { useState, useEffect } from 'react';
import { Device } from '../../types';
import { logNetworkActivity, saveDeviceData, getDeviceData } from '../../utils/networkDatabase';

interface IoTInterfaceProps {
  device: Device;
  onUpdate: (deviceId: string, data: any) => void;
}

const IoTInterface: React.FC<IoTInterfaceProps> = ({ device, onUpdate }) => {
  const [sensors, setSensors] = useState<any[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  const [mqttMessages, setMqttMessages] = useState<any[]>([]);
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIoTData();
    simulateSensorData();
    simulateConnectedDevices();
    simulateMqttMessages();
  }, []);

  const loadIoTData = async () => {
    try {
      const iotData = await getDeviceData(device.id, 'iot_config');
      if (iotData.length > 0) {
        const config = iotData[0].data;
        setAutomationRules(config.automationRules || []);
      }
    } catch (error) {
      console.error('Failed to load IoT data:', error);
    }
  };

  const simulateSensorData = () => {
    const sensorTypes = device.data?.sensors || ['temperature', 'humidity', 'motion', 'light'];
    const sensorData = sensorTypes.map((type: string) => ({
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      value: generateSensorValue(type),
      unit: getSensorUnit(type),
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      lastUpdate: new Date(Date.now() - Math.random() * 3600000),
      threshold: getSensorThreshold(type)
    }));
    setSensors(sensorData);
  };

  const generateSensorValue = (type: string): number => {
    switch (type) {
      case 'temperature':
        return Math.round((Math.random() * 30 + 10) * 10) / 10; // 10-40°C
      case 'humidity':
        return Math.round(Math.random() * 100); // 0-100%
      case 'light':
        return Math.round(Math.random() * 1000); // 0-1000 lux
      case 'motion':
        return Math.random() > 0.7 ? 1 : 0; // 0 or 1
      default:
        return Math.round(Math.random() * 100);
    }
  };

  const getSensorUnit = (type: string): string => {
    const units: { [key: string]: string } = {
      temperature: '°C',
      humidity: '%',
      light: 'lux',
      motion: 'detected',
      pressure: 'hPa',
      voltage: 'V'
    };
    return units[type] || '';
  };

  const getSensorThreshold = (type: string): { min: number; max: number } => {
    const thresholds: { [key: string]: { min: number; max: number } } = {
      temperature: { min: 15, max: 35 },
      humidity: { min: 30, max: 70 },
      light: { min: 100, max: 800 },
      motion: { min: 0, max: 1 }
    };
    return thresholds[type] || { min: 0, max: 100 };
  };

  const simulateConnectedDevices = () => {
    const deviceCount = device.data?.connectedDevices || 8;
    const devices = Array.from({ length: deviceCount }, (_, i) => ({
      id: `iot_device_${i + 1}`,
      name: `Smart Device ${i + 1}`,
      type: ['light', 'thermostat', 'camera', 'lock', 'speaker'][i % 5],
      status: Math.random() > 0.1 ? 'online' : 'offline',
      battery: Math.floor(Math.random() * 100),
      lastSeen: new Date(Date.now() - Math.random() * 3600000),
      ip: `192.168.1.${200 + i}`
    }));
    setConnectedDevices(devices);
  };

  const simulateMqttMessages = () => {
    const topics = ['home/sensors', 'devices/status', 'automation/triggers', 'security/alerts'];
    const messages = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      topic: topics[Math.floor(Math.random() * topics.length)],
      payload: `Message ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      qos: Math.floor(Math.random() * 3)
    }));
    setMqttMessages(messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const controlDevice = async (deviceId: string, action: string, value?: any) => {
    setLoading(true);
    
    // Update device status
    setConnectedDevices(prev => prev.map(dev => 
      dev.id === deviceId 
        ? { ...dev, status: action === 'turn_on' ? 'online' : action === 'turn_off' ? 'offline' : dev.status }
        : dev
    ));

    // Log MQTT message
    const mqttMessage = {
      id: Date.now(),
      topic: `devices/${deviceId}/command`,
      payload: JSON.stringify({ action, value }),
      timestamp: new Date(),
      qos: 1
    };
    setMqttMessages(prev => [mqttMessage, ...prev]);

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'control_device', deviceId, command: action, value },
      type: 'command'
    });

    setLoading(false);
  };

  const updateSensorThreshold = async (sensorId: string, threshold: { min: number; max: number }) => {
    setSensors(prev => prev.map(sensor => 
      sensor.id === sensorId 
        ? { ...sensor, threshold }
        : sensor
    ));

    await saveDeviceData(device.id, 'sensor_config', { sensorId, threshold });

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'update_threshold', sensorId, threshold },
      type: 'command'
    });
  };

  const createAutomationRule = async (rule: any) => {
    const newRule = {
      id: Date.now().toString(),
      ...rule,
      created: new Date(),
      enabled: true
    };

    const updatedRules = [...automationRules, newRule];
    setAutomationRules(updatedRules);

    await saveDeviceData(device.id, 'automation_rules', newRule);

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'create_automation', rule: newRule },
      type: 'command'
    });
  };

  const triggerAutomation = async (ruleId: string) => {
    const rule = automationRules.find(r => r.id === ruleId);
    if (!rule) return;

    // Simulate executing automation
    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'trigger_automation', ruleId, rule: rule.name },
      type: 'command'
    });

    // Update MQTT messages
    const automationMessage = {
      id: Date.now(),
      topic: 'automation/executed',
      payload: JSON.stringify({ rule: rule.name, triggered: new Date() }),
      timestamp: new Date(),
      qos: 2
    };
    setMqttMessages(prev => [automationMessage, ...prev]);
  };

  const refreshSensors = () => {
    simulateSensorData();
  };

  return (
    <div className="iot-interface">
      <div className="iot-header">
        <h4>IoT GATEWAY - {device.name}</h4>
        <div className="iot-stats">
          <span>Sensors: {sensors.length}</span>
          <span>Devices: {connectedDevices.filter(d => d.status === 'online').length}/{connectedDevices.length}</span>
          <span>MQTT: {device.data?.mqttMessages || 0}</span>
        </div>
      </div>

      {/* Sensor Monitoring */}
      <div className="sensors-section">
        <h5>SENSORS</h5>
        <button onClick={refreshSensors} className="refresh-btn">
          REFRESH
        </button>
        <div className="sensors-grid">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="sensor-card">
              <div className="sensor-header">
                <span className="sensor-name">{sensor.name}</span>
                <span className={`sensor-status ${sensor.status}`}>
                  {sensor.status.toUpperCase()}
                </span>
              </div>
              <div className="sensor-value">
                <span className="value">{sensor.value}</span>
                <span className="unit">{sensor.unit}</span>
              </div>
              <div className="sensor-threshold">
                <span>Threshold: {sensor.threshold.min} - {sensor.threshold.max}</span>
                <div className="threshold-controls">
                  <input
                    type="number"
                    value={sensor.threshold.min}
                    onChange={(e) => updateSensorThreshold(sensor.id, { 
                      min: Number(e.target.value), 
                      max: sensor.threshold.max 
                    })}
                    className="threshold-input"
                  />
                  <input
                    type="number"
                    value={sensor.threshold.max}
                    onChange={(e) => updateSensorThreshold(sensor.id, { 
                      min: sensor.threshold.min, 
                      max: Number(e.target.value) 
                    })}
                    className="threshold-input"
                  />
                </div>
              </div>
              <div className="sensor-alert">
                {(sensor.value < sensor.threshold.min || sensor.value > sensor.threshold.max) && (
                  <span className="alert">⚠️ THRESHOLD EXCEEDED</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Devices */}
      <div className="devices-section">
        <h5>CONNECTED DEVICES</h5>
        <div className="devices-grid">
          {connectedDevices.map((dev) => (
            <div key={dev.id} className="device-card">
              <div className="device-info">
                <div className="device-name">{dev.name}</div>
                <div className="device-type">{dev.type.toUpperCase()}</div>
                <div className={`device-status ${dev.status}`}>
                  {dev.status.toUpperCase()}
                </div>
                <div className="device-details">
                  <span>Battery: {dev.battery}%</span>
                  <span>IP: {dev.ip}</span>
                </div>
              </div>
              <div className="device-controls">
                <button
                  onClick={() => controlDevice(dev.id, 'turn_on')}
                  disabled={dev.status === 'online'}
                  className="control-btn on"
                >
                  ON
                </button>
                <button
                  onClick={() => controlDevice(dev.id, 'turn_off')}
                  disabled={dev.status === 'offline'}
                  className="control-btn off"
                >
                  OFF
                </button>
                <button
                  onClick={() => controlDevice(dev.id, 'reset')}
                  className="control-btn reset"
                >
                  RESET
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MQTT Messages */}
      <div className="mqtt-section">
        <h5>MQTT MESSAGES</h5>
        <div className="mqtt-container">
          {mqttMessages.slice(0, 8).map((message) => (
            <div key={message.id} className="mqtt-message">
              <div className="message-header">
                <span className="topic">{message.topic}</span>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                <span className="qos">QoS {message.qos}</span>
              </div>
              <div className="message-payload">{message.payload}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Rules */}
      <div className="automation-section">
        <h5>AUTOMATION RULES</h5>
        <div className="automation-rules">
          {automationRules.map((rule) => (
            <div key={rule.id} className="rule-card">
              <div className="rule-info">
                <div className="rule-name">{rule.name}</div>
                <div className="rule-description">{rule.description}</div>
                <div className={`rule-status ${rule.enabled ? 'enabled' : 'disabled'}`}>
                  {rule.enabled ? 'ENABLED' : 'DISABLED'}
                </div>
              </div>
              <button
                onClick={() => triggerAutomation(rule.id)}
                className="trigger-btn"
                disabled={!rule.enabled}
              >
                TRIGGER
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => createAutomationRule({
            name: `Rule ${automationRules.length + 1}`,
            description: 'Auto-generated rule',
            trigger: 'temperature > 30',
            action: 'turn_on_fan'
          })}
          className="create-rule-btn"
        >
          CREATE RULE
        </button>
      </div>
    </div>
  );
};

export default IoTInterface;
