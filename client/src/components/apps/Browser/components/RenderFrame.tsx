import React, { useRef, useEffect, useState } from 'react';
import { BrowserTab } from '../types';

interface RenderFrameProps {
  tab?: BrowserTab;
  onNavigate: (url: string) => void;
  onOpenFile?: () => void;
  onShowBookmarks?: () => void;
  onNewTab?: () => void;
}

const RenderFrame: React.FC<RenderFrameProps> = ({ 
  tab, 
  onNavigate, 
  onOpenFile, 
  onShowBookmarks, 
  onNewTab 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<'render' | 'source'>('render');
  const [sourceContent, setSourceContent] = useState('');

  // Handle iframe content updates
  useEffect(() => {
    if (!tab || !iframeRef.current) return;

    const iframe = iframeRef.current;
    
    if (tab.content && !tab.error) {
      // Create blob URL for the content
      const blob = new Blob([tab.content], { type: getContentType(tab.filePath) });
      const url = URL.createObjectURL(blob);
      iframe.src = url;
      setSourceContent(tab.content);
      
      // Clean up blob URL when component unmounts or content changes
      return () => URL.revokeObjectURL(url);
    } else if (tab.error) {
      // Show error page
      const errorHTML = createErrorPage(tab.error);
      const blob = new Blob([errorHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframe.src = url;
      setSourceContent(tab.content || '');
      
      return () => URL.revokeObjectURL(url);
    }
  }, [tab?.content, tab?.error, tab?.filePath]);

  // Handle messages from iframe (for welcome page interactions)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      
      const { action, url } = event.data;
      switch (action) {
        case 'openFile':
          onOpenFile?.();
          break;
        case 'showBookmarks':
          onShowBookmarks?.();
          break;
        case 'newTab':
          onNewTab?.();
          break;
        case 'help':
          // Navigate to help page
          onNavigate('browser://help');
          break;
        case 'navigate':
          // Handle navigation from help page
          if (url) {
            onNavigate(url);
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate, onOpenFile, onShowBookmarks, onNewTab]);

  const getContentType = (filePath?: string): string => {
    if (!filePath) return 'text/html';
    
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
      case 'htm':
        return 'text/html';
      case 'css':
        return 'text/css';
      case 'js':
        return 'application/javascript';
      case 'json':
        return 'application/json';
      case 'xml':
        return 'application/xml';
      default:
        return 'text/plain';
    }
  };

  const createErrorPage = (error: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error Loading File</title>
        <style>
          body {
            margin: 0;
            padding: 40px;
            font-family: 'Courier New', monospace;
            background: #1a1a1a;
            color: #ff6b6b;
            text-align: center;
          }
          .error-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px;
            border: 2px solid #ff6b6b;
            border-radius: 8px;
            background: rgba(255, 107, 107, 0.1);
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 20px;
          }
          .error-message {
            font-size: 1.1rem;
            margin: 20px 0;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            word-break: break-word;
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="icon">⚠️</div>
          <h1>Failed to Load File</h1>
          <div class="error-message">${error}</div>
          <p>Please check the file path and try again.</p>
        </div>
      </body>
      </html>
    `;
  };

  const renderSourceView = () => {
    return (
      <div className="h-full bg-gray-900 text-gray-300 overflow-auto">
        <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
          <code>{sourceContent || 'No content to display'}</code>
        </pre>
      </div>
    );
  };

  if (!tab) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">🌐</div>
          <p>No tab selected</p>
        </div>
      </div>
    );
  }

  if (tab.isLoading) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center text-blue-400">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white relative">
      {/* View Mode Toggle */}
      {tab.filePath && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gray-800 rounded-md shadow-lg border border-gray-700">
            <button
              className={`px-3 py-1 text-xs rounded-l-md transition-colors ${
                viewMode === 'render'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setViewMode('render')}
            >
              Render
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-r-md transition-colors ${
                viewMode === 'source'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setViewMode('source')}
            >
              Source
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'render' ? (
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={tab.title}
        />
      ) : (
        renderSourceView()
      )}
    </div>
  );
};

export default RenderFrame;
