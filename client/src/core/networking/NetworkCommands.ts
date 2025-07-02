/**
 * Network Commands for Terminal Integration
 * Integrates the networking core with the existing terminal system
 */

import { Command, CommandResult, CommandOptions } from '../../lib/utils/commandProcessor/types';
import { formatError, formatSuccess, formatOutput } from '../../lib/utils/commandProcessor/utils/formatOutput';
import { NetworkManager } from './NetworkManager';
import { ServiceRegistry } from './NetworkingCore';

export const netscan: Command = {
  name: 'netscan',
  description: 'Scan network systems for open ports and services',
  usage: 'netscan <target_ip> [options]\n  -p <ports>    Port range (e.g., 1-1000, 80,443,3306)\n  -t <type>     Scan type: tcp, udp, stealth, comprehensive\n  -v            Verbose output',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (args.length === 0) {
      const systems = NetworkManager.getOnlineSystems();
      if (systems.length === 0) {
        return {
          output: formatError('No online systems found on the network'),
          error: true
        };
      }

      let output = formatOutput('Network Discovery Results:\n');
      output += formatOutput('═══════════════════════════════\n');
      
      systems.forEach(system => {
        const openPorts = NetworkManager.getOpenPorts(system.id).length;
        output += formatOutput(
          `${system.address.ipv4.padEnd(15)} ${system.name.padEnd(20)} ${system.type.padEnd(12)} ${openPorts} ports open\n`
        );
      });

      return { output, error: false };
    }

    const targetIP = args[0];
    const targetSystem = NetworkManager.getSystemByIP(targetIP);
    
    if (!targetSystem) {
      return {
        output: formatError(`No system found at IP address: ${targetIP}`),
        error: true
      };
    }

    // Parse options
    let portRange = { start: 1, end: 1023 };
    let scanType: 'tcp' | 'udp' | 'stealth' | 'comprehensive' = 'tcp';
    let verbose = false;

    for (let i = 1; i < args.length; i++) {
      if (args[i] === '-p' && i + 1 < args.length) {
        const portArg = args[i + 1];
        if (portArg.includes('-')) {
          const [start, end] = portArg.split('-').map(Number);
          portRange = { start, end };
        } else if (portArg.includes(',')) {
          // Handle comma-separated ports (simplified for now)
          const ports = portArg.split(',').map(Number);
          portRange = { start: Math.min(...ports), end: Math.max(...ports) };
        }
        i++; // Skip next arg as it's the port value
      } else if (args[i] === '-t' && i + 1 < args.length) {
        scanType = args[i + 1] as any;
        i++;
      } else if (args[i] === '-v') {
        verbose = true;
      }
    }

    try {
      // Simulate scan time based on range
      const portCount = portRange.end - portRange.start + 1;
      const scanDuration = Math.min(portCount * 10, 3000); // Max 3 seconds
      
      let output = formatOutput(`Starting ${scanType.toUpperCase()} scan of ${targetIP} (${targetSystem.name})\n`);
      output += formatOutput(`Scanning ${portCount} ports...\n\n`);

      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, Math.min(scanDuration, 1000)));

      const scanResult = NetworkManager.scanSystem('current-system', targetSystem.id, scanType, portRange);

      if (scanResult.openPorts.length === 0) {
        output += formatOutput('No open ports found.\n');
        return { output, error: false };
      }

      output += formatSuccess(`Found ${scanResult.openPorts.length} open ports:\n\n`);
      output += formatOutput('PORT     STATE  SERVICE      VERSION\n');
      output += formatOutput('────────────────────────────────────────────\n');

      scanResult.services.forEach(({ port, service }) => {
        const portStr = port.toString().padEnd(8);
        const stateStr = 'open'.padEnd(6);
        const serviceStr = service.name.padEnd(12);
        const versionStr = service.version || 'unknown';
        
        output += formatOutput(`${portStr} ${stateStr} ${serviceStr} ${versionStr}\n`);
        
        if (verbose && service.banner) {
          output += formatOutput(`  └─ Banner: ${service.banner}\n`);
        }
        if (verbose && service.vulnerabilities && service.vulnerabilities.length > 0) {
          output += formatOutput(`  └─ Vulnerabilities: ${service.vulnerabilities.join(', ')}\n`);
        }
      });

      return { output, error: false };
    } catch (error: any) {
      return {
        output: formatError(`Scan failed: ${error.message}`),
        error: true
      };
    }
  }
};

export const netstat: Command = {
  name: 'netstat',
  description: 'Display network connections and listening ports',
  usage: 'netstat [options]\n  -a    Show all connections\n  -l    Show only listening ports\n  -n    Show numerical addresses',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    const showAll = args.includes('-a');
    const showListening = args.includes('-l');
    const numerical = args.includes('-n');

    // For now, assume we're checking the current system
    const currentSystemId = 'current-system'; // In real implementation, this would be dynamic
    
    let output = formatOutput('Active Network Connections\n');
    output += formatOutput('═══════════════════════════════════════════\n');

    if (showListening || showAll) {
      output += formatOutput('\nListening Ports:\n');
      output += formatOutput('PROTO LOCAL ADDRESS      STATE       SERVICE\n');
      output += formatOutput('──────────────────────────────────────────\n');

      // Show all systems for demonstration
      const systems = NetworkManager.getAllSystems();
      systems.forEach(system => {
        const services = NetworkManager.getRunningServices(system.id);
        services.forEach(({ port, service }) => {
          const proto = service.protocol === 'BOTH' ? 'TCP' : service.protocol;
          const address = numerical ? 
            `${system.address.ipv4}:${port}` : 
            `${system.name}:${port}`;
          
          output += formatOutput(
            `${proto.padEnd(5)} ${address.padEnd(20)} LISTENING   ${service.name}\n`
          );
        });
      });
    }

    if (showAll) {
      output += formatOutput('\nEstablished Connections:\n');
      output += formatOutput('PROTO LOCAL ADDRESS      FOREIGN ADDRESS     STATE\n');
      output += formatOutput('────────────────────────────────────────────────────\n');

      const allConnections = NetworkManager.getConnections(currentSystemId);
      if (allConnections.length === 0) {
        output += formatOutput('No established connections.\n');
      } else {
        allConnections.forEach(conn => {
          const sourceSystem = NetworkManager.getSystem(conn.sourceSystemId);
          const targetSystem = NetworkManager.getSystem(conn.targetSystemId);
          
          if (sourceSystem && targetSystem) {
            const localAddr = `${sourceSystem.address.ipv4}:${conn.sourcePort}`;
            const foreignAddr = `${targetSystem.address.ipv4}:${conn.targetPort}`;
            
            output += formatOutput(
              `${conn.protocol.padEnd(5)} ${localAddr.padEnd(20)} ${foreignAddr.padEnd(19)} ${conn.status.toUpperCase()}\n`
            );
          }
        });
      }
    }

    return { output, error: false };
  }
};

export const netinfo: Command = {
  name: 'netinfo',
  description: 'Display detailed network system information',
  usage: 'netinfo [system_ip]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    let targetSystem;
    
    if (args.length === 0) {
      // Show network overview
      const stats = NetworkManager.getNetworkStats();
      let output = formatOutput('Network Overview\n');
      output += formatOutput('═══════════════════\n');
      output += formatOutput(`Total Systems:      ${stats.totalSystems}\n`);
      output += formatOutput(`Online Systems:     ${stats.onlineSystems}\n`);
      output += formatOutput(`Total Open Ports:   ${stats.totalOpenPorts}\n`);
      output += formatOutput(`Active Connections: ${stats.activeConnections}\n`);
      output += formatOutput(`Total Services:     ${stats.totalServices}\n\n`);

      output += formatOutput('Online Systems:\n');
      output += formatOutput('IP ADDRESS       NAME                 TYPE         PORTS\n');
      output += formatOutput('─────────────────────────────────────────────────────\n');
      
      const systems = NetworkManager.getOnlineSystems();
      systems.forEach(sys => {
        const openPorts = NetworkManager.getOpenPorts(sys.id).length;
        output += formatOutput(
          `${sys.address.ipv4.padEnd(16)} ${sys.name.padEnd(20)} ${sys.type.padEnd(12)} ${openPorts}\n`
        );
      });

      return { output, error: false };
    }

    const targetIP = args[0];
    targetSystem = NetworkManager.getSystemByIP(targetIP);

    if (!targetSystem) {
      return {
        output: formatError(`System not found: ${targetIP}`),
        error: true
      };
    }

    const services = NetworkManager.getRunningServices(targetSystem.id);
    const connections = NetworkManager.getConnections(targetSystem.id);

    let output = formatOutput(`System Information: ${targetSystem.name}\n`);
    output += formatOutput('═══════════════════════════════════════\n');
    output += formatOutput(`System ID:       ${targetSystem.id}\n`);
    output += formatOutput(`IPv4 Address:    ${targetSystem.address.ipv4}\n`);
    output += formatOutput(`IPv6 Address:    ${targetSystem.address.ipv6}\n`);
    output += formatOutput(`System Type:     ${targetSystem.type}\n`);
    output += formatOutput(`Operating System: ${targetSystem.os}\n`);
    output += formatOutput(`Security Level:  ${targetSystem.securityLevel}\n`);
    output += formatOutput(`Status:          ${targetSystem.isOnline ? 'ONLINE' : 'OFFLINE'}\n`);
    output += formatOutput(`Last Seen:       ${targetSystem.lastSeen.toLocaleString()}\n\n`);

    if (services.length > 0) {
      output += formatOutput('Running Services:\n');
      output += formatOutput('PORT  SERVICE          VERSION           PROTOCOL\n');
      output += formatOutput('────────────────────────────────────────────────────\n');
      
      services.forEach(({ port, service }) => {
        output += formatOutput(
          `${port.toString().padEnd(5)} ${service.name.padEnd(16)} ${service.version.padEnd(17)} ${service.protocol}\n`
        );
      });
      output += '\n';
    }

    if (connections.length > 0) {
      output += formatOutput('Active Connections:\n');
      output += formatOutput('DIRECTION  REMOTE SYSTEM         PORT   STATUS\n');
      output += formatOutput('──────────────────────────────────────────────\n');
      
      connections.forEach(conn => {
        const isOutgoing = conn.sourceSystemId === targetSystem.id;
        const direction = isOutgoing ? 'OUTGOING' : 'INCOMING';
        const remoteSystemId = isOutgoing ? conn.targetSystemId : conn.sourceSystemId;
        const remoteSystem = NetworkManager.getSystem(remoteSystemId);
        const port = isOutgoing ? conn.targetPort : conn.sourcePort;
        
        output += formatOutput(
          `${direction.padEnd(10)} ${(remoteSystem?.name || 'Unknown').padEnd(20)} ${port.toString().padEnd(6)} ${conn.status.toUpperCase()}\n`
        );
      });
    }

    return { output, error: false };
  }
};

export const netservice: Command = {
  name: 'netservice',
  description: 'Manage network services',
  usage: 'netservice <action> [options]\n  list                  List available services\n  start <service_id> <port>  Start a service\n  stop <port>          Stop a service\n  info <service_id>    Show service information',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    if (args.length === 0) {
      return {
        output: formatError('Usage: netservice <action> [options]\nUse "netservice list" to see available services'),
        error: true
      };
    }

    const action = args[0].toLowerCase();

    switch (action) {
      case 'list':
        const services = ServiceRegistry.getAllServices();
        let output = formatOutput('Available Network Services\n');
        output += formatOutput('═══════════════════════════════════════\n');
        output += formatOutput('ID   NAME              DEFAULT PORTS  PROTOCOL\n');
        output += formatOutput('───────────────────────────────────────────────────\n');
        
        services.forEach(service => {
          const ports = service.defaultPorts.join(',');
          const protocols = service.protocols.join(',');
          output += formatOutput(
            `${service.id.toString().padEnd(4)} ${service.name.padEnd(17)} ${ports.padEnd(13)} ${protocols}\n`
          );
        });
        
        return { output, error: false };

      case 'info':
        if (args.length < 2) {
          return {
            output: formatError('Usage: netservice info <service_id>'),
            error: true
          };
        }
        
        const serviceId = parseInt(args[1]);
        const serviceInfo = ServiceRegistry.getService(serviceId);
        
        if (!serviceInfo) {
          return {
            output: formatError(`Service with ID ${serviceId} not found`),
            error: true
          };
        }

        let infoOutput = formatOutput(`Service Information: ${serviceInfo.name}\n`);
        infoOutput += formatOutput('═══════════════════════════════════════\n');
        infoOutput += formatOutput(`Service ID:      ${serviceInfo.id}\n`);
        infoOutput += formatOutput(`Name:            ${serviceInfo.name}\n`);
        infoOutput += formatOutput(`Default Ports:   ${serviceInfo.defaultPorts.join(', ')}\n`);
        infoOutput += formatOutput(`Protocols:       ${serviceInfo.protocols.join(', ')}\n`);
        infoOutput += formatOutput(`Available Versions:\n`);
        serviceInfo.versions.forEach(version => {
          infoOutput += formatOutput(`  - ${version}\n`);
        });
        
        if (serviceInfo.vulnerabilities.length > 0) {
          infoOutput += formatOutput(`Known Vulnerabilities:\n`);
          serviceInfo.vulnerabilities.forEach(vuln => {
            infoOutput += formatOutput(`  - ${vuln}\n`);
          });
        }

        return { output: infoOutput, error: false };

      default:
        return {
          output: formatError(`Unknown action: ${action}\nAvailable actions: list, info`),
          error: true
        };
    }
  }
};

// Export all network commands
export const networkCommands = {
  netscan,
  netstat,
  netinfo,
  netservice
};
