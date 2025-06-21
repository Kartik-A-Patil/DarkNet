import React, { useState, useEffect } from 'react';
import { Device } from '../../types';
import { logNetworkActivity, saveDeviceData, getDeviceData } from '../../utils/networkDatabase';

interface RouterInterfaceProps {
  device: Device;
  onUpdate: (deviceId: string, data: any) => void;
}

const RouterInterface: React.FC<RouterInterfaceProps> = ({ device, onUpdate }) => {
  const [routingTable, setRoutingTable] = useState<any[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  const [newRoute, setNewRoute] = useState({ destination: '', gateway: '', interface: 'eth0' });
  const [portForwarding, setPortForwarding] = useState<any[]>([]);
  const [firewallRules, setFirewallRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRouterData();
  }, []);

  const loadRouterData = async () => {
    setLoading(true);
    try {
      // Load stored router configuration
      const routerData = await getDeviceData(device.id, 'config');
      if (routerData.length > 0) {
        const config = routerData[0].data;
        setRoutingTable(config.routingTable || []);
        setPortForwarding(config.portForwarding || []);
        setFirewallRules(config.firewallRules || []);
      }

      // Simulate connected devices
      const mockDevices = Array.from({ length: device.data?.connectedDevices || 5 }, (_, i) => ({
        ip: `192.168.1.${100 + i}`,
        mac: `aa:bb:cc:dd:ee:${i.toString(16).padStart(2, '0')}`,
        hostname: `device-${i + 1}`,
        connected: new Date(Date.now() - Math.random() * 3600000).toISOString()
      }));
      setConnectedDevices(mockDevices);

      await logNetworkActivity({
        sourceDevice: 'current',
        targetDevice: device.id,
        data: { action: 'load_config' },
        type: 'command'
      });
    } catch (error) {
      console.error('Failed to load router data:', error);
    }
    setLoading(false);
  };

  const addRoute = async () => {
    if (!newRoute.destination || !newRoute.gateway) return;

    const route = {
      id: Date.now().toString(),
      ...newRoute,
      metric: 1,
      active: true
    };

    const updatedRoutes = [...routingTable, route];
    setRoutingTable(updatedRoutes);
    setNewRoute({ destination: '', gateway: '', interface: 'eth0' });

    await saveRouterConfig({ routingTable: updatedRoutes, portForwarding, firewallRules });
    
    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'add_route', route },
      type: 'command'
    });
  };

  const deleteRoute = async (routeId: string) => {
    const updatedRoutes = routingTable.filter(route => route.id !== routeId);
    setRoutingTable(updatedRoutes);
    await saveRouterConfig({ routingTable: updatedRoutes, portForwarding, firewallRules });
  };

  const saveRouterConfig = async (config: any) => {
    await saveDeviceData(device.id, 'config', config);
  };

  const blockDevice = async (deviceIp: string) => {
    const newRule = {
      id: Date.now().toString(),
      action: 'DROP',
      source: deviceIp,
      target: 'any',
      port: 'any',
      protocol: 'any'
    };

    const updatedRules = [...firewallRules, newRule];
    setFirewallRules(updatedRules);
    await saveRouterConfig({ routingTable, portForwarding, firewallRules: updatedRules });

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'block_device', deviceIp, rule: newRule },
      type: 'command'
    });
  };

  const createPortForward = async (externalPort: number, internalIp: string, internalPort: number) => {
    const forward = {
      id: Date.now().toString(),
      externalPort,
      internalIp,
      internalPort,
      protocol: 'TCP',
      enabled: true
    };

    const updatedForwards = [...portForwarding, forward];
    setPortForwarding(updatedForwards);
    await saveRouterConfig({ routingTable, portForwarding: updatedForwards, firewallRules });
  };

  const simulateTrafficShaping = async (deviceIp: string, bandwidthLimit: number) => {
    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { 
        action: 'traffic_shaping', 
        deviceIp, 
        bandwidthLimit: `${bandwidthLimit}Mbps` 
      },
      type: 'command'
    });

    // Update device data to reflect traffic shaping
    onUpdate(device.id, {
      data: {
        ...device.data,
        trafficShaping: {
          ...device.data?.trafficShaping,
          [deviceIp]: `${bandwidthLimit}Mbps`
        }
      }
    });
  };

  return (
    <div className="router-interface">
      <div className="router-header">
        <h4>ROUTER INTERFACE - {device.name}</h4>
        <div className="router-stats">
          <span>Connected: {connectedDevices.length}</span>
          <span>Routes: {routingTable.length}</span>
          <span>Bandwidth: {device.data?.bandwidth?.used || '0Mbps'}/{device.data?.bandwidth?.total || '1Gbps'}</span>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="connected-devices">
        <h5>CONNECTED DEVICES</h5>
        <div className="devices-grid">
          {connectedDevices.map((dev, index) => (
            <div key={index} className="device-card">
              <div className="device-info">
                <div className="device-ip">{dev.ip}</div>
                <div className="device-hostname">{dev.hostname}</div>
                <div className="device-mac">{dev.mac}</div>
              </div>
              <div className="device-actions">
                <button
                  onClick={() => blockDevice(dev.ip)}
                  className="block-btn"
                >
                  BLOCK
                </button>
                <button
                  onClick={() => simulateTrafficShaping(dev.ip, 10)}
                  className="limit-btn"
                >
                  LIMIT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routing Table */}
      <div className="routing-section">
        <h5>ROUTING TABLE</h5>
        
        {/* Add New Route */}
        <div className="add-route">
          <input
            type="text"
            placeholder="Destination (e.g., 10.0.0.0/24)"
            value={newRoute.destination}
            onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})}
            className="route-input"
          />
          <input
            type="text"
            placeholder="Gateway IP"
            value={newRoute.gateway}
            onChange={(e) => setNewRoute({...newRoute, gateway: e.target.value})}
            className="route-input"
          />
          <select
            value={newRoute.interface}
            onChange={(e) => setNewRoute({...newRoute, interface: e.target.value})}
            className="route-select"
          >
            <option value="eth0">eth0</option>
            <option value="eth1">eth1</option>
            <option value="wlan0">wlan0</option>
          </select>
          <button onClick={addRoute} className="add-route-btn">
            ADD ROUTE
          </button>
        </div>

        {/* Routes List */}
        <div className="routes-list">
          {routingTable.map((route) => (
            <div key={route.id} className="route-item">
              <div className="route-info">
                <span>{route.destination}</span>
                <span>→</span>
                <span>{route.gateway}</span>
                <span>({route.interface})</span>
              </div>
              <button
                onClick={() => deleteRoute(route.id)}
                className="delete-route-btn"
              >
                DELETE
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Port Forwarding */}
      <div className="port-forwarding">
        <h5>PORT FORWARDING</h5>
        <div className="port-forwards">
          {portForwarding.map((forward) => (
            <div key={forward.id} className="forward-item">
              <span>:{forward.externalPort}</span>
              <span>→</span>
              <span>{forward.internalIp}:{forward.internalPort}</span>
              <span>({forward.protocol})</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => createPortForward(8080, '192.168.1.100', 80)}
          className="add-forward-btn"
        >
          ADD PORT FORWARD
        </button>
      </div>

      {/* Firewall Rules */}
      <div className="firewall-section">
        <h5>FIREWALL RULES</h5>
        <div className="firewall-rules">
          {firewallRules.map((rule) => (
            <div key={rule.id} className="rule-item">
              <span className={`action ${rule.action.toLowerCase()}`}>
                {rule.action}
              </span>
              <span>{rule.source}</span>
              <span>→</span>
              <span>{rule.target}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouterInterface;
