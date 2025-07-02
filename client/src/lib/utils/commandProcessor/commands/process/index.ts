import { Command, CommandOptions, CommandResult } from '../../types';
import { processManager } from '../../../../../core/processManager/ProcessManager';
import { Process } from '../../../../../core/processManager/types';

export const ps: Command = {
  name: 'ps',
  description: 'Display running processes',
  usage: 'ps [options]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const showAll = args.includes('-a') || args.includes('--all');
      const showTree = args.includes('-t') || args.includes('--tree');
      const showDetails = args.includes('-l') || args.includes('--long');
      
      const processes = processManager.getProcessList({
        status: showAll ? undefined : ['running']
      });

      let output = '';
      
      if (showTree) {
        const tree = processManager.getProcessTree();
        output = 'PID  PPID TYPE     STATUS   USER     COMMAND\n';
        
        const renderTree = (trees: any[], depth = 0) => {
          for (const { process, children } of trees) {
            const indent = '  '.repeat(depth);
            output += `${process.pid.toString().padEnd(5)}${process.ppid.toString().padEnd(5)}${process.type.padEnd(9)}${process.status.padEnd(9)}${process.owner.padEnd(9)}${indent}${process.name}\n`;
            if (children.length > 0) {
              renderTree(children, depth + 1);
            }
          }
        };
        
        renderTree(tree);
      } else if (showDetails) {
        output = 'PID  PPID TYPE     STATUS   USER     CPU%  MEM%  ADDR          PORT COMMAND\n';
        for (const proc of processes) {
          output += `${proc.pid.toString().padEnd(5)}${proc.ppid.toString().padEnd(5)}${proc.type.padEnd(9)}${proc.status.padEnd(9)}${proc.owner.padEnd(9)}${proc.resources.cpuPercent.toFixed(1).padEnd(6)}${proc.resources.memoryPercent.toFixed(1).padEnd(6)}${proc.memory.address.padEnd(14)}${(proc.network?.port || '-').toString().padEnd(5)}${proc.environment.command}\n`;
        }
      } else {
        output = 'PID  USER     TIME COMMAND\n';
        for (const proc of processes) {
          const uptime = Math.floor(proc.uptime / 60);
          output += `${proc.pid.toString().padEnd(5)}${proc.owner.padEnd(9)}${uptime.toString().padEnd(5)}${proc.name}\n`;
        }
      }
      
      return {
        output,
        error: false
      };
    } catch (error: any) {
      return {
        output: `ps: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const kill: Command = {
  name: 'kill',
  description: 'Terminate a process by PID',
  usage: 'kill [-9] <pid>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      if (args.length === 0) {
        return {
          output: 'kill: missing operand\nUsage: kill [-9] <pid>',
          error: true
        };
      }
      
      const force = args.includes('-9');
      const pidArg = args.find(arg => !arg.startsWith('-'));
      
      if (!pidArg) {
        return {
          output: 'kill: missing process ID',
          error: true
        };
      }
      
      const pid = parseInt(pidArg);
      if (isNaN(pid)) {
        return {
          output: `kill: invalid process ID: ${pidArg}`,
          error: true
        };
      }
      
      const process = processManager.getProcess(pid);
      if (!process) {
        return {
          output: `kill: no such process: ${pid}`,
          error: true
        };
      }
      
      const signal = force ? 'SIGKILL' : 'SIGTERM';
      const success = processManager.killProcess(pid, signal);
      
      if (success) {
        return {
          output: force ? `Process ${pid} killed` : `Process ${pid} terminated`,
          error: false
        };
      } else {
        return {
          output: `kill: failed to kill process ${pid}: Permission denied`,
          error: true
        };
      }
    } catch (error: any) {
      return {
        output: `kill: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const killall: Command = {
  name: 'killall',
  description: 'Kill processes by name',
  usage: 'killall [-9] <name>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      if (args.length === 0) {
        return {
          output: 'killall: missing operand\nUsage: killall [-9] <name>',
          error: true
        };
      }
      
      const force = args.includes('-9');
      const processName = args.find(arg => !arg.startsWith('-'));
      
      if (!processName) {
        return {
          output: 'killall: missing process name',
          error: true
        };
      }
      
      const processes = processManager.getProcessList({
        searchTerm: processName
      });
      
      const matchingProcesses = processes.filter(p => 
        p.name.toLowerCase().includes(processName.toLowerCase())
      );
      
      if (matchingProcesses.length === 0) {
        return {
          output: `killall: no process found matching: ${processName}`,
          error: true
        };
      }
      
      let killed = 0;
      let failed = 0;
      const signal = force ? 'SIGKILL' : 'SIGTERM';
      
      for (const process of matchingProcesses) {
        if (processManager.killProcess(process.pid, signal)) {
          killed++;
        } else {
          failed++;
        }
      }
      
      const result = [];
      if (killed > 0) {
        result.push(`Killed ${killed} process(es) matching '${processName}'`);
      }
      if (failed > 0) {
        result.push(`Failed to kill ${failed} process(es) (permission denied)`);
      }
      
      return {
        output: result.join('\n'),
        error: failed > 0
      };
    } catch (error: any) {
      return {
        output: `killall: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const top: Command = {
  name: 'top',
  description: 'Display and update sorted information about running processes',
  usage: 'top',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const processes = processManager.getProcessList()
        .filter(p => p.status === 'running')
        .sort((a, b) => b.resources.cpuPercent - a.resources.cpuPercent)
        .slice(0, 10);
      
      const systemInfo = processManager.getSystemInfo();
      const uptime = Math.floor(systemInfo.uptime / 60);
      
      let output = `top - uptime ${uptime}m, ${systemInfo.runningProcesses} processes running\n`;
      output += `CPU: ${systemInfo.totalCpuUsage.toFixed(1)}%, Memory: ${systemInfo.totalMemoryUsage.toFixed(1)}%\n\n`;
      output += 'PID  USER     CPU%  MEM%  TIME COMMAND\n';
      
      for (const proc of processes) {
        const time = Math.floor(proc.uptime / 60);
        output += `${proc.pid.toString().padEnd(5)}${proc.owner.padEnd(9)}${proc.resources.cpuPercent.toFixed(1).padEnd(6)}${proc.resources.memoryPercent.toFixed(1).padEnd(6)}${time.toString().padEnd(5)}${proc.name}\n`;
      }
      
      return {
        output,
        error: false
      };
    } catch (error: any) {
      return {
        output: `top: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const pgrep: Command = {
  name: 'pgrep',
  description: 'Look up processes based on name and other attributes',
  usage: 'pgrep [options] <pattern>',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      if (args.length === 0) {
        return {
          output: 'pgrep: missing operand\nUsage: pgrep [options] <pattern>',
          error: true
        };
      }
      
      const pattern = args[args.length - 1];
      const showDetails = args.includes('-l');
      const showCount = args.includes('-c');
      
      const processes = processManager.getProcessList({
        searchTerm: pattern
      });
      
      const matchingProcesses = processes.filter(p => 
        p.name.toLowerCase().includes(pattern.toLowerCase()) ||
        p.environment.command.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (showCount) {
        return {
          output: matchingProcesses.length.toString(),
          error: false
        };
      }
      
      if (matchingProcesses.length === 0) {
        return {
          output: '',
          error: false
        };
      }
      
      let output = '';
      for (const proc of matchingProcesses) {
        if (showDetails) {
          output += `${proc.pid} ${proc.name}\n`;
        } else {
          output += `${proc.pid}\n`;
        }
      }
      
      return {
        output: output.trim(),
        error: false
      };
    } catch (error: any) {
      return {
        output: `pgrep: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const jobs: Command = {
  name: 'jobs',
  description: 'Display active jobs',
  usage: 'jobs',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const processes = processManager.getProcessList({
        type: ['subprocess', 'terminal'],
        owner: ['hackos']
      });
      
      if (processes.length === 0) {
        return {
          output: 'No active jobs',
          error: false
        };
      }
      
      let output = 'JOB  PID   STATUS   COMMAND\n';
      processes.forEach((proc, index) => {
        output += `[${index + 1}]  ${proc.pid.toString().padEnd(6)}${proc.status.padEnd(9)}${proc.environment.command}\n`;
      });
      
      return {
        output,
        error: false
      };
    } catch (error: any) {
      return {
        output: `jobs: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const htop: Command = {
  name: 'htop',
  description: 'Interactive process viewer (simulated)',
  usage: 'htop',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const processes = processManager.getProcessList()
        .sort((a, b) => b.resources.cpuPercent - a.resources.cpuPercent);
      
      const systemInfo = processManager.getSystemInfo();
      
      let output = '================================ HTOP ================================\n';
      output += `Uptime: ${Math.floor(systemInfo.uptime / 60)}m  `;
      output += `Tasks: ${systemInfo.totalProcesses} total, ${systemInfo.runningProcesses} running\n`;
      output += `CPU: ${systemInfo.totalCpuUsage.toFixed(1)}%  `;
      output += `Memory: ${systemInfo.totalMemoryUsage.toFixed(1)}%\n`;
      output += '====================================================================\n';
      output += 'PID  USER     CPU%  MEM%  ADDR          COMMAND\n';
      
      for (const proc of processes.slice(0, 15)) {
        output += `${proc.pid.toString().padEnd(5)}${proc.owner.padEnd(9)}${proc.resources.cpuPercent.toFixed(1).padEnd(6)}${proc.resources.memoryPercent.toFixed(1).padEnd(6)}${proc.memory.address.substring(0, 12).padEnd(14)}${proc.name}\n`;
      }
      
      output += '====================================================================\n';
      output += 'Note: This is a simulated htop view. Use "top" for live updates.\n';
      
      return {
        output,
        error: false
      };
    } catch (error: any) {
      return {
        output: `htop: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const cleanup: Command = {
  name: 'cleanup',
  description: 'Clean up zombie processes',
  usage: 'cleanup',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const cleaned = processManager.cleanupZombieProcesses();
      
      return {
        output: `Cleaned up ${cleaned} zombie processes`,
        error: false
      };
    } catch (error: any) {
      return {
        output: `cleanup: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const pstree: Command = {
  name: 'pstree',
  description: 'Display processes in a tree format',
  usage: 'pstree [options]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const showPids = args.includes('-p') || args.includes('--pids');
      const showThreads = args.includes('-t') || args.includes('--threads');
      
      const tree = processManager.getProcessTree();
      let output = '';
      
      const renderTree = (trees: any[], prefix: string = '', isLast: boolean = true) => {
        trees.forEach((treeNode, index) => {
          const { process } = treeNode;
          const isLastChild = index === trees.length - 1;
          const connector = isLastChild ? '└── ' : '├── ';
          const pidInfo = showPids ? ` (${process.pid})` : '';
          const threadInfo = showThreads ? ` [${process.threadCount}]` : '';
          
          output += `${prefix}${connector}${process.name}${pidInfo}${threadInfo}\n`;
          
          if (treeNode.children.length > 0) {
            const newPrefix = prefix + (isLastChild ? '    ' : '│   ');
            renderTree(treeNode.children, newPrefix, isLastChild);
          }
        });
      };
      
      renderTree(tree);
      
      return {
        output: output || 'No processes found',
        error: false
      };
    } catch (error: any) {
      return {
        output: `pstree: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const pstat: Command = {
  name: 'pstat',
  description: 'Show process statistics',
  usage: 'pstat',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const stats = processManager.getProcessStatistics();
      
      let output = 'Process Statistics:\n';
      output += `Total processes: ${stats.total}\n`;
      output += `Malicious processes: ${stats.malicious}\n`;
      output += `Zombie processes: ${stats.zombies}\n`;
      output += `Hidden processes: ${stats.hidden}\n`;
      output += `Average CPU usage: ${stats.avgCpu.toFixed(2)}%\n`;
      output += `Average memory usage: ${stats.avgMemory.toFixed(2)}%\n`;
      output += `Total network RX: ${stats.totalNetworkRx} bytes\n`;
      output += `Total network TX: ${stats.totalNetworkTx} bytes\n\n`;
      
      output += 'By Status:\n';
      Object.entries(stats.byStatus).forEach(([status, count]) => {
        output += `  ${status}: ${count}\n`;
      });
      
      output += '\nBy Type:\n';
      Object.entries(stats.byType).forEach(([type, count]) => {
        output += `  ${type}: ${count}\n`;
      });
      
      output += '\nBy Owner:\n';
      Object.entries(stats.byOwner).forEach(([owner, count]) => {
        output += `  ${owner}: ${count}\n`;
      });
      
      return {
        output,
        error: false
      };
    } catch (error: any) {
      return {
        output: `pstat: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const malware: Command = {
  name: 'malware',
  description: 'Simulate malicious process activity (for testing)',
  usage: 'malware [pid]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      let targetPid: number | undefined;
      
      if (args.length > 0) {
        targetPid = parseInt(args[0]);
        if (isNaN(targetPid)) {
          return {
            output: `malware: invalid process ID: ${args[0]}`,
            error: true
          };
        }
      }
      
      processManager.simulateMaliciousActivity(targetPid);
      
      return {
        output: targetPid 
          ? `Simulated malicious activity in process ${targetPid}` 
          : 'Simulated malicious activity in random process',
        error: false
      };
    } catch (error: any) {
      return {
        output: `malware: error: ${error.message}`,
        error: true
      };
    }
  }
};

export const crash: Command = {
  name: 'crash',
  description: 'Simulate process crash (for testing)',
  usage: 'crash <pid> [reason]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      if (args.length === 0) {
        return {
          output: 'crash: missing operand\nUsage: crash <pid> [reason]',
          error: true
        };
      }
      
      const pid = parseInt(args[0]);
      if (isNaN(pid)) {
        return {
          output: `crash: invalid process ID: ${args[0]}`,
          error: true
        };
      }
      
      const reason = args.slice(1).join(' ') || 'Simulated crash';
      
      const process = processManager.getProcess(pid);
      if (!process) {
        return {
          output: `crash: no such process: ${pid}`,
          error: true
        };
      }
      
      processManager.simulateProcessCrash(pid, reason);
      
      return {
        output: `Process ${pid} (${process.name}) crashed: ${reason}`,
        error: false
      };
    } catch (error: any) {
      return {
        output: `crash: error: ${error.message}`,
        error: true
      };
    }
  }
};
