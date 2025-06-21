export interface Package {
  name: string;
  version: string;
  description: string;
  installed: boolean;
  category: 'system' | 'network' | 'security' | 'development' | 'utility';
}

export interface AvailablePackage extends Package {
  size: number; // in KB
  dependencies: string[];
}

export interface InstallResult {
  success: boolean;
  message: string;
}
