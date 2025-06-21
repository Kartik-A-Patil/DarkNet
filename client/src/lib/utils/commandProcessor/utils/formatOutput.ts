// Helper functions for formatting command output
export function formatError(text: string): string {
  return `<span class="error">${text}</span>`;
}

export function formatSuccess(text: string): string {
  return `<span class="success">${text}</span>`;
}

export function formatWarning(text: string): string {
  return `<span class="warning">${text}</span>`;
}

export function formatFile(fileName: string): string {
  return `<span class="file">${fileName}</span>`;
}

export function formatDirectory(dirName: string): string {
  return `<span class="directory">${dirName}</span>`;
}

export function formatPath(path: string): string {
  return `<span class="path">${path}</span>`;
}