import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../../contexts/OSContext';
import { useToast } from '../../../hooks/use-toast';
import { BrowserTab, Bookmark } from './types';
import BrowserToolbar from './components/BrowserToolbar';
import NavigationBar from './components/NavigationBar';
import RenderFrame from './components/RenderFrame';
import FileDialog from '../../common/FileDialog';
import BookmarkManager from './components/BookmarkManager';

interface BrowserProps {
  filePath?: string;
  shouldOpenFile?: boolean;
}

const Browser: React.FC<BrowserProps> = ({ filePath, shouldOpenFile }) => {
  const { fileSystem } = useOS();
  const { toast } = useToast();
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'welcome',
      title: 'Welcome to DarkNet Browser',
      url: 'browser://welcome',
      isActive: true,
      isLoading: false,
      content: getWelcomePageHTML()
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('welcome');
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<Array<{ url: string; title: string; timestamp: Date }>>([]);

  // Supported file extensions for browser
  const supportedExtensions = ['html', 'htm', 'css', 'js', 'txt', 'md', 'json', 'xml'];

  // Handle opening file on mount
  useEffect(() => {
    if (shouldOpenFile && filePath) {
      // Close welcome tab and open the file
      openFileInBrowser(filePath);
    }
  }, [shouldOpenFile, filePath]);

  // Get active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Load file content
  const loadFile = async (filePath: string): Promise<{ content: string; error?: string }> => {
    try {
      const content = await fileSystem.readFile(filePath);
      if (content !== null) {
        return { content };
      } else {
        throw new Error('File not found or is not a readable file');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      return { 
        content: '', 
        error: error instanceof Error ? error.message : 'Failed to load file' 
      };
    }
  };

  // Open file in browser
  const openFileInBrowser = async (filePath: string) => {
    const fileName = filePath.split('/').pop() || 'Unknown';
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Check if file type is supported
    if (!supportedExtensions.includes(extension || '')) {
      toast({
        title: 'Unsupported File Type',
        description: `Cannot open .${extension} files in browser`,
        variant: 'destructive'
      });
      return;
    }

    const tabId = `file-${Date.now()}`;
    const newTab: BrowserTab = {
      id: tabId,
      title: fileName,
      url: `file://${filePath}`,
      filePath,
      isActive: true,
      isLoading: true
    };

    // Add new tab and make it active
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(newTab));
    setActiveTabId(tabId);

    // Load file content
    const { content, error } = await loadFile(filePath);
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, error, isLoading: false }
        : tab
    ));

    // Add to history
    setHistory(prev => [...prev, {
      url: `file://${filePath}`,
      title: fileName,
      timestamp: new Date()
    }]);
  };

  // Handle file selection from dialog
  const handleFileSelect = (filePath: string) => {
    setShowFileExplorer(false);
    openFileInBrowser(filePath);
  };

  // Navigate to URL
  const navigateToUrl = (url: string) => {
    if (url.startsWith('file://')) {
      const filePath = url.replace('file://', '');
      openFileInBrowser(filePath);
    } else if (url.startsWith('browser://')) {
      handleSpecialUrl(url);
    } else {
      // Handle external URLs (show warning)
      toast({
        title: 'External URL Blocked',
        description: 'This browser only supports local files for security reasons',
        variant: 'destructive'
      });
    }
  };

  // Handle special browser URLs
  const handleSpecialUrl = (url: string) => {
    switch (url) {
      case 'browser://welcome':
        if (!tabs.some(tab => tab.url === url)) {
          const tabId = `welcome-${Date.now()}`;
          const welcomeTab: BrowserTab = {
            id: tabId,
            title: 'Welcome',
            url,
            isActive: true,
            isLoading: false,
            content: getWelcomePageHTML()
          };
          setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(welcomeTab));
          setActiveTabId(tabId);
        }
        break;
      case 'browser://bookmarks':
        setShowBookmarks(true);
        break;
      case 'browser://help':
        const helpTabId = `help-${Date.now()}`;
        const helpTab: BrowserTab = {
          id: helpTabId,
          title: 'Help - DarkNet Browser',
          url,
          isActive: true,
          isLoading: false,
          content: getHelpPageHTML()
        };
        setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(helpTab));
        setActiveTabId(helpTabId);
        break;
      case 'browser://history':
        // Show history page
        break;
    }
  };

  // Create new tab
  const createNewTab = () => {
    const tabId = `new-${Date.now()}`;
    const newTab: BrowserTab = {
      id: tabId,
      title: 'New Tab',
      url: 'browser://welcome',
      isActive: true,
      isLoading: false,
      content: getWelcomePageHTML()
    };
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(newTab));
    setActiveTabId(tabId);
  };

  // Close tab
  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      // Create a new welcome tab if closing the last tab
      createNewTab();
    }
    
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        const newActiveTab = newTabs[newTabs.length - 1];
        newActiveTab.isActive = true;
        setActiveTabId(newActiveTab.id);
      }
      return newTabs;
    });
  };

  // Switch tab
  const switchTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
    setActiveTabId(tabId);
  };

  // Refresh current tab
  const refreshTab = () => {
    if (!activeTab) return;
    
    if (activeTab.filePath) {
      // Reload file
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, isLoading: true, error: undefined }
          : tab
      ));
      
      loadFile(activeTab.filePath).then(({ content, error }) => {
        setTabs(prev => prev.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, content, error, isLoading: false }
            : tab
        ));
      });
    }
  };

  // Add bookmark
  const addBookmark = (tab: BrowserTab) => {
    const bookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      title: tab.title,
      url: tab.url,
      filePath: tab.filePath,
      createdAt: new Date()
    };
    setBookmarks(prev => [...prev, bookmark]);
    toast({
      title: 'Bookmark Added',
      description: `Added "${tab.title}" to bookmarks`
    });
  };

  // Remove bookmark
  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 't':
            event.preventDefault();
            createNewTab();
            break;
          case 'w':
            event.preventDefault();
            if (tabs.length > 1) {
              closeTab(activeTabId);
            }
            break;
          case 'r':
            event.preventDefault();
            refreshTab();
            break;
          case 'd':
            event.preventDefault();
            if (activeTab) {
              addBookmark(activeTab);
            }
            break;
          case 'o':
            event.preventDefault();
            setShowFileExplorer(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, tabs.length, activeTab]);

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onNavigate={navigateToUrl}
        onRefresh={refreshTab}
        onOpenFile={() => setShowFileExplorer(true)}
        onShowBookmarks={() => setShowBookmarks(true)}
        onAddBookmark={() => activeTab && addBookmark(activeTab)}
      />

      {/* Tab Bar */}
      <BrowserToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitchTab={switchTab}
        onCloseTab={closeTab}
        onNewTab={createNewTab}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <RenderFrame
          tab={activeTab}
          onNavigate={navigateToUrl}
          onOpenFile={() => setShowFileExplorer(true)}
          onShowBookmarks={() => setShowBookmarks(true)}
          onNewTab={createNewTab}
        />
      </div>

      {/* File Explorer Modal */}
      {showFileExplorer && (
        <FileDialog
          isOpen={showFileExplorer}
          mode="open"
          title="Open File in Browser"
          supportedExtensions={supportedExtensions}
          onSelect={handleFileSelect}
          onCancel={() => setShowFileExplorer(false)}
        />
      )}

      {/* Bookmark Manager Modal */}
      {showBookmarks && (
        <BookmarkManager
          bookmarks={bookmarks}
          onOpenBookmark={(bookmark: Bookmark) => navigateToUrl(bookmark.url)}
          onRemoveBookmark={removeBookmark}
          onClose={() => setShowBookmarks(false)}
        />
      )}
    </div>
  );
};

// Welcome page HTML content
function getWelcomePageHTML(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DarkNet Browser</title>
        <style>
            body {
                margin: 0;
                padding: 40px;
                font-family: 'Courier New', monospace;
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                color: #00ff41;
                min-height: 100vh;
                box-sizing: border-box;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
            }
            h1 {
                font-size: 2.5rem;
                margin-bottom: 20px;
                text-shadow: 0 0 10px #00ff41;
                animation: glow 2s ease-in-out infinite alternate;
            }
            @keyframes glow {
                from { text-shadow: 0 0 10px #00ff41; }
                to { text-shadow: 0 0 20px #00ff41, 0 0 30px #00ff41; }
            }
            .subtitle {
                font-size: 1.2rem;
                margin-bottom: 40px;
                opacity: 0.8;
            }
            .features {
                text-align: left;
                margin: 40px 0;
                padding: 20px;
                border: 1px solid #00ff41;
                border-radius: 8px;
                background: rgba(0, 255, 65, 0.05);
            }
            .features h2 {
                color: #00ff41;
                margin-bottom: 15px;
            }
            .features ul {
                list-style: none;
                padding: 0;
            }
            .features li {
                padding: 8px 0;
                padding-left: 20px;
                position: relative;
            }
            .features li:before {
                content: "▶";
                position: absolute;
                left: 0;
                color: #00ff41;
            }
            .quick-actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 40px;
            }
            .action-card {
                padding: 20px;
                border: 1px solid #333;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            .action-card:before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.1), transparent);
                transition: left 0.6s ease;
            }
            .action-card:hover:before {
                left: 100%;
            }
            .action-card:hover {
                border-color: #00ff41;
                background: rgba(0, 255, 65, 0.1);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 255, 65, 0.2);
            }
            .action-card h3 {
                margin: 0 0 10px 0;
                color: #00ff41;
            }
            .version {
                margin-top: 40px;
                font-size: 0.9rem;
                opacity: 0.6;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🌐 DarkNet Browser</h1>
            <p class="subtitle">Secure Local File Browser for HTML & CSS Development</p>
            
            <div class="features">
                <h2>Features</h2>
                <ul>
                    <li>Open and render HTML files from your file system</li>
                    <li>CSS styling support with live preview</li>
                    <li>JavaScript execution in sandboxed environment</li>
                    <li>Built-in file explorer integration</li>
                    <li>Bookmark management for quick access</li>
                    <li>Tabbed browsing interface</li>
                    <li>Developer-friendly source code viewing</li>
                </ul>
            </div>
            
            <div class="quick-actions">
                <div class="action-card" onclick="window.parent.postMessage({action: 'openFile'}, '*')">
                    <h3>📁 Open File</h3>
                    <p>Browse and open HTML/CSS files from your system</p>
                </div>
                <div class="action-card" onclick="window.parent.postMessage({action: 'showBookmarks'}, '*')">
                    <h3>⭐ Bookmarks</h3>
                    <p>Access your saved pages and frequently used files</p>
                </div>
                <div class="action-card" onclick="window.parent.postMessage({action: 'newTab'}, '*')">
                    <h3>➕ New Tab</h3>
                    <p>Open a new browser tab</p>
                </div>
                <div class="action-card" onclick="window.parent.postMessage({action: 'help'}, '*')">
                    <h3>❓ Help</h3>
                    <p>Learn how to use the DarkNet Browser</p>
                </div>
            </div>
            
            <div class="version">
                DarkNet Browser v1.0 | Built for HackOS
                <br>
                <small>Status: ✅ Local Files | ❌ External URLs | ✅ JavaScript Sandbox</small>
            </div>
        </div>
        
        <script>
            // Handle click events from welcome page
            window.addEventListener('message', function(event) {
                // This will be handled by the parent browser component
            });
        </script>
    </body>
    </html>
  `;
}

// Help page HTML content
function getHelpPageHTML(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DarkNet Browser - Help</title>
        <style>
            body {
                margin: 0;
                padding: 40px;
                font-family: 'Courier New', monospace;
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                color: #00ff41;
                min-height: 100vh;
                box-sizing: border-box;
                line-height: 1.6;
            }
            .container {
                max-width: 900px;
                margin: 0 auto;
            }
            h1 {
                font-size: 2.2rem;
                margin-bottom: 30px;
                text-shadow: 0 0 10px #00ff41;
                text-align: center;
            }
            h2 {
                color: #00ff41;
                border-bottom: 1px solid #333;
                padding-bottom: 10px;
                margin-top: 40px;
            }
            .section {
                margin: 30px 0;
                padding: 20px;
                border: 1px solid #333;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.02);
            }
            .kbd {
                background: #333;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
                color: #00ff41;
            }
            ul {
                list-style: none;
                padding: 0;
            }
            li {
                padding: 5px 0;
                padding-left: 20px;
                position: relative;
            }
            li:before {
                content: "▶";
                position: absolute;
                left: 0;
                color: #00ff41;
            }
            .warning {
                background: rgba(255, 165, 0, 0.1);
                border: 1px solid #ffa500;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #ffa500;
            }
            .back-button {
                display: inline-block;
                padding: 10px 20px;
                background: rgba(0, 255, 65, 0.1);
                border: 1px solid #00ff41;
                border-radius: 5px;
                color: #00ff41;
                text-decoration: none;
                cursor: pointer;
                margin-top: 30px;
                transition: all 0.3s ease;
            }
            .back-button:hover {
                background: rgba(0, 255, 65, 0.2);
                transform: translateY(-1px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🛠️ DarkNet Browser Help</h1>
            
            <div class="section">
                <h2>Getting Started</h2>
                <p>DarkNet Browser is a secure, local file browser designed for HTML/CSS development and testing. It allows you to open and preview local files without connecting to the internet.</p>
            </div>

            <div class="section">
                <h2>Supported File Types</h2>
                <ul>
                    <li><strong>HTML Files:</strong> .html, .htm - Full rendering with CSS and JavaScript</li>
                    <li><strong>CSS Files:</strong> .css - Syntax highlighting and preview</li>
                    <li><strong>JavaScript Files:</strong> .js - Syntax highlighting</li>
                    <li><strong>Text Files:</strong> .txt, .md, .json, .xml - Plain text viewing</li>
                </ul>
            </div>

            <div class="section">
                <h2>Navigation</h2>
                <ul>
                    <li><strong>Address Bar:</strong> Enter file:// URLs or browser:// commands</li>
                    <li><strong>File Button:</strong> Browse your file system to open files</li>
                    <li><strong>Refresh:</strong> Reload the current file (useful for development)</li>
                    <li><strong>Bookmarks:</strong> Save and organize frequently used files</li>
                    <li><strong>Tabs:</strong> Open multiple files simultaneously</li>
                </ul>
            </div>

            <div class="section">
                <h2>Keyboard Shortcuts</h2>
                <ul>
                    <li><span class="kbd">Ctrl+T</span> - Open new tab</li>
                    <li><span class="kbd">Ctrl+W</span> - Close current tab</li>
                    <li><span class="kbd">Ctrl+R</span> - Refresh current page</li>
                    <li><span class="kbd">Ctrl+D</span> - Add current page to bookmarks</li>
                    <li><span class="kbd">Ctrl+O</span> - Open file dialog</li>
                </ul>
            </div>

            <div class="section">
                <h2>Special URLs</h2>
                <ul>
                    <li><strong>browser://welcome</strong> - Return to welcome page</li>
                    <li><strong>browser://bookmarks</strong> - Open bookmark manager</li>
                    <li><strong>browser://help</strong> - Show this help page</li>
                    <li><strong>file://path/to/file</strong> - Open local file directly</li>
                </ul>
            </div>

            <div class="warning">
                <strong>⚠️ Security Notice:</strong> This browser is designed for local file access only. External URLs are blocked for security reasons. Only local files and browser:// URLs are supported.
            </div>

            <div class="section">
                <h2>Development Tips</h2>
                <ul>
                    <li>Use the refresh button to see changes after editing files</li>
                    <li>Bookmark frequently used development files for quick access</li>
                    <li>Use multiple tabs to compare different files or versions</li>
                    <li>JavaScript will execute in a sandboxed environment</li>
                    <li>CSS @import statements work with relative paths</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <button class="back-button" onclick="window.parent.postMessage({action: 'navigate', url: 'browser://welcome'}, '*')">
                    ← Back to Welcome
                </button>
            </div>
        </div>
    </body>
    </html>
  `;
}

export default Browser;
