import React from 'react';
import { joinPaths, getFileName, getParentPath } from '@/lib/utils';
import { FileSystemNode } from '@/types/os.types';

/**
 * Get file icon based on file type and name
 */
export function getFileIcon(name: string, node: FileSystemNode): string {
  if (node.type === "directory") {
    if (name === "Desktop") return "fa-desktop text-blue-400";
    if (name === "Documents") return "fa-file-alt text-blue-400";
    if (name === "Downloads") return "fa-download text-blue-400";
    if (name === "Pictures") return "fa-image text-blue-400";
    if (name === "Music") return "fa-music text-blue-400";
    if (name === "Videos") return "fa-video text-blue-400";
    return "fa-folder text-blue-400";
  } else {
    if (node.executable) return "fa-file-code text-green-500";
    
    const extension = name.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'sh':
      case 'py':
      case 'rb':
      case 'js':
      case 'ts':
        return "fa-file-code text-green-400";
      case 'txt':
      case 'md':
        return "fa-file-alt text-gray-300";
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return "fa-file-image text-purple-400";
      case 'pdf':
        return "fa-file-pdf text-red-400";
      case 'zip':
      case 'tar':
      case 'gz':
      case '7z':
      case 'rar':
        return "fa-file-archive text-yellow-400";
      case 'mp3':
      case 'wav':
      case 'ogg':
        return "fa-file-audio text-blue-300";
      case 'mp4':
      case 'webm':
      case 'mkv':
        return "fa-file-video text-purple-300";
      case 'html':
      case 'htm':
        return "fa-file-code text-orange-400";
      case 'css':
        return "fa-file-code text-blue-400";
      case 'json':
        return "fa-file-code text-yellow-300";
      default:
        return "fa-file text-gray-300";
    }
  }
};

/**
 * Format file size with appropriate units
 */
export function formatFileSize(size?: number): string {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Get MIME type based on file extension
 */
export function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'json': return 'application/json';
    case 'txt': return 'text/plain';
    case 'md': return 'text/markdown';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'pdf': return 'application/pdf';
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    default: return 'application/octet-stream';
  }
}

/**
 * Empty Directory Component
 */
export const EmptyDirectory: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <i className="fa fa-folder-open text-4xl mb-2"></i>
      <p>This folder is empty</p>
    </div>
  );
};

/**
 * Loading Spinner Component
 */
export const FileSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  );
};
