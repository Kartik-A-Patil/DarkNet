import { 
  Process, 
  ProcessStatus, 
  ProcessType, 
  ProcessPrivilege, 
  ProcessEvent, 
  ProcessAction,
  ProcessFilter,
  ProcessTree,
  ProcessSignal,
  ProcessManagerConfig,
  ProcessManagerState,
  ProcessMemoryInfo,
  ProcessResourceUsage,
  ProcessNetworkInfo,
  ProcessEnvironment
} from './types';

export class ProcessManager {
  private state: ProcessManagerState;
  private config: ProcessManagerConfig;
  private eventListeners: Map<string, Function[]> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private memoryCounter = 0x7fff5fbff000; // Starting memory address

  constructor(config?: Partial<ProcessManagerConfig>) {
    this.config = {
      maxProcesses: 1000,
      pidStart: 1000,
      pidMax: 65535,
      memoryBase: '0x7fff5fbff000',
      portRangeStart: 901,
      portRangeEnd: 1023,
      historyLength: 60,
      ...config
    };

    this.state = {
      processes: new Map(),
      processList: [],
      processTree: [],
      runningCount: 0,
      totalCpuUsage: 0,
      totalMemoryUsage: 0,
      availablePorts: new Set(),
      usedPorts: new Map(),
      nextPid: this.config.pidStart,
      systemUptime: 0
    };

    this.initializePorts();
    this.initializeSystemProcesses();
    this.startPerformanceMonitoring();
  }

  private initializePorts(): void {
    for (let port = this.config.portRangeStart; port <= this.config.portRangeEnd; port++) {
      this.state.availablePorts.add(port);
    }
  }

  private initializeSystemProcesses(): void {
    // Create essential system processes
    const systemProcesses = [
      {
        name: 'kernel',
        type: 'system' as ProcessType,
        owner: 'system',
        privileges: 'system' as ProcessPrivilege,
        command: '[kernel]',
        canKill: false,
        isHidden: false
      },
      {
        name: 'init',
        type: 'system' as ProcessType,
        owner: 'root',
        privileges: 'system' as ProcessPrivilege,
        command: '/sbin/init',
        canKill: false,
        isHidden: false
      },
      {
        name: 'kthreadd',
        type: 'system' as ProcessType,
        owner: 'root',
        privileges: 'system' as ProcessPrivilege,
        command: '[kthreadd]',
        canKill: false,
        isHidden: false
      },
      {
        name: 'NetworkManager',
        type: 'service' as ProcessType,
        owner: 'root',
        privileges: 'admin' as ProcessPrivilege,
        command: '/usr/sbin/NetworkManager --no-daemon',
        canKill: false,
        isHidden: false
      },
      {
        name: 'ssh-agent',
        type: 'service' as ProcessType,
        owner: 'hackos',
        privileges: 'user' as ProcessPrivilege,
        command: '/usr/bin/ssh-agent',
        canKill: true,
        isHidden: false
      }
    ];

    systemProcesses.forEach((procData, index) => {
      const proc = this.createSystemProcess(
        procData.name,
        procData.type,
        procData.owner,
        procData.privileges,
        procData.command
      );
      proc.canKill = procData.canKill;
      proc.isHidden = procData.isHidden;
      proc.pid = index + 1; // System processes get low PIDs
    });
  }

  private generateMemoryAddress(): string {
    const address = this.memoryCounter.toString(16);
    this.memoryCounter += Math.floor(Math.random() * 0x1000) + 0x1000; // Random jump
    return `0x${address}`;
  }

  private generatePid(): number {
    let pid = this.state.nextPid;
    while (this.state.processes.has(pid) && pid < this.config.pidMax) {
      pid++;
    }
    
    if (pid >= this.config.pidMax) {
      // Wrap around, find first available
      for (let i = this.config.pidStart; i < this.config.pidMax; i++) {
        if (!this.state.processes.has(i)) {
          pid = i;
          break;
        }
      }
    }
    
    this.state.nextPid = pid + 1;
    return pid;
  }

  private allocatePort(): number | null {
    if (this.state.availablePorts.size === 0) return null;
    
    const port = Array.from(this.state.availablePorts)[0];
    this.state.availablePorts.delete(port);
    return port;
  }

  private releasePort(port: number): void {
    this.state.usedPorts.delete(port);
    this.state.availablePorts.add(port);
  }

  // Core process management
  public createProcess(
    name: string,
    type: ProcessType,
    owner: string = 'hackos',
    privileges: ProcessPrivilege = 'user',
    command: string = '',
    parentPid?: number,
    needsNetwork: boolean = false
  ): Process {
    const pid = this.generatePid();
    const parent = parentPid ? this.state.processes.get(parentPid) : null;
    
    // Allocate network port if needed
    let networkInfo: ProcessNetworkInfo | undefined = undefined;
    if (needsNetwork) {
      const port = this.allocatePort();
      if (port) {
        networkInfo = {
          port,
          connections: []
        };
        this.state.usedPorts.set(port, pid);
      }
    }

    const process: Process = {
      // Core identifiers
      pid,
      ppid: parentPid || (parent ? parent.pid : 1),
      pgid: parent ? parent.pgid : pid,
      sid: parent ? parent.sid : pid,
      
      // Basic info
      name,
      type,
      status: 'starting',
      
      // Ownership & permissions
      owner,
      privileges,
      
      // Timing
      startTime: new Date(),
      cpuTime: 0,
      uptime: 0,
      
      // Memory
      memory: {
        address: this.generateMemoryAddress(),
        size: Math.floor(Math.random() * 100000) + 1024, // 1MB to 100MB
        virtualSize: Math.floor(Math.random() * 500000) + 10240,
        resident: Math.floor(Math.random() * 50000) + 512,
        shared: Math.floor(Math.random() * 10000) + 128
      },
      
      // Resources
      resources: {
        cpuPercent: 0,
        memoryPercent: 0,
        ioRead: 0,
        ioWrite: 0,
        networkRx: 0,
        networkTx: 0
      },
      
      // Network
      network: networkInfo,
      
      // Environment
      environment: {
        workingDirectory: parent?.environment.workingDirectory || '/home/hackos',
        environment: {
          'USER': owner,
          'HOME': owner === 'root' ? '/root' : `/home/${owner}`,
          'PATH': '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
          'SHELL': '/bin/bash',
          'TERM': 'xterm-256color'
        },
        arguments: command.split(' '),
        command
      },
      
      // Relationships
      children: [],
      threadCount: 1,
      
      // Flags
      isHidden: false,
      isMalicious: false,
      canKill: privileges !== 'system',
      
      // UI
      icon: this.getProcessIcon(type, name),
      description: this.getProcessDescription(name, type),
      
      // History
      history: {
        cpu: [],
        memory: [],
        network: []
      }
    };

    // Add to parent's children
    if (parent) {
      parent.children.push(pid);
    }

    // Store process
    this.state.processes.set(pid, process);
    this.updateProcessList();

    // Start process (simulate startup time)
    setTimeout(() => {
      if (this.state.processes.has(pid)) {
        process.status = 'running';
        this.emit('PROCESS_CREATED', { process });
      }
    }, Math.random() * 2000 + 500);

    return process;
  }

  private createSystemProcess(
    name: string,
    type: ProcessType,
    owner: string,
    privileges: ProcessPrivilege,
    command: string
  ): Process {
    return this.createProcess(name, type, owner, privileges, command, undefined, false);
  }

  public createAppProcess(
    appName: string,
    windowId?: string,
    needsNetwork: boolean = false
  ): Process {
    return this.createProcess(
      appName,
      'app',
      'hackos',
      'user',
      `/usr/bin/${appName.toLowerCase()}`,
      undefined,
      needsNetwork
    );
  }

  public createTabProcess(
    tabTitle: string,
    browserPid: number,
    url?: string
  ): Process {
    const command = url ? `tab: ${url}` : 'tab: about:blank';
    return this.createProcess(
      `${tabTitle} - Tab`,
      'tab',
      'hackos',
      'user',
      command,
      browserPid,
      true // Tabs often need network
    );
  }

  public createTerminalCommandProcess(
    command: string,
    terminalPid: number,
    needsNetwork: boolean = false
  ): Process {
    const processName = command.split(' ')[0];
    return this.createProcess(
      processName,
      'terminal',
      'hackos',
      'user',
      command,
      terminalPid,
      needsNetwork
    );
  }

  public createServiceProcess(
    serviceName: string,
    owner: string = 'root',
    needsNetwork: boolean = true
  ): Process {
    return this.createProcess(
      serviceName,
      'service',
      owner,
      owner === 'root' ? 'admin' : 'user',
      `/usr/sbin/${serviceName}`,
      1, // Parent is init
      needsNetwork
    );
  }

  // Advanced process management features
  public createZombieProcess(pid: number): void {
    const process = this.state.processes.get(pid);
    if (process && process.status !== 'zombie') {
      process.status = 'zombie';
      process.resources.cpuPercent = 0;
      process.resources.memoryPercent = 0;
      this.emit('PROCESS_ZOMBIFIED', { pid });
    }
  }

  public cleanupZombieProcesses(): number {
    const zombies = Array.from(this.state.processes.values()).filter(p => p.status === 'zombie');
    zombies.forEach(zombie => {
      this.destroyProcess(zombie.pid, 0);
    });
    return zombies.length;
  }

  public simulateMaliciousActivity(pid?: number): void {
    // If no PID specified, pick a random user process
    let targetPid = pid;
    if (!targetPid) {
      const userProcesses = Array.from(this.state.processes.values())
        .filter(p => p.owner === 'hackos' && p.type === 'app');
      if (userProcesses.length > 0) {
        const randomProc = userProcesses[Math.floor(Math.random() * userProcesses.length)];
        targetPid = randomProc.pid;
      }
    }

    if (targetPid) {
      const activities = [
        'Unauthorized network connections',
        'Suspicious file access patterns',
        'Excessive CPU usage spike',
        'Memory corruption attempt',
        'Privilege escalation attempt',
        'Keylogger activity detected',
        'Unauthorized system calls'
      ];
      
      const activity = activities[Math.floor(Math.random() * activities.length)];
      this.flagAsMalicious(targetPid, activity);
    }
  }

  public getProcessAncestry(pid: number): Process[] {
    const ancestry: Process[] = [];
    let currentPid = pid;
    
    while (currentPid && currentPid !== 1) {
      const process = this.state.processes.get(currentPid);
      if (!process) break;
      
      ancestry.unshift(process);
      currentPid = process.ppid;
      
      // Prevent infinite loops
      if (ancestry.length > 20) break;
    }
    
    return ancestry;
  }

  public getProcessDescendants(pid: number): Process[] {
    const descendants: Process[] = [];
    const visited = new Set<number>();
    
    const traverse = (currentPid: number) => {
      if (visited.has(currentPid)) return;
      visited.add(currentPid);
      
      const process = this.state.processes.get(currentPid);
      if (!process) return;
      
      process.children.forEach(childPid => {
        const child = this.state.processes.get(childPid);
        if (child) {
          descendants.push(child);
          traverse(childPid);
        }
      });
    };
    
    traverse(pid);
    return descendants;
  }

  public getResourceHeavyProcesses(threshold: { cpu?: number; memory?: number }): Process[] {
    return Array.from(this.state.processes.values()).filter(process => {
      const exceedsCpu = threshold.cpu ? process.resources.cpuPercent > threshold.cpu : false;
      const exceedsMemory = threshold.memory ? process.resources.memoryPercent > threshold.memory : false;
      return exceedsCpu || exceedsMemory;
    });
  }

  public simulateProcessCrash(pid: number, reason: string = 'Segmentation fault'): void {
    const process = this.state.processes.get(pid);
    if (process && process.status === 'running') {
      // Sometimes crashed processes become zombies instead of being cleaned up
      if (Math.random() < 0.3) {
        this.createZombieProcess(pid);
      } else {
        this.destroyProcess(pid, 11); // SIGSEGV exit code
      }
      
      this.emit('PROCESS_CRASHED', { pid, reason });
    }
  }

  public getProcessStatistics() {
    const processes = Array.from(this.state.processes.values());
    const stats = {
      total: processes.length,
      byStatus: {} as Record<ProcessStatus, number>,
      byType: {} as Record<ProcessType, number>,
      byOwner: {} as Record<string, number>,
      malicious: processes.filter(p => p.isMalicious).length,
      zombies: processes.filter(p => p.status === 'zombie').length,
      hidden: processes.filter(p => p.isHidden).length,
      avgCpu: processes.length > 0 ? processes.reduce((sum, p) => sum + p.resources.cpuPercent, 0) / processes.length : 0,
      avgMemory: processes.length > 0 ? processes.reduce((sum, p) => sum + p.resources.memoryPercent, 0) / processes.length : 0,
      totalNetworkRx: processes.reduce((sum, p) => sum + p.resources.networkRx, 0),
      totalNetworkTx: processes.reduce((sum, p) => sum + p.resources.networkTx, 0)
    };

    // Count by status
    processes.forEach(p => {
      stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
      stats.byType[p.type] = (stats.byType[p.type] || 0) + 1;
      stats.byOwner[p.owner] = (stats.byOwner[p.owner] || 0) + 1;
    });

    return stats;
  }

  // Process control
  public killProcess(pid: number, signal: ProcessSignal['signal'] = 'SIGTERM'): boolean {
    const process = this.state.processes.get(pid);
    if (!process) return false;

    // Check permissions
    if (!this.canControlProcess(pid)) {
      this.emit('PROCESS_ERROR', { pid, error: 'Permission denied' });
      return false;
    }

    // System processes can't be killed
    if (!process.canKill) {
      this.emit('PROCESS_ERROR', { pid, error: 'Cannot kill system process' });
      return false;
    }

    const action: ProcessAction = {
      type: 'kill',
      pid,
      signal,
      timestamp: new Date(),
      success: true
    };

    if (signal === 'SIGKILL' || signal === 'SIGTERM') {
      this.destroyProcess(pid, 0);
    } else if (signal === 'SIGSTOP') {
      process.status = 'stopped';
      this.emit('PROCESS_STATUS_CHANGED', { 
        pid, 
        oldStatus: 'running', 
        newStatus: 'stopped' 
      });
    } else if (signal === 'SIGCONT') {
      process.status = 'running';
      this.emit('PROCESS_STATUS_CHANGED', { 
        pid, 
        oldStatus: 'stopped', 
        newStatus: 'running' 
      });
    }

    return true;
  }

  public suspendProcess(pid: number): boolean {
    return this.killProcess(pid, 'SIGSTOP');
  }

  public resumeProcess(pid: number): boolean {
    return this.killProcess(pid, 'SIGCONT');
  }

  private destroyProcess(pid: number, exitCode: number): void {
    const process = this.state.processes.get(pid);
    if (!process) return;

    // Kill all children first
    [...process.children].forEach(childPid => {
      this.destroyProcess(childPid, 1);
    });

    // Remove from parent's children
    if (process.ppid !== pid) {
      const parent = this.state.processes.get(process.ppid);
      if (parent) {
        parent.children = parent.children.filter(childPid => childPid !== pid);
      }
    }

    // Release network port
    if (process.network?.port) {
      this.releasePort(process.network.port);
    }

    // Remove process
    this.state.processes.delete(pid);
    this.updateProcessList();

    this.emit('PROCESS_DESTROYED', { pid, exitCode });
  }

  private canControlProcess(pid: number): boolean {
    const process = this.state.processes.get(pid);
    if (!process) return false;

    // System processes can't be controlled by regular users
    if (process.privileges === 'system') return false;
    
    // Admin processes require elevated privileges
    if (process.privileges === 'admin') {
      // TODO: Check if user has sudo/admin privileges
      return true; // For now, allow it
    }

    return true;
  }

  // Process querying
  public getProcess(pid: number): Process | undefined {
    return this.state.processes.get(pid);
  }

  public getProcessList(filter?: ProcessFilter): Process[] {
    let processes = Array.from(this.state.processes.values());

    if (filter) {
      processes = processes.filter(proc => {
        if (filter.status && !filter.status.includes(proc.status)) return false;
        if (filter.type && !filter.type.includes(proc.type)) return false;
        if (filter.owner && !filter.owner.includes(proc.owner)) return false;
        if (filter.minCpu && proc.resources.cpuPercent < filter.minCpu) return false;
        if (filter.maxCpu && proc.resources.cpuPercent > filter.maxCpu) return false;
        if (filter.minMemory && proc.resources.memoryPercent < filter.minMemory) return false;
        if (filter.maxMemory && proc.resources.memoryPercent > filter.maxMemory) return false;
        if (filter.hasNetwork !== undefined && !!proc.network !== filter.hasNetwork) return false;
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          return proc.name.toLowerCase().includes(term) ||
                 proc.environment.command.toLowerCase().includes(term) ||
                 proc.owner.toLowerCase().includes(term);
        }
        return true;
      });
    }

    return processes.sort((a, b) => a.pid - b.pid);
  }

  public getProcessTree(): ProcessTree[] {
    const roots: ProcessTree[] = [];
    const processed = new Set<number>();

    const buildTree = (pid: number, depth: number = 0): ProcessTree | null => {
      if (processed.has(pid)) return null;
      
      const process = this.state.processes.get(pid);
      if (!process || process.isHidden) return null;

      processed.add(pid);

      const children = process.children
        .map(childPid => buildTree(childPid, depth + 1))
        .filter(child => child !== null) as ProcessTree[];

      return {
        process,
        children,
        depth
      };
    };

    // Find root processes (ppid === pid or ppid not in our process list)
    Array.from(this.state.processes.values()).forEach(process => {
      if (process.ppid === process.pid || !this.state.processes.has(process.ppid)) {
        const tree = buildTree(process.pid);
        if (tree) roots.push(tree);
      }
    });

    return roots;
  }

  // System information
  public getSystemInfo() {
    const processesArray = Array.from(this.state.processes.values());
    return {
      totalProcesses: this.state.processes.size,
      runningProcesses: processesArray.filter(p => p.status === 'running').length,
      totalCpuUsage: this.state.totalCpuUsage,
      totalMemoryUsage: this.state.totalMemoryUsage,
      availablePorts: this.state.availablePorts.size,
      usedPorts: this.state.usedPorts.size,
      uptime: this.state.systemUptime
    };
  }

  // Network management
  public getProcessByPort(port: number): Process | undefined {
    const pid = this.state.usedPorts.get(port);
    return pid ? this.state.processes.get(pid) : undefined;
  }

  public getNetworkProcesses(): Process[] {
    return Array.from(this.state.processes.values()).filter(p => p.network?.port);
  }

  // Performance monitoring
  private startPerformanceMonitoring(): void {
    this.updateInterval = setInterval(() => {
      this.updateProcessMetrics();
      this.updateSystemMetrics();
      this.state.systemUptime++;
    }, 1000);
  }

  private updateProcessMetrics(): void {
    Array.from(this.state.processes.values()).forEach(process => {
      if (process.status === 'running') {
        // Simulate CPU usage
        const baseCpu = this.getBaseCpuUsage(process.type);
        process.resources.cpuPercent = Math.max(0, Math.min(100, 
          baseCpu + (Math.random() - 0.5) * 10
        ));

        // Simulate memory usage
        const baseMemory = this.getBaseMemoryUsage(process.type);
        process.resources.memoryPercent = Math.max(0, Math.min(100,
          baseMemory + (Math.random() - 0.5) * 5
        ));

        // Network activity for network processes
        if (process.network?.port) {
          process.resources.networkRx += Math.floor(Math.random() * 1000);
          process.resources.networkTx += Math.floor(Math.random() * 500);
        }

        // Update history
        process.history.cpu.push(process.resources.cpuPercent);
        process.history.memory.push(process.resources.memoryPercent);
        process.history.network.push(process.resources.networkRx + process.resources.networkTx);

        // Trim history
        if (process.history.cpu.length > this.config.historyLength) {
          process.history.cpu.shift();
          process.history.memory.shift();
          process.history.network.shift();
        }

        // Update uptime
        process.uptime++;
        process.cpuTime += process.resources.cpuPercent * 10; // Approximate CPU time
      }
    });

    this.updateProcessList();
  }

  private updateSystemMetrics(): void {
    const runningProcesses = Array.from(this.state.processes.values()).filter(p => p.status === 'running');
    
    this.state.totalCpuUsage = runningProcesses.reduce((sum, p) => sum + p.resources.cpuPercent, 0);
    this.state.totalMemoryUsage = runningProcesses.reduce((sum, p) => sum + p.resources.memoryPercent, 0);
    this.state.runningCount = runningProcesses.length;
  }

  private updateProcessList(): void {
    this.state.processList = Array.from(this.state.processes.values());
    this.state.processTree = this.getProcessTree();
  }

  private getBaseCpuUsage(type: ProcessType): number {
    switch (type) {
      case 'system': return 0.1;
      case 'service': return 0.5;
      case 'app': return 5.0;
      case 'tab': return 2.0;
      case 'terminal': return 1.0;
      case 'subprocess': return 3.0;
      default: return 1.0;
    }
  }

  private getBaseMemoryUsage(type: ProcessType): number {
    switch (type) {
      case 'system': return 0.5;
      case 'service': return 2.0;
      case 'app': return 8.0;
      case 'tab': return 5.0;
      case 'terminal': return 3.0;
      case 'subprocess': return 2.0;
      default: return 2.0;
    }
  }

  private getProcessIcon(type: ProcessType, name: string): string {
    const iconMap: Record<ProcessType, string> = {
      'system': 'fa-cog',
      'service': 'fa-server',
      'app': 'fa-window-maximize',
      'tab': 'fa-globe',
      'terminal': 'fa-terminal',
      'subprocess': 'fa-code-branch'
    };

    // Special cases
    if (name.includes('browser') || name.includes('firefox')) return 'fa-firefox';
    if (name.includes('terminal')) return 'fa-terminal';
    if (name.includes('file')) return 'fa-folder';
    
    return iconMap[type] || 'fa-circle';
  }

  private getProcessDescription(name: string, type: ProcessType): string {
    if (type === 'system') return `System process: ${name}`;
    if (type === 'service') return `Service: ${name}`;
    if (type === 'app') return `Application: ${name}`;
    if (type === 'tab') return `Browser tab: ${name}`;
    if (type === 'terminal') return `Terminal command: ${name}`;
    if (type === 'subprocess') return `Subprocess: ${name}`;
    return `Process: ${name}`;
  }

  // Malicious process detection
  public flagAsMalicious(pid: number, reason: string): void {
    const process = this.state.processes.get(pid);
    if (process) {
      process.isMalicious = true;
      this.emit('MALICIOUS_ACTIVITY_DETECTED', { pid, activity: reason });
    }
  }

  public hideProcess(pid: number): void {
    const process = this.state.processes.get(pid);
    if (process) {
      process.isHidden = true;
      this.updateProcessList();
    }
  }

  public unhideProcess(pid: number): void {
    const process = this.state.processes.get(pid);
    if (process) {
      process.isHidden = false;
      this.updateProcessList();
    }
  }

  // Event system
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(type: string, data: any): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Cleanup
  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.eventListeners.clear();
  }

  // State access for external components
  public getState(): ProcessManagerState {
    return { ...this.state };
  }
}

// Singleton instance
export const processManager = new ProcessManager();
export default processManager;
