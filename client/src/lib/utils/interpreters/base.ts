import { Package } from '../packageManager/types';
import { InterpreterResult } from './types';

// Base Interpreter class
export abstract class Interpreter {
  protected requiredPackage: string;
  
  constructor(requiredPackage: string) {
    this.requiredPackage = requiredPackage;
  }
  
  // Check if the interpreter can run (if the required package is installed)
  canRun(installedPackages: Package[]): boolean {
    return installedPackages.some(pkg => pkg.name === this.requiredPackage);
  }
  
  // Abstract execute method to be implemented by each interpreter
  abstract execute(code: string, args: string[]): Promise<InterpreterResult>;
}
