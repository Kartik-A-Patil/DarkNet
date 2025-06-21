import { useState, useCallback, useEffect } from 'react';
import { Package, AvailablePackage, InstallResult } from './types';
import { availablePackages } from './availablePackages';

export function usePackageManager() {
  // Get installed packages from localStorage or initialize empty
  const getInstalledPackages = (): {[name: string]: Package} => {
    const savedPackages = localStorage.getItem('hackos_packages');
    if (savedPackages) {
      try {
        return JSON.parse(savedPackages);
      } catch (e) {
        console.error('Error parsing saved packages', e);
        return {};
      }
    }
    return {};
  };

  const [installedPackages, setInstalledPackages] = useState<{[name: string]: Package}>(getInstalledPackages());

  // Save packages to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('hackos_packages', JSON.stringify(installedPackages));
    } catch (e) {
      console.error('Error saving packages to localStorage', e);
    }
  }, [installedPackages]);

  // Install a package
  const installPackage = useCallback((packageName: string): InstallResult => {
    // Check if package exists
    if (!availablePackages[packageName]) {
      return { 
        success: false, 
        message: `Package ${packageName} not found in repositories. Try running 'apt update' first.` 
      };
    }

    // Check if package is already installed
    if (installedPackages[packageName]) {
      return { 
        success: false, 
        message: `Package ${packageName} is already installed.` 
      };
    }

    // Check dependencies
    const pkg = availablePackages[packageName];
    for (const dep of pkg.dependencies) {
      if (!installedPackages[dep]) {
        return { 
          success: false, 
          message: `Dependency ${dep} is not installed. Try 'apt install ${dep}' first.` 
        };
      }
    }

    // Install the package
    setInstalledPackages(prev => ({
      ...prev,
      [packageName]: {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        installed: true,
        category: pkg.category
      }
    }));

    return { 
      success: true, 
      message: `Successfully installed ${packageName} v${pkg.version}` 
    };
  }, [installedPackages]);

  // Uninstall a package
  const uninstallPackage = useCallback((packageName: string): InstallResult => {
    // Check if package is installed
    if (!installedPackages[packageName]) {
      return { 
        success: false, 
        message: `Package ${packageName} is not installed.` 
      };
    }

    // Check if any other packages depend on this one
    const dependentPackages: string[] = [];
    for (const [name, pkg] of Object.entries(availablePackages)) {
      if (pkg.dependencies.includes(packageName) && installedPackages[name]) {
        dependentPackages.push(name);
      }
    }

    if (dependentPackages.length > 0) {
      return { 
        success: false, 
        message: `Cannot uninstall ${packageName}. The following packages depend on it: ${dependentPackages.join(', ')}` 
      };
    }

    // Uninstall the package
    setInstalledPackages(prev => {
      const newPackages = {...prev};
      delete newPackages[packageName];
      return newPackages;
    });

    return { 
      success: true, 
      message: `Successfully uninstalled ${packageName}` 
    };
  }, [installedPackages]);

  // Get all available packages
  const getAvailablePackages = useCallback((): AvailablePackage[] => {
    return Object.values(availablePackages).map(pkg => ({
      ...pkg,
      installed: !!installedPackages[pkg.name]
    }));
  }, [installedPackages]);

  // Check if a package is installed
  const isPackageInstalled = useCallback((packageName: string): boolean => {
    return !!installedPackages[packageName];
  }, [installedPackages]);

  // Get installed packages list
  const getInstalledPackagesList = useCallback((): Package[] => {
    return Object.values(installedPackages);
  }, [installedPackages]);

  // Search for packages
  const searchPackages = useCallback((query: string): AvailablePackage[] => {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(availablePackages).filter(pkg => 
      pkg.name.toLowerCase().includes(lowercaseQuery) || 
      pkg.description.toLowerCase().includes(lowercaseQuery) ||
      pkg.category.toLowerCase().includes(lowercaseQuery)
    ).map(pkg => ({
      ...pkg,
      installed: !!installedPackages[pkg.name]
    }));
  }, [installedPackages]);

  return {
    installPackage,
    uninstallPackage,
    getAvailablePackages,
    isPackageInstalled,
    getInstalledPackagesList,
    searchPackages
  };
}
