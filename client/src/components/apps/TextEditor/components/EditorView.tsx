import React from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import { EditorTab, EditorSettings } from '../types';

interface EditorViewProps {
  activeTab: EditorTab | null;
  settings: EditorSettings;
  onContentChange: (content: string) => void;
}

const EditorViewComponent: React.FC<EditorViewProps> = ({
  activeTab,
  settings,
  onContentChange
}) => {
  // Get the appropriate language extension
  const getLanguageExtension = (language: string) => {
    switch (language) {
      case "javascript":
      case "typescript":
        return javascript({ jsx: true, typescript: language === "typescript" });
      case "python":
        return python();
      case "html":
        return html();
      case "css":
        return css();
      case "markdown":
        return markdown();
      case "json":
        return json();
      default:
        return [];
    }
  };

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-center">
          <i className="fa fa-file-code text-6xl mb-4 opacity-50"></i>
          <h3 className="text-xl mb-2">No File Open</h3>
          <p className="text-sm">Create a new file or open an existing one to start editing</p>
          <div className="mt-4 space-x-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Ctrl+N</kbd>
            <span className="text-xs">New File</span>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs ml-4">Ctrl+O</kbd>
            <span className="text-xs">Open File</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-gray-950 relative">
      <div className="flex h-full">
        {/* Main Editor */}
        <div className={`${settings.minimap ? 'flex-1 pr-2' : 'w-full'}`}>
          <CodeMirror
            value={activeTab.content}
            height="100%"
            theme={settings.theme === 'dark' ? vscodeDark : vscodeLight}
            onChange={onContentChange}
            basicSetup={{
              lineNumbers: settings.lineNumbers,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              foldGutter: true,
              tabSize: settings.tabSize,
              indentOnInput: true,
              autocompletion: true,
            }}
            extensions={[
              settings.wordWrap ? EditorView.lineWrapping : [],
              getLanguageExtension(activeTab.language),
              EditorView.theme({
                '.cm-editor': {
                  fontSize: `${settings.fontSize}px !important`,
                  fontFamily: "'Cascadia Code', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                },
                '.cm-focused': {
                  outline: 'none',
                },
                '.cm-scroller': {
                  fontSize: `${settings.fontSize}px !important`,
                  lineHeight: '1.4',
                },
                '.cm-content': {
                  fontSize: `${settings.fontSize}px !important`,
                },
                '.cm-line': {
                  fontSize: `${settings.fontSize}px !important`,
                },
              }),
            ]}
            className="editor-codemirror h-full"
          />
        </div>

        {/* Custom Minimap */}
        {settings.minimap && (
          <div className="w-20 border-l border-gray-700 bg-gray-900 overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div 
                className="text-xs leading-tight p-1 font-mono text-gray-500 whitespace-pre-wrap break-all"
                style={{ 
                  fontSize: '6px',
                  lineHeight: '8px',
                  fontFamily: "'Cascadia Code', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
                }}
              >
                {activeTab.content.split('\n').map((line, index) => (
                  <div key={index} className="truncate">
                    {line || ' '}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorViewComponent;
