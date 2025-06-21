import { Command, CommandOptions, CommandResult } from '../../types';
import { formatError, formatSuccess } from '../../utils/formatOutput';

export const apt: Command = {
  name: 'apt',
  description: 'Advanced Package Tool for package management',
  usage: 'apt [update|upgrade|install|remove|list|search] [package-name]',
  execute: async (args: string[], options: CommandOptions): Promise<CommandResult> => {
    try {
      const { packageManager } = options;
      
      // Ensure packageManager is available
      if (!packageManager) {
        return {
          output: formatError('Package manager not available'),
          error: true
        };
      }
      
      if (args.length < 1) {
        return {
          output: formatError('apt: missing command\nUsage: apt [update|upgrade|install|remove|list|search] [package-name]'),
          error: true
        };
      }
      
      const aptCommand = args[0];
      
      // apt update - refresh package list
      if (aptCommand === 'update') {
        return {
          output: formatSuccess(`Reading package lists... Done
Building dependency tree... Done
All packages are up to date.`),
          error: false
        };
      }
      
      // apt upgrade - upgrade all packages
      if (aptCommand === 'upgrade') {
        return {
          output: formatSuccess(`Reading package lists... Done
Building dependency tree... Done
Calculating upgrade... Done
All packages are up to date.`),
          error: false
        };
      }
      
      // apt install - install a package
      if (aptCommand === 'install') {
        if (args.length < 2) {
          return {
            output: formatError('apt install: you must specify a package to install'),
            error: true
          };
        }
        
        const packageName = args[1];
        const result = packageManager.installPackage(packageName);
        
        if (result.success) {
          return {
            output: formatSuccess(`Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed: ${packageName}
Unpacking ${packageName}...
Setting up ${packageName}...
${result.message}`),
            error: false
          };
        } else {
          return {
            output: formatError(`E: ${result.message}`),
            error: true
          };
        }
      }
      
      // apt remove - uninstall a package
      if (aptCommand === 'remove') {
        if (args.length < 2) {
          return {
            output: formatError('apt remove: you must specify a package to remove'),
            error: true
          };
        }
        
        const packageName = args[1];
        const result = packageManager.uninstallPackage(packageName);
        
        if (result.success) {
          return {
            output: formatSuccess(`Reading package lists... Done
Building dependency tree... Done
The following packages will be REMOVED: ${packageName}
${result.message}`),
            error: false
          };
        } else {
          return {
            output: formatError(`E: ${result.message}`),
            error: true
          };
        }
      }
      
      // apt list - list all available packages
      if (aptCommand === 'list') {
        const packages = packageManager.getAvailablePackages();
        const installedPackages = packages.filter(p => p.installed);
        
        // Filter by installed if specified
        if (args.length > 1 && args[1] === '--installed') {
          if (installedPackages.length === 0) {
            return {
              output: 'No packages installed.',
              error: false
            };
          }
          
          const output = installedPackages.map(p => 
            `${p.name}/${p.category} ${p.version} [installed]`
          ).join('\n');
          
          return {
            output,
            error: false
          };
        }
        
        // List all packages, marking installed ones
        const output = packages.map(p => 
          `${p.name}/${p.category} ${p.version}${p.installed ? ' [installed]' : ''}`
        ).join('\n');
        
        return {
          output,
          error: false
        };
      }
      
      // apt search - search for packages
      if (aptCommand === 'search') {
        if (args.length < 2) {
          return {
            output: formatError('apt search: you must specify a search term'),
            error: true
          };
        }
        
        const searchTerm = args[1];
        const results = packageManager.searchPackages(searchTerm);
        
        if (results.length === 0) {
          return {
            output: `No packages found matching '${searchTerm}'`,
            error: false
          };
        }
        
        const output = results.map(p => 
          `${p.name}/${p.category} - ${p.description}`
        ).join('\n');
        
        return {
          output,
          error: false
        };
      }
      
      // Unknown apt command
      return {
        output: formatError(`Invalid operation: ${aptCommand}\nUsage: apt [update|upgrade|install|remove|list|search] [package-name]`),
        error: true
      };
    } catch (error: any) {
      return {
        output: formatError(`apt: error: ${error.message}`),
        error: true
      };
    }
  }
};