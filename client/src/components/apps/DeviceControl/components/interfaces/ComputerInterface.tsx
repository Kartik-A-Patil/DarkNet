import React, { useState, useEffect } from 'react';
import { Device } from '../../types';
import { logNetworkActivity, saveDeviceData, getDeviceData } from '../../utils/networkDatabase';

interface ComputerInterfaceProps {
  device: Device;
  onUpdate: (deviceId: string, data: any) => void;
}

const ComputerInterface: React.FC<ComputerInterfaceProps> = ({ device, onUpdate }) => {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [processes, setProcesses] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [activeScans, setActiveScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const tools = device.data?.tools || ['nmap', 'metasploit', 'wireshark'];

  useEffect(() => {
    loadComputerData();
    simulateProcesses();
  }, []);

  const loadComputerData = async () => {
    try {
      const computerData = await getDeviceData(device.id, 'computer_data');
      if (computerData.length > 0) {
        const data = computerData[0].data;
        setFiles(data.files || []);
        setActiveScans(data.activeScans || []);
      }
    } catch (error) {
      console.error('Failed to load computer data:', error);
    }
  };

  const simulateProcesses = () => {
    const mockProcesses = [
      { pid: 1234, name: 'ssh', cpu: 0.1, memory: 2.3, user: 'root' },
      { pid: 5678, name: 'apache2', cpu: 12.5, memory: 15.7, user: 'www-data' },
      { pid: 9012, name: 'mysql', cpu: 8.2, memory: 45.1, user: 'mysql' },
      { pid: 3456, name: 'nmap', cpu: 25.6, memory: 8.9, user: 'kali' },
      { pid: 7890, name: 'metasploit', cpu: 15.3, memory: 67.2, user: 'kali' }
    ];
    setProcesses(mockProcesses);
  };

  const executeCommand = async () => {
    if (!command.trim()) return;

    setLoading(true);
    const newOutput = [...terminalOutput, `$ ${command}`];
    
    // Simulate command execution
    let response = '';
    const cmd = command.toLowerCase();
    
    if (cmd.startsWith('nmap')) {
      response = await simulateNmapScan(command);
    } else if (cmd.startsWith('ls')) {
      response = files.map(f => f.name).join('  ') || 'payload.sh  exploit.py  config.txt  network.log';
    } else if (cmd.startsWith('ps')) {
      response = processes.map(p => `${p.pid}  ${p.name}  ${p.cpu}%  ${p.memory}%`).join('\n');
    } else if (cmd.startsWith('netstat')) {
      response = 'tcp  0.0.0.0:22    LISTEN\ntcp  0.0.0.0:80    LISTEN\ntcp  0.0.0.0:443   LISTEN';
    } else if (cmd.startsWith('whoami')) {
      response = 'kali';
    } else if (cmd.startsWith('pwd')) {
      response = '/home/kali';
    } else {
      response = `Command '${command}' executed successfully`;
    }
    
    newOutput.push(response);
    setTerminalOutput(newOutput);
    setCommand('');

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'execute_command', command, response: response.substring(0, 100) },
      type: 'command'
    });

    setLoading(false);
  };

  const simulateNmapScan = async (nmapCommand: string): Promise<string> => {
    const targetIp = nmapCommand.includes('192.168') ? 
      nmapCommand.match(/192\.168\.\d+\.\d+/)?.[0] || '192.168.1.1' : 
      '192.168.1.1';
    
    const scanResult = {
      target: targetIp,
      ports: [
        { port: 22, service: 'ssh', state: 'open' },
        { port: 80, service: 'http', state: 'open' },
        { port: 443, service: 'https', state: 'open' },
        { port: 3306, service: 'mysql', state: 'filtered' }
      ],
      os: 'Linux 4.15.0'
    };

    // Add to active scans
    const newScan = {
      id: Date.now().toString(),
      target: targetIp,
      type: 'nmap',
      status: 'completed',
      results: scanResult,
      timestamp: new Date()
    };

    const updatedScans = [...activeScans, newScan];
    setActiveScans(updatedScans);

    // Save scan data
    await saveDeviceData(device.id, 'scans', newScan);

    // Update device data
    if (device.data) {
      onUpdate(device.id, {
        data: {
          ...device.data,
          activeScans: updatedScans.length,
          discoveredHosts: (device.data.discoveredHosts || 0) + 1
        }
      });
    }

    return `Nmap scan report for ${targetIp}
Host is up (0.00050s latency).
PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   open     http
443/tcp  open     https
3306/tcp filtered mysql
OS: ${scanResult.os}`;
  };

  const launchTool = async (toolName: string) => {
    setLoading(true);
    
    let output = '';
    switch (toolName) {
      case 'metasploit':
        output = `Starting Metasploit framework...
msf6 > use exploit/multi/handler
msf6 exploit(multi/handler) > set payload windows/meterpreter/reverse_tcp
msf6 exploit(multi/handler) > run`;
        break;
      case 'wireshark':
        output = 'Starting Wireshark network analyzer...';
        break;
      case 'burpsuite':
        output = 'Launching Burp Suite Professional...';
        break;
      default:
        output = `Launching ${toolName}...`;
    }

    setTerminalOutput(prev => [...prev, `$ ${toolName}`, output]);

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'launch_tool', tool: toolName },
      type: 'command'
    });

    setLoading(false);
  };

  const killProcess = async (pid: number) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    setTerminalOutput(prev => [...prev, `$ kill ${pid}`, `Process ${pid} terminated`]);

    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'kill_process', pid },
      type: 'command'
    });
  };

  const uploadFile = async (fileName: string, content: string) => {
    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      size: content.length,
      type: fileName.split('.').pop() || 'txt',
      content,
      uploaded: new Date()
    };

    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);

    await saveDeviceData(device.id, 'files', newFile);
    
    await logNetworkActivity({
      sourceDevice: 'current',
      targetDevice: device.id,
      data: { action: 'upload_file', fileName, size: content.length },
      type: 'file'
    });
  };

  return (
    <div className="computer-interface">
      <div className="computer-header">
        <h4>COMPUTER INTERFACE - {device.name}</h4>
        <div className="computer-stats">
          <span>Tools: {tools.length}</span>
          <span>Processes: {processes.length}</span>
          <span>Active Scans: {activeScans.length}</span>
        </div>
      </div>

      {/* Terminal */}
      <div className="terminal-section">
        <h5>TERMINAL</h5>
        <div className="terminal-output">
          {terminalOutput.map((line, index) => (
            <div key={index} className={line.startsWith('$') ? 'command-line' : 'output-line'}>
              {line}
            </div>
          ))}
        </div>
        <div className="terminal-input">
          <span className="prompt">kali@{device.name.toLowerCase().replace(' ', '-')}:~$ </span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
            className="command-input"
            placeholder="Enter command..."
          />
          <button onClick={executeCommand} disabled={loading} className="execute-btn">
            {loading ? 'EXECUTING...' : 'RUN'}
          </button>
        </div>
      </div>

      {/* Tools */}
      <div className="tools-section">
        <h5>SECURITY TOOLS</h5>
        <div className="tools-grid">
          {tools.map((tool: string) => (
            <button
              key={tool}
              onClick={() => launchTool(tool)}
              className="tool-btn"
              disabled={loading}
            >
              {tool.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Running Processes */}
      <div className="processes-section">
        <h5>RUNNING PROCESSES</h5>
        <div className="processes-table">
          <div className="process-header">
            <span>PID</span>
            <span>NAME</span>
            <span>CPU%</span>
            <span>MEM%</span>
            <span>USER</span>
            <span>ACTION</span>
          </div>
          {processes.map((process) => (
            <div key={process.pid} className="process-row">
              <span>{process.pid}</span>
              <span>{process.name}</span>
              <span>{process.cpu}%</span>
              <span>{process.memory}%</span>
              <span>{process.user}</span>
              <button
                onClick={() => killProcess(process.pid)}
                className="kill-btn"
              >
                KILL
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Scans */}
      <div className="scans-section">
        <h5>NETWORK SCANS</h5>
        <div className="scans-list">
          {activeScans.map((scan) => (
            <div key={scan.id} className="scan-item">
              <div className="scan-info">
                <div className="scan-target">{scan.target}</div>
                <div className="scan-type">{scan.type.toUpperCase()}</div>
                <div className="scan-status">{scan.status}</div>
              </div>
              <div className="scan-results">
                Open ports: {scan.results?.ports?.filter((p: any) => p.state === 'open').length || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div className="files-section">
        <h5>FILE SYSTEM</h5>
        <div className="file-upload">
          <button
            onClick={() => uploadFile('exploit.py', '#!/usr/bin/env python3\n# Exploit code here\nprint("Exploit ready")')}
            className="upload-btn"
          >
            UPLOAD EXPLOIT
          </button>
          <button
            onClick={() => uploadFile('payload.sh', '#!/bin/bash\necho "Payload executed"')}
            className="upload-btn"
          >
            UPLOAD PAYLOAD
          </button>
        </div>
        <div className="files-list">
          {files.map((file) => (
            <div key={file.id} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{file.size} bytes</span>
              <span className="file-type">{file.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComputerInterface;
