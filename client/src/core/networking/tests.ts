/**
 * Networking Core Test & Demo
 * Run this to test the networking system functionality
 */

import { NetworkManager } from './NetworkManager';
import { ServiceRegistry, NetworkSystem, ServiceDefinition } from './NetworkingCore';

export function testNetworkingCore() {
  console.log('🧪 Testing DarkNet Networking Core...\n');

  // Test 1: System Information
  console.log('📊 Network Statistics:');
  const stats = NetworkManager.getNetworkStats();
  console.log(stats);
  console.log('');

  // Test 2: List Systems
  console.log('🖥️  Online Systems:');
  const systems = NetworkManager.getOnlineSystems();
  systems.forEach((sys: NetworkSystem) => {
    console.log(`  ${sys.name} (${sys.id})`);
    console.log(`    IPv4: ${sys.address.ipv4}`);
    console.log(`    IPv6: ${sys.address.ipv6}`);
    console.log(`    Type: ${sys.type}`);
    console.log(`    OS: ${sys.os}`);
    console.log('');
  });

  // Test 3: Scan a system
  if (systems.length > 0) {
    const targetSystem = systems[0];
    console.log(`🔍 Scanning ${targetSystem.name}...`);
    
    const scanResult = NetworkManager.scanSystem('test-scanner', targetSystem.id, 'tcp');
    console.log(`Found ${scanResult.openPorts.length} open ports:`);
    
    scanResult.services.forEach(({ port, service }: { port: number; service: any }) => {
      console.log(`  Port ${port}: ${service.name} v${service.version} (${service.protocol})`);
      if (service.vulnerabilities && service.vulnerabilities.length > 0) {
        console.log(`    Vulnerabilities: ${service.vulnerabilities.join(', ')}`);
      }
    });
    console.log('');
  }

  // Test 4: Service Registry
  console.log('📋 Available Services:');
  const allServices = ServiceRegistry.getAllServices();
  allServices.slice(0, 5).forEach((service: ServiceDefinition) => {
    console.log(`  [${service.id}] ${service.name} - Ports: ${service.defaultPorts.join(', ')}`);
  });
  console.log('');

  // Test 5: Create a custom system
  console.log('🆕 Creating custom system...');
  const customSystem = NetworkManager.createSystem(
    'test-001',
    'Test Server',
    'server',
    'Ubuntu 22.04 LTS',
    'low'
  );
  console.log(`Created: ${customSystem.name} at ${customSystem.address.ipv4}`);
  console.log('');

  // Test 6: Connection simulation
  if (systems.length >= 2) {
    console.log('🔗 Testing network connection...');
    const source = systems[0];
    const target = systems[1];
    
    const connection = NetworkManager.establishConnection(
      source.id,
      target.id,
      12345,
      22,
      'TCP'
    );
    
    if (connection) {
      console.log(`Connection established: ${source.name}:${connection.sourcePort} -> ${target.name}:${connection.targetPort}`);
      console.log(`Connection ID: ${connection.id}`);
      console.log(`Status: ${connection.status}`);
    } else {
      console.log('Failed to establish connection');
    }
  }

  console.log('✅ Networking Core tests completed!');
}

// Test command-line interface
export function testNetworkCommands() {
  console.log('🖥️  Testing Network Commands...\n');

  // This would be called in a real terminal context
  console.log('Available commands:');
  console.log('  netscan <ip>     - Scan a network system');
  console.log('  netstat          - Show network connections');
  console.log('  netinfo [ip]     - Show system information');
  console.log('  netservice list  - List available services');
  console.log('');
  
  console.log('Example usage:');
  console.log('  $ netscan 192.168.1.100');
  console.log('  $ netstat -a');
  console.log('  $ netinfo');
  console.log('  $ netservice info 1');
}

// Export test functions
export const NetworkingTests = {
  testNetworkingCore,
  testNetworkCommands
};
