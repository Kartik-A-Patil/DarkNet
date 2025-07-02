// Process Manager System Types
export type ProcessStatus = 'running' | 'sleeping' | 'stopped' | 'zombie' | 'waiting' | 'starting';
export type ProcessPrivilege = 'user' | 'admin' | 'system';
export type ProcessType = 'app' | 'tab' | 'terminal' | 'subprocess' | 'service' | 'system';

export interface ProcessMemoryInfo {
  address: string;        // Simulated memory address (like 0x7fff5fbff000)
  size: number;          // Memory size in KB
  virtualSize: number;   // Virtual memory size in KB  
  resident: number;      // Resident set size in KB
  shared: number;        // Shared memory in KB
}

export interface ProcessResourceUsage {
  cpuPercent: number;    // CPU usage percentage
  memoryPercent: number; // Memory usage percentage
  ioRead: number;        // Bytes read
  ioWrite: number;       // Bytes written
  networkRx: number;     // Network bytes received
  networkTx: number;     // Network bytes transmitted
}

export interface ProcessNetworkInfo {
  port?: number;         // Allocated port (if network-related)
  connections: Array<{   // Active connections
    localAddress: string;
    remoteAddress: string;
    state: 'LISTEN' | 'ESTABLISHED' | 'CLOSE_WAIT' | 'TIME_WAIT';
  }>;
}

export interface ProcessEnvironment {
  workingDirectory: string;
  environment: Record<string, string>;
  arguments: string[];
  command: string;
}

export interface Process {
  // Core identifiers
  pid: number;           // Process ID
  ppid: number;          // Parent Process ID
  pgid: number;          // Process Group ID
  sid: number;           // Session ID
  
  // Basic info
  name: string;          // Process name
  type: ProcessType;     // Process type
  status: ProcessStatus; // Current status
  
  // Ownership & permissions
  owner: string;         // Process owner (user/system)
  privileges: ProcessPrivilege; // Permission level
  
  // Timing information
  startTime: Date;       // When process started
  cpuTime: number;       // Total CPU time used (ms)
  uptime: number;        // Process uptime in seconds
  
  // Memory management
  memory: ProcessMemoryInfo;
  
  // Resource usage
  resources: ProcessResourceUsage;
  
  // Network (if applicable)
  network?: ProcessNetworkInfo;
  
  // Environment
  environment: ProcessEnvironment;
  
  // Relationship tracking
  children: number[];    // Child process PIDs
  threadCount: number;   // Number of threads
  
  // Special flags
  isHidden: boolean;     // If process tries to hide
  isMalicious: boolean;  // If process is flagged as malicious
  canKill: boolean;      // If process can be killed by user
  
  // Metadata
  icon?: string;         // Process icon
  description?: string;  // Process description
  
  // Performance history (for monitoring)
  history: {
    cpu: number[];
    memory: number[];
    network: number[];
  };
}

export interface ProcessTree {
  process: Process;
  children: ProcessTree[];
  depth: number;
}

export interface ProcessSignal {
  signal: 'SIGTERM' | 'SIGKILL' | 'SIGSTOP' | 'SIGCONT' | 'SIGUSR1' | 'SIGUSR2';
  fromPid: number;
  toPid: number;
  timestamp: Date;
}

export interface ProcessManagerConfig {
  maxProcesses: number;
  pidStart: number;
  pidMax: number;
  memoryBase: string;     // Base memory address
  portRangeStart: number; // User port range start
  portRangeEnd: number;   // User port range end
  historyLength: number;  // How many history points to keep
}

export interface ProcessFilter {
  status?: ProcessStatus[];
  type?: ProcessType[];
  owner?: string[];
  minCpu?: number;
  maxCpu?: number;
  minMemory?: number;
  maxMemory?: number;
  hasNetwork?: boolean;
  searchTerm?: string;
}

export interface ProcessAction {
  type: 'kill' | 'terminate' | 'suspend' | 'resume' | 'nice' | 'signal';
  pid: number;
  signal?: ProcessSignal['signal'];
  priority?: number;
  reason?: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}

// Process Manager Events
export type ProcessEvent = 
  | { type: 'PROCESS_CREATED'; process: Process }
  | { type: 'PROCESS_DESTROYED'; pid: number; exitCode: number }
  | { type: 'PROCESS_STATUS_CHANGED'; pid: number; oldStatus: ProcessStatus; newStatus: ProcessStatus }
  | { type: 'PROCESS_RESOURCE_UPDATE'; pid: number; resources: ProcessResourceUsage }
  | { type: 'PROCESS_ERROR'; pid: number; error: string }
  | { type: 'MALICIOUS_ACTIVITY_DETECTED'; pid: number; activity: string };

export interface ProcessManagerState {
  processes: Map<number, Process>;
  processList: Process[];
  processTree: ProcessTree[];
  runningCount: number;
  totalCpuUsage: number;
  totalMemoryUsage: number;
  availablePorts: Set<number>;
  usedPorts: Map<number, number>; // port -> pid mapping
  nextPid: number;
  systemUptime: number;
}
