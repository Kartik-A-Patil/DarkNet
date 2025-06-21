import { CommandResult } from '../../../types/os.types';
import { FileSystemNode } from '../filesystem';

export interface CommandResult {
  output: string;
  error?: boolean;
  clearScreen?: boolean;
  newPath?: string;
}

export interface CommandProcessorOptions {
  fileSystem: any;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  network: any;
  packageManager?: any;
}

export interface CommandOptions {
  fileSystem: any;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  network: any;
  packageManager?: any;
  history?: string[];
  user?: string;
  hostname?: string;
}

export interface CommandProcessor {
  processCommand: (input: string) => Promise<CommandResult>;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[], options: CommandOptions) => Promise<CommandResult>;
}
