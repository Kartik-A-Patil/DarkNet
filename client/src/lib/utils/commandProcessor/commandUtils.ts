/**
 * Resolves a path (handles relative paths)
 */
export const resolvePath = (path: string, currentPath: string): string => {
  if (!path) return currentPath;
  
  if (path.startsWith('/')) {
    return path;
  } else if (path === '~') {
    return '/home/hackos';
  } else if (path === '..') {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length === 0) return '/';
    parts.pop();
    return '/' + parts.join('/');
  } else if (path === '.') {
    return currentPath;
  } else {
    return currentPath === '/' ? `/${path}` : `${currentPath}/${path}`;
  }
};
