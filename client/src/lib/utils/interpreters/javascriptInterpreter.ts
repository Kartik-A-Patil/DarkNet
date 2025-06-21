import { Interpreter } from './base';
import { InterpreterResult } from './types';

// JavaScript Interpreter using a browser-compatible sandbox
export class JavaScriptInterpreter extends Interpreter {
  constructor() {
    super('node');
  }
  
  async execute(code: string, args: string[]): Promise<InterpreterResult> {
    try {
      // Check for malicious code patterns before execution
      if (this.containsDangerousCode(code)) {
        return {
          output: "Error: Potentially unsafe code detected. Operation aborted.",
          error: true,
          exitCode: 1
        };
      }

      // Create a sandbox using iframe or Function constructor with proper sanitization
      let output = '';
      const consoleMock = {
        log: (...args: any[]) => {
          args.forEach(arg => {
            if (typeof arg === 'object') {
              try {
                output += JSON.stringify(arg, null, 2) + '\n';
              } catch (e) {
                output += `[Object]\n`;
              }
            } else {
              output += arg + '\n';
            }
          });
        },
        error: (...args: any[]) => {
          args.forEach(arg => {
            if (typeof arg === 'object') {
              try {
                output += `Error: ${JSON.stringify(arg, null, 2)}\n`;
              } catch (e) {
                output += `Error: [Object]\n`;
              }
            } else {
              output += `Error: ${arg}\n`;
            }
          });
        },
        warn: (...args: any[]) => {
          args.forEach(arg => {
            if (typeof arg === 'object') {
              try {
                output += `Warning: ${JSON.stringify(arg, null, 2)}\n`;
              } catch (e) {
                output += `Warning: [Object]\n`;
              }
            } else {
              output += `Warning: ${arg}\n`;
            }
          });
        }
      };

      const safeArgs = args.map(arg => this.sanitizeInput(arg));
      const processObj = {
        argv: ['node', 'script.js', ...safeArgs],
        env: {}
      };
      
      // Add circuit breaker for CPU-intensive operations
      const cpuBreaker = `
        // Add circuit breaker for infinite loops
        let _loopCounter = 0;
        const MAX_ITERATIONS = 1000000;
        function checkLoopBreaker() {
          if (++_loopCounter > MAX_ITERATIONS) {
            throw new Error('Script execution time exceeded (too many iterations)');
          }
        }
      `;
      
      // Inject the circuit breaker into the code
      // Use RegExp to insert loop breakers in for/while statements
      const processedCode = code.replace(/for\s*\([^{]+\{/g, match => `${match} checkLoopBreaker();`)
                                .replace(/while\s*\([^{]+\{/g, match => `${match} checkLoopBreaker();`);
      
      // Create a safe context for execution
      const safeCode = `
        ${cpuBreaker}
        
        // Restrict access to window/document/etc
        const window = undefined;
        const document = undefined;
        const localStorage = undefined;
        const sessionStorage = undefined;
        const navigator = undefined;
        const location = undefined;
        
        try {
          ${processedCode}
        } catch (e) {
          console.error(e.message);
        }
      `;
      
      // Execute the code with a timeout
      const timeoutPromise = new Promise<void>((_resolve, reject) => {
        setTimeout(() => reject(new Error('Script execution timed out after 3000ms')), 3000);
      });
      
      const executionPromise = new Promise<void>((resolve) => {
        try {
          // Create a sandboxed function with only access to console and process
          const sandboxFn = new Function('console', 'process', safeCode);
          sandboxFn(consoleMock, processObj);
          resolve();
        } catch (e: any) {
          consoleMock.error(e.message);
          // Instead of resolving on error, we still resolve but mark the error state
          // This ensures the terminal always gets a response
          resolve();
        }
      });
      
      // Race the execution against the timeout
      try {
        await Promise.race([executionPromise, timeoutPromise]);
      } catch (timeoutErr:any) {
        // Handle timeout separately to ensure we always return a result
        output += `Error: ${timeoutErr.message}\n`;
      }
      
      return {
        output: output || 'Script executed successfully with no output',
        error: output.includes('Error:'),
        exitCode: output.includes('Error:') ? 1 : 0
      };
    } catch (e: any) {
      // Ensure we always return a response, even on unexpected errors
      return {
        output: `Error: ${e.message}`,
        error: true,
        exitCode: 1
      };
    }
  }
  
  private sanitizeInput(input: string): string {
    // Remove potentially dangerous characters from inputs
    return input.replace(/[\\'"]/g, '\\$&');
  }
  
  private containsDangerousCode(code: string): boolean {
    // Check for potentially malicious code patterns
    const dangerousPatterns = [
      /require\s*\(/i,
      /process\.(binding|dlopen|uptime|cpuUsage|memoryUsage|resourceUsage|kill|exit)/i,
      /child_process/i,
      /fs\./i,
      /path\./i,
      /net\./i,
      /http[s]?\./i,
      /crypto\./i,
      /os\./i,
      /(Function|eval|setTimeout|setInterval)\s*\(\s*['"`]/i,
      /WebAssembly/i,
      /constructor\.constructor/i,
      /\["constructor"\]\["constructor"\]/i,
      /\['constructor'\]\['constructor'\]/i,
      /fetch\s*\(/i,
      /XMLHttpRequest/i,
      /while\s*\(\s*true\s*\)/i,
      /for\s*\(\s*;;\s*\)/i,
      /Proxy\s*\(/i,
      /Buffer\./i,
      /document\./i,
      /window\./i,
      /localStorage/i,
      /sessionStorage/i,
      /navigator\./i,
      /location\./i
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(code));
  }
}
