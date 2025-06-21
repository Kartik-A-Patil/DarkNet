

// Interface for interpreter results
export interface InterpreterResult {
  output: string;
  error: boolean;
  exitCode: number;
}

// Helper function to check if a value is not null
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
