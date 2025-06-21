import { useState, useCallback, useRef, useEffect } from 'react';
import { CommandResult } from '../types/os.types';

export function useTerminal(
  processCommand: (cmd: string) => Promise<CommandResult> | CommandResult,
  initialPath: string
) {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState('');
  const [output, setOutput] = useState<string>(`Welcome to HackOS Terminal
Type 'help' for a list of available commands.
`);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Store a temporary command when navigating history
  const tempCommandRef = useRef<string>('');
  
  // Reference to keep track of mounted state
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Clear the terminal
  const clearTerminal = useCallback(() => {
    setOutput(`Welcome to HackOS Terminal
Type 'help' for a list of available commands.
`);
  }, []);
  
  // Force reset terminal state (for recovery)
  const forceReset = useCallback(() => {
    setIsExecuting(false);
    setCurrentCommand('');
  }, []);
  
  // Submit a command
  const submitCommand = useCallback(async () => {
    if (isExecuting || !currentCommand.trim()) return;
    
    // Add to history if not the same as last command
    if (currentCommand.trim() && (commandHistory.length === 0 || commandHistory[0] !== currentCommand)) {
      setCommandHistory(prev => [currentCommand, ...prev]);
    }
    
    // Reset history navigation
    setHistoryIndex(-1);
    
    // Store command for potential processing
    const commandToProcess = currentCommand.trim();
    
    // Add command with prompt to output as plain text (no HTML)
    const promptText = `kali@kali:${initialPath.replace(/^\/home\/[\w-]+/, '~')}$ ${commandToProcess}`;
    setOutput(prev => `${prev}${promptText}\n`);
    
    // Clear current command
    setCurrentCommand('');
    
    // Mark as executing
    setIsExecuting(true);
    
    try {
      // Process the command with timeout protection
      const commandPromise = Promise.resolve(processCommand(commandToProcess));
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<CommandResult>((_, reject) => {
        setTimeout(() => reject(new Error("Command timed out")), 5000);
      });
      
      // Race the command against the timeout
      const result = await Promise.race([commandPromise, timeoutPromise]);
      
      if (!isMounted.current) return;
      
      // Update output with command result
      if (result.clearScreen) {
        clearTerminal();
      } else {
        // Ensure output is plain text, strip any HTML tags
        const plainOutput = result.output.replace(/<[^>]*>?/gm, '');
        setOutput(prev => `${prev}${plainOutput}\n`);
      }
    } catch (error: any) {
      if (isMounted.current) {
        setOutput(prev => `${prev}Error: ${error.message || 'Unknown error occurred'}\n`);
      }
    } finally {
      if (isMounted.current) {
        // Mark command as no longer executing
        setIsExecuting(false);
      }
    }
  }, [currentCommand, commandHistory, clearTerminal, processCommand, isExecuting, initialPath]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isExecuting) {
        submitCommand();
      }
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // Save current command when starting to navigate history
      if (historyIndex === -1) {
        tempCommandRef.current = currentCommand;
      }
      
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } 
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      } 
      else if (historyIndex === 0) {
        // Restore the temporary command
        setHistoryIndex(-1);
        setCurrentCommand(tempCommandRef.current);
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (isExecuting) {
        setOutput(prev => `${prev}^C\n`);
        setIsExecuting(false);
      } else if (currentCommand) {
        setCurrentCommand('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clearTerminal();
    }
  }, [historyIndex, commandHistory, currentCommand, submitCommand, isExecuting, clearTerminal]);
  
  return {
    commandHistory,
    currentCommand,
    output,
    historyIndex,
    isExecuting,
    setCurrentCommand,
    submitCommand,
    handleKeyDown,
    clearTerminal,
    forceReset
  };
}
