/**
 * Resolves a path considering the current working directory
 */
export function resolvePath(path: string, currentPath: string): string {
  // Handle home directory shorthand
  if (path.startsWith('~')) {
    path = `/home/hackos${path.substring(1)}`;
  }
  
  // Handle absolute paths
  if (path.startsWith('/')) {
    return normalizePath(path);
  }
  
  // Handle special cases
  if (path === '.') return currentPath;
  if (path === '..') {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length === 0) return '/';
    parts.pop();
    return parts.length ? `/${parts.join('/')}` : '/';
  }
  
  // Handle relative paths
  return normalizePath(currentPath === '/' ? `/${path}` : `${currentPath}/${path}`);
}

/**
 * Normalizes a path by resolving . and .. segments
 */
export function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const result: string[] = [];
  
  for (const part of parts) {
    if (part === '..') {
      result.pop();
    } else if (part !== '.') {
      result.push(part);
    }
  }
  
  return `/${result.join('/')}`;
}

/**
 * Get the parent directory of a path
 */
export function getParentDir(path: string): string {
  if (path === '/' || !path) return '/';
  
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return parts.length ? `/${parts.join('/')}` : '/';
}

/**
 * Get the filename from a path
 */
export function getFileName(path: string): string {
  if (path === '/' || !path) return '';
  
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1];
}
