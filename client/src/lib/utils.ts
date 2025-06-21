import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Join path segments correctly, handling leading and trailing slashes
 */
export function joinPaths(...segments: string[]): string {
  // Filter out empty segments
  const filteredSegments = segments.filter(s => s && s !== '');
  
  if (filteredSegments.length === 0) return '/';
  
  // Handle absolute path if the first segment starts with '/'
  const isAbsolute = segments[0].startsWith('/');
  
  // Join path segments and handle multiple slashes
  const normalizedPath = filteredSegments
    .join('/')
    .replace(/\/+/g, '/');
  
  return isAbsolute ? `/${normalizedPath.replace(/^\/+/, '')}` : normalizedPath;
}

/**
 * Get the parent directory path of a file path
 */
export function getParentPath(path: string): string {
  if (!path || path === '/' || path === '') return '/';
  
  // Remove trailing slashes
  const normalizedPath = path.replace(/\/+$/, '');
  
  // Get parent path
  const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
  
  // Return root if parentPath is empty
  return parentPath || '/';
}

/**
 * Get filename from a path
 */
export function getFileName(path: string): string {
  if (!path || path === '/' || path === '') return '';
  
  // Remove trailing slashes
  const normalizedPath = path.replace(/\/+$/, '');
  
  // Get filename
  return normalizedPath.split('/').pop() || '';
}
