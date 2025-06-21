import { Interpreter } from './base';
import { InterpreterResult } from './types';

// Python Interpreter using Pyodide
export class PythonInterpreter extends Interpreter {
  private pyodide: any = null;
  private isLoading = false;
  private loadError: Error | null = null;

  constructor() {
    super('python3');
  }
  
  private async loadPyodide() {
    if (this.pyodide) return this.pyodide;
    if (this.loadError) throw this.loadError;
    
    if (!this.isLoading) {
      this.isLoading = true;
      try {
        // Dynamically import Pyodide
        const pyodideModule = await import('pyodide');
        
        this.pyodide = await pyodideModule.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/"
          // Don't specify stderr handler to avoid the WebAssembly error
          // We'll capture stderr ourselves using StringIO
        });
        
        return this.pyodide;
      } catch (e: any) {
        this.loadError = e;
        throw e;
      } finally {
        this.isLoading = false;
      }
    }
    
    // Wait until the loading is complete
    return new Promise<any>((resolve, reject) => {
      const checkPyodide = () => {
        if (this.pyodide) resolve(this.pyodide);
        else if (this.loadError) reject(this.loadError);
        else setTimeout(checkPyodide, 100);
      };
      checkPyodide();
    });
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

      const pyodide = await this.loadPyodide();
      
      // Set up sys.argv
      await pyodide.runPythonAsync(`
        import sys
        import io
        
        # Redirect stdout and stderr
        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()
        
        sys.argv = ['script.py', ${args.map(arg => `'${this.sanitizeInput(arg)}'`).join(', ')}]
      `);
      
      // Set up a safe execution environment with whitelisted modules
      await pyodide.runPythonAsync(`
        # Create a list of allowed modules
        ALLOWED_MODULES = {
          'math', 'random', 'time', 'datetime', 'collections', 
          'itertools', 'functools', 'operator', 're', 'json',
          'base64', 'hashlib', 'sys', 'io'
        }
        
        # Create a safe import function
        original_import = __import__
        
        def safe_import(name, *args, **kwargs):
            if name not in ALLOWED_MODULES:
                raise ImportError(f"Import of '{name}' is not allowed for security reasons")
            return original_import(name, *args, **kwargs)
        
        # Replace the built-in __import__ function with our safe version
        __builtins__.__import__ = safe_import
      `);
      
      let stdout = '';
      let stderr = '';
      
      // Add a timeout mechanism for Python execution
      const timeoutPromise = new Promise<void>((_resolve, reject) => {
        setTimeout(() => reject(new Error("Execution timed out after 5000ms")), 5000);
      });
      
      // Wrap the Python execution in a promise that always resolves
      const executionPromise = new Promise<void>(async (resolve) => {
        try {
          await pyodide.runPythonAsync(code);
          
          // Get the output from stdout and stderr
          stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()");
          stderr = await pyodide.runPythonAsync("sys.stderr.getvalue()");
          
          // Reset the safe import to avoid leaking between executions
          await pyodide.runPythonAsync("__builtins__.__import__ = original_import");
        } catch (e: any) {
          try {
            // Try to get any output that was generated before the error
            stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()").catch(() => '');
            stderr = await pyodide.runPythonAsync("sys.stderr.getvalue()").catch(() => '');
            stderr += `\nError: ${e.message}`;
          } catch (innerError) {
            stderr = `Error: ${e.message}`;
          }
          
          // Reset the safe import even on error
          await pyodide.runPythonAsync("__builtins__.__import__ = original_import").catch(() => {});
        }
        
        resolve();
      });
      
      // Race the execution against the timeout
      try {
        await Promise.race([executionPromise, timeoutPromise]);
      } catch (timeoutErr:any) {
        // Handle timeout separately
        stderr += `\nError: ${timeoutErr.message}`;
      }
      
      // Build the final output
      let output = stdout || '';
      if (stderr) {
        output += '\n' + stderr;
      }
      
      return {
        output: output || 'Script executed successfully with no output',
        error: stderr.length > 0,
        exitCode: stderr.length > 0 ? 1 : 0
      };
    } catch (e: any) {
      return {
        output: `Failed to initialize Pyodide: ${e.message}`,
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
      /import\s+(os|subprocess|sys\.path|shutil|pty|fcntl|socket|asyncio|urllib|http)/i,
      /eval\s*\(/i,
      /exec\s*\(/i,
      /globals\(\)\.update/i,
      /locals\(\)\.update/i,
      /__import__\s*\(/i,
      /open\s*\(/i,
      /sys\._getframe/i,
      /sys\.modules/i,
      // Add additional patterns for browser-specific exploits
      /pyodide\._module/i,
      /self\.constructor/i,
      /importlib/i,
      /inspect/i,
      /js\.document/i,
      /js\.window/i,
      /js\.navigator/i,
      /js\.localStorage/i
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(code));
  }
}
