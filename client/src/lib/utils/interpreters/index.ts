export * from './types';
export * from './base';
export * from './javascriptInterpreter';
export * from './pythonInterpreter';

import { Interpreter } from './base';
import { JavaScriptInterpreter } from './javascriptInterpreter';
import { PythonInterpreter } from './pythonInterpreter';

// Factory function to get the appropriate interpreter
export function getInterpreter(fileType: string): Interpreter | null {
  switch (fileType) {
    case 'javascript':
      return new JavaScriptInterpreter();
    case 'python':
      return new PythonInterpreter();
    default:
      return null;
  }
}
