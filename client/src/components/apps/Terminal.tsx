import React, { useEffect, useRef, useState, useCallback } from "react";
import { useOS } from "../../contexts/OSContext";
import "./Terminal.css";

// Define syntax highlighting tokens
const TOKENS = {
  COMMAND: "command",
  PATH: "path",
  FLAG: "flag",
  STRING: "string",
  NUMBER: "number",
  COMMENT: "comment",
  ERROR: "error",
  SUCCESS: "success",
  WARNING: "warning",
  FILE: "file",
  DIRECTORY: "directory",
  PROCESS: "process",
  PERMISSION: "permission"
};

interface HighlightedSegment {
  text: string;
  type: string;
}

interface OutputLine {
  content: string;
  isHTML: boolean;
  timestamp?: number;
}

interface TerminalProps {
  initialDirectory?: string;
  theme?: "dark" | "light" | "matrix";
}

const Terminal: React.FC<TerminalProps> = ({
  initialDirectory,
  theme = "dark"
}) => {
  const { commandProcessor, fileSystem, windowManager } = useOS();
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);
  const [currentCommand, setCurrentCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [outputLines, setOutputLines] = useState<OutputLine[]>([
    { content: "Welcome to HackOS Terminal", isHTML: false },
    { content: "Type 'help' for a list of available commands.", isHTML: false },
    { content: "", isHTML: false }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentPath, setCurrentPath] = useState(
    initialDirectory || "/home/hackos"
  );
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Focus input on click
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputLines]);

  // Handle cursor position
  const handleCursorPositionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
    focusInput();
  };

  // Parse command for syntax highlighting with improved patterns
  const parseCommand = (cmd: string): HighlightedSegment[] => {
    if (!cmd) return [];

    const rawParts = cmd.split(/(\s+)/);
    const result: HighlightedSegment[] = [];
    
    // Enhanced command categories
    const fileCommands = [
      "ls", "cd", "cat", "nano", "rm", "touch", "mkdir", "cp", "mv", "pwd", "chmod", "chown", "find"
    ];
    const networkCommands = ["ping", "ifconfig", "netstat", "ssh", "nmap", "wget", "curl", "traceroute", "netcat", "nc"];
    const systemCommands = ["ps", "top", "htop", "kill", "whoami", "sudo", "apt", "systemctl", "service", "dmesg"];
    const hackingCommands = ["sqlmap", "metasploit", "msfconsole", "hashcat", "hydra", "aircrack-ng", "wireshark"];
    
    // Check if the first part is a known command
    if (rawParts.length > 0) {
      const commandName = rawParts[0].trim();
      const isFileCommand = fileCommands.includes(commandName);
      const isNetworkCommand = networkCommands.includes(commandName);
      const isSystemCommand = systemCommands.includes(commandName);
      const isHackingCommand = hackingCommands.includes(commandName);
      
      // Process each part
      for (let i = 0; i < rawParts.length; i++) {
        const part = rawParts[i];
        
        // Handle whitespace
        if (/^\s+$/.test(part)) {
          result.push({ text: part, type: "" });
          continue;
        }
        
        // First part is always the command
        if (i === 0) {
          let type = TOKENS.COMMAND;
          if (isHackingCommand) type = "hacking-command";
          result.push({ text: part, type });
        }
        // Handle flags (both short -a and long --all)
        else if (part.startsWith("-")) {
          result.push({ text: part, type: TOKENS.FLAG });
        }
        // Handle environment variables
        else if (part.startsWith("$")) {
          result.push({ text: part, type: "variable" });
        }
        // Handle paths and files
        else if (
          part.startsWith("/") ||
          part.includes("/") ||
          part === "~" ||
          part === ".." ||
          part === "." ||
          (isFileCommand && !part.startsWith("-"))
        ) {
          if (part.endsWith("/")) {
            result.push({ text: part, type: TOKENS.DIRECTORY });
          } else {
            // Check file extensions for better coloring
            const hasExtension = part.includes(".") && !part.endsWith(".");
            if (hasExtension) {
              const extension = part.split('.').pop()?.toLowerCase();
              // Executable files
              if (['sh', 'bash', 'py', 'exe', 'bin'].includes(extension || '')) {
                result.push({ text: part, type: "executable" });
              } 
              // Config files
              else if (['json', 'yaml', 'yml', 'xml', 'conf', 'ini'].includes(extension || '')) {
                result.push({ text: part, type: "config-file" });
              }
              // Log or data files
              else if (['log', 'txt', 'csv', 'md'].includes(extension || '')) {
                result.push({ text: part, type: "data-file" });
              }
              // Other files
              else {
                result.push({ text: part, type: TOKENS.FILE });
              }
            } else {
              result.push({ text: part, type: TOKENS.PATH });
            }
          }
        }
        // Handle quoted strings
        else if ((part.startsWith('"') && part.endsWith('"')) || 
                  (part.startsWith("'") && part.endsWith("'"))) {
          result.push({ text: part, type: TOKENS.STRING });
        }
        // Handle numbers
        else if (!isNaN(Number(part))) {
          result.push({ text: part, type: TOKENS.NUMBER });
        }
        // Handle comments
        else if (part.startsWith("#")) {
          result.push({ text: part, type: TOKENS.COMMENT });
        }
        // Handle IP addresses and network identifiers
        else if (/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(part) || /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(part)) {
          result.push({ text: part, type: "network-address" });
        }
        // Handle URLs
        else if (/^https?:\/\//.test(part) || /^www\./.test(part)) {
          result.push({ text: part, type: "url" });
        }
        // Handle operators
        else if (['|', '||', '&&', '>', '>>', '<', '<<', ';'].includes(part)) {
          result.push({ text: part, type: "operator" });
        }
        // Handle process IDs for system commands
        else if (isSystemCommand && /^\d+$/.test(part)) {
          result.push({ text: part, type: TOKENS.PROCESS });
        }
        // Default - regular arguments with context-aware typing
        else {
          if (isNetworkCommand) {
            result.push({ text: part, type: "network-param" });
          } else if (isSystemCommand) {
            result.push({ text: part, type: "system-param" });
          } else if (isHackingCommand) {
            result.push({ text: part, type: "hacking-param" });
          } else {
            result.push({ text: part, type: "argument" });
          }
        }
      }
    }

    return result;
  };

  // Execute command
  const executeCommand = async () => {
    if (!currentCommand.trim() || isExecuting) return;

    const trimmedCommand = currentCommand.trim();

    // Add command to history
    if (history.length === 0 || history[0] !== trimmedCommand) {
      setHistory([trimmedCommand, ...history]);
    }
    setHistoryIndex(-1);

    // Add command to output
    const promptText = `kali@kali:${currentPath.replace(
      /^\/home\/[\w-]+/,
      "~"
    )}$ ${trimmedCommand}`;
    setOutputLines((prev) => [
      ...prev,
      { content: promptText, isHTML: false, timestamp: Date.now() }
    ]);

    // Clear input field
    setCurrentCommand("");

    // Set executing state
    setIsExecuting(true);

    try {
      // Check for nano command
      if (trimmedCommand.startsWith("nano ")) {
        const filePath = trimmedCommand.split(" ")[1];
        if (filePath) {
          // Resolve the file path
          const fullPath = filePath.startsWith("/")
            ? filePath
            : `${currentPath}/${filePath}`.replace(/\/+/g, "/");

          // Try to get file content
          let content = "";
          try {
            const fileContent = await fileSystem.readFile(fullPath);
            if (fileContent !== null) {
              content = fileContent;
            }
          } catch (error) {
            // File may not exist, we'll create it when saving
          }

          // Call the window manager to open text editor
          windowManager.createWindow("text-editor", {
            title: `Editor - ${filePath}`,
            props: {
              filePath: fullPath,
              initialContent: content
            }
          });

          setOutputLines((prev) => [
            ...prev,
            {
              content: `Opening ${filePath} in text editor...`,
              isHTML: false,
              timestamp: Date.now()
            }
          ]);
        } else {
          setOutputLines((prev) => [
            ...prev,
            {
              content: "nano: missing file operand",
              isHTML: false,
              timestamp: Date.now()
            }
          ]);
        }
        setIsExecuting(false);
        return;
      }

      // Process command using the command processor from context
      const result = await commandProcessor.processCommand(trimmedCommand);

      // Handle clear command
      if (result.clearScreen) {
        setOutputLines([
          { content: "Welcome to HackOS Terminal", isHTML: false },
          {
            content: "Type 'help' for a list of available commands.",
            isHTML: false
          },
          { content: "", isHTML: false }
        ]);
      } else {
        // Add command output to terminal
        const outputText = result.output || "";

        // Check if output is HTML
        const isHTMLOutput =
          outputText.includes("<span") || outputText.includes("<div");

        if (isHTMLOutput) {
          setOutputLines((prev) => [
            ...prev,
            {
              content: outputText,
              isHTML: true,
              timestamp: Date.now()
            }
          ]);
        } else {
          // Split by newlines for plain text
          const newLines = outputText.split("\n");

          setOutputLines((prev) => [
            ...prev,
            ...newLines
              .filter((line) => line !== "")
              .map((line) => ({
                content: line,
                isHTML: false,
                timestamp: Date.now()
              }))
          ]);
        }
      }

      // Update path if cd command changed it
      if (result.newPath) {
        setCurrentPath(result.newPath);
      }
    } catch (error) {
      console.error("Command error:", error);
      setOutputLines((prev) => [
        ...prev,
        {
          content: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          isHTML: false,
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isExecuting) {
      // Allow Ctrl+C during execution
      if (e.ctrlKey && e.key === "c") {
        setIsExecuting(false);
        setOutputLines((prev) => [...prev, { content: "^C", isHTML: false }]);
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIndex);
        setCurrentCommand(history[nextIndex]);
        // Set cursor at end of input
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.selectionEnd =
              history[nextIndex].length;
            setCursorPosition(history[nextIndex].length);
          }
        }, 0);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setCurrentCommand(history[nextIndex]);
        // Set cursor at end of input
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.selectionEnd =
              history[nextIndex].length;
            setCursorPosition(history[nextIndex].length);
          }
        }, 0);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand("");
        setCursorPosition(0);
      }
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      setOutputLines([
        { content: "Welcome to HackOS Terminal", isHTML: false },
        {
          content: "Type 'help' for a list of available commands.",
          isHTML: false
        },
        { content: "", isHTML: false }
      ]);
    } else if (e.ctrlKey && e.key === "u") {
      // Clear line before cursor
      e.preventDefault();
      setCurrentCommand((prev) => prev.substring(cursorPosition));
      setCursorPosition(0);
    } else if (e.ctrlKey && e.key === "k") {
      // Clear line after cursor
      e.preventDefault();
      setCurrentCommand((prev) => prev.substring(0, cursorPosition));
    } else if (e.ctrlKey && e.key === "a") {
      // Move cursor to beginning of line
      e.preventDefault();
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd = 0;
        setCursorPosition(0);
      }
    } else if (e.ctrlKey && e.key === "e") {
      // Move cursor to end of line
      e.preventDefault();
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd =
          currentCommand.length;
        setCursorPosition(currentCommand.length);
      }
    } else {
      // Update cursor position on next tick
      setTimeout(() => {
        if (inputRef.current) {
          setCursorPosition(inputRef.current.selectionStart || 0);
        }
      }, 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCommand(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  // Render highlighted command
  const renderHighlightedCommand = () => {
    const parts = parseCommand(currentCommand);
    return (
      <>
        {parts.map((segment, index) => (
          <span key={index} className={segment.type}>
            {segment.text}
          </span>
        ))}
      </>
    );
  };

  // Integrated render approach - command input is part of output
  return (
    <div
      className={`terminal-container h-full p-2 font-mono text-sm terminal-theme-${theme}`}
      onClick={focusInput}
      ref={terminalRef}
    >
      <div className="terminal-output">
        {outputLines.map((line, i) =>
          line.isHTML ? (
            <div
              key={i}
              className="terminal-line"
              dangerouslySetInnerHTML={{ __html: line.content }}
            ></div>
          ) : (
            <div key={i} className="terminal-line">
              {line.content}
            </div>
          )
        )}

        {/* Current input line integrated with output */}
        {!isExecuting && (
          <div className="terminal-line terminal-input-line">
            <span className="terminal-prompt">
              kali@kali:<span className="text-white">{currentPath.replace(/^\/home\/[\w-]+/, "~")}$ </span>
            </span>
            <div className="terminal-input-wrapper" onClick={handleClick}>
              <div className="terminal-highlighted" ref={highlightedRef}>
                {renderHighlightedCommand()}
              </div>
              <input
                ref={inputRef}
                type="text"
                className="terminal-input"
                value={currentCommand}
                onChange={handleInputChange}
                onSelect={handleCursorPositionChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                autoFocus
              />
              {isFocused && (
                <div
                  className="terminal-cursor"
                  style={{
                    left: `${cursorPosition}ch`,
                    height: "1.4em"
                  }}
                />
              )}
            </div>
          </div>
        )}
        {isExecuting && (
          <div className="terminal-line">
            <span className="command-processing">Processing command...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
