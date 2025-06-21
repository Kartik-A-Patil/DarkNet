import { useCallback } from 'react';
import { CommandResult } from '../types/os.types';
import { usePackageManager } from './utils/packageManager/index';
import { ReturnType } from '../types/utility.types';
// import { createCommandProcessor } from './core/commandProcessor';
import {createCommandProcessor} from '@/lib/utils/commandProcessor/index';
export function useCommandProcessor(
  fileSystem: any,
  initialPath: string,
  setCurrentPath: (path: string) => void,
  network: any,
  packageManager?: ReturnType<typeof usePackageManager>
) {
  // If packageManager is not provided as a parameter, use the hook
  const localPackageManager = usePackageManager();
  const packageManagerInstance = packageManager || localPackageManager;
  
  const processCommand = useCallback(async (input: string): Promise<CommandResult> => {
    // Create a new command processor for each command to ensure we have the current path
    const commandProcessor = createCommandProcessor({
      fileSystem,
      currentPath: initialPath,
      setCurrentPath,
      network,
      packageManager: packageManagerInstance,
      history: [] // We'll implement history tracking later
    });
    
    return commandProcessor.processCommand(input);
  }, [initialPath, setCurrentPath, fileSystem, packageManagerInstance, network]);

  return { processCommand };
}
