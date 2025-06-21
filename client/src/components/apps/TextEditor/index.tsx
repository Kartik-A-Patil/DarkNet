import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useOS } from '../../../contexts/OSContext';
import { EditorTab, EditorSettings, TextEditorProps } from './types';
import { createNewTab, getFileExtensions, isTabUnsaved, loadSettings, saveSettings, getDefaultSettings } from './utils';

// Components
import TabBar from './components/TabBar';
import Toolbar from './components/Toolbar';
import EditorView from './components/EditorView';
import StatusBar from './components/StatusBar';
import SettingsPanel from './components/SettingsPanel';
import UnsavedChangesDialog from './components/UnsavedChangesDialog';
import FileDialog from '../../common/FileDialog';

// Styles
import './styles.css';

const TextEditor: React.FC<TextEditorProps> = ({
  filePath: initialFilePath,
  initialContent
}) => {
  const { fileSystem } = useOS();

  // State
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [showSettings, setShowSettings] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [tabToClose, setTabToClose] = useState<string | null>(null);

  // Settings with persistence
  const [settings, setSettings] = useState<EditorSettings>(() => {
    const defaultSettings = getDefaultSettings();
    const savedSettings = loadSettings();
    return { ...defaultSettings, ...savedSettings };
  });

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Memoize supported extensions to prevent re-renders
  const supportedExtensions = useMemo(() => getFileExtensions(), []);

  // Get active tab
  const activeTab = useMemo(
    () => tabs.find(tab => tab.id === activeTabId) || null,
    [tabs, activeTabId]
  );

  // Initialize editor
  useEffect(() => {
    const initialize = async () => {
      if (initialFilePath) {
        try {
          const newTab = createNewTab(initialFilePath, initialContent || '');
          setTabs([newTab]);
          setActiveTabId(newTab.id);

          if (!initialContent) {
            setIsLoading(true);
            const content = await fileSystem.readFile(initialFilePath);
            if (content !== null) {
              setTabs(prev => prev.map(tab => 
                tab.id === newTab.id 
                  ? { ...tab, content, saved: true }
                  : tab
              ));
            }
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error initializing editor:', error);
          createNewEmptyTab();
        }
      } else {
        createNewEmptyTab();
      }
    };

    if (tabs.length === 0) {
      initialize();
    }
  }, [initialFilePath, initialContent, fileSystem, tabs.length]);

  // Create new empty tab
  const createNewEmptyTab = useCallback(() => {
    const newTab = createNewTab();
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  // Handle content change
  const handleContentChange = useCallback((content: string) => {
    if (!activeTabId) return;

    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? { ...tab, content, saved: false }
        : tab
    ));
  }, [activeTabId]);

  // Tab operations
  const handleTabClick = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const handleTabClose = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && isTabUnsaved(tab)) {
      setTabToClose(tabId);
      setShowUnsavedDialog(true);
    } else {
      closeTabDirectly(tabId);
    }
  }, [tabs]);

  const closeTabDirectly = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(t => t.id !== tabId));
    
    if (tabId === activeTabId) {
      const remainingTabs = tabs.filter(t => t.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id);
      } else {
        createNewEmptyTab();
      }
    }
  }, [activeTabId, tabs, createNewEmptyTab]);

  // File operations
  const handleNewFile = useCallback(() => {
    createNewEmptyTab();
  }, [createNewEmptyTab]);

  const handleOpenFile = useCallback(() => {
    setShowOpenDialog(true);
  }, []);

  const handleSaveFile = useCallback(async () => {
    if (!activeTab) return;

    if (!activeTab.filePath) {
      setShowSaveDialog(true);
      return;
    }

    try {
      const success = await fileSystem.writeFile(activeTab.filePath, activeTab.content);
      if (success) {
        setTabs(prev => prev.map(tab =>
          tab.id === activeTab.id
            ? { ...tab, saved: true }
            : tab
        ));
      } else {
        alert('Failed to save file. Please try Save As.');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file. Please try Save As.');
    }
  }, [activeTab, fileSystem]);

  const handleSaveAs = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  // Dialog handlers
  const handleFileOpen = useCallback(async (path: string) => {
    try {
      const node = await fileSystem.getNodeFromPath(path);
      if (node && node.type !== 'directory') {
        const existingTab = tabs.find(tab => tab.filePath === path);
        if (existingTab) {
          setActiveTabId(existingTab.id);
        } else {
          setIsLoading(true);
          const newTab = createNewTab(path);
          setTabs(prev => [...prev, newTab]);
          setActiveTabId(newTab.id);
          
          const content = await fileSystem.readFile(path);
          if (content !== null) {
            setTabs(prev => prev.map(tab =>
              tab.id === newTab.id
                ? { ...tab, content, saved: true }
                : tab
            ));
          }
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error opening file:', error);
      alert(`Error opening file: ${path}`);
    }
    setShowOpenDialog(false);
  }, [tabs, fileSystem]);

  const handleFileSave = useCallback(async (path: string) => {
    if (!activeTab) return;

    try {
      const success = await fileSystem.writeFile(path, activeTab.content);
      if (success) {
        setTabs(prev => prev.map(tab =>
          tab.id === activeTab.id
            ? {
                ...tab,
                filePath: path,
                fileName: path.split('/').pop() || 'Untitled',
                saved: true
              }
            : tab
        ));
        
        if (tabToClose) {
          closeTabDirectly(tabToClose);
          setTabToClose(null);
        }
      } else {
        alert('Failed to save file. Please check the file path.');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file. Please try again.');
    }
    setShowSaveDialog(false);
  }, [activeTab, fileSystem, tabToClose, closeTabDirectly]);

  const handleUnsavedSave = useCallback(async () => {
    if (!tabToClose) return;
    
    const tab = tabs.find(t => t.id === tabToClose);
    if (!tab) return;

    if (tab.filePath) {
      const success = await fileSystem.writeFile(tab.filePath, tab.content);
      if (success) {
        closeTabDirectly(tabToClose);
      } else {
        setShowSaveDialog(true);
      }
    } else {
      setShowSaveDialog(true);
    }
    
    setShowUnsavedDialog(false);
  }, [tabToClose, tabs, fileSystem, closeTabDirectly]);

  const handleUnsavedDontSave = useCallback(() => {
    if (tabToClose) {
      closeTabDirectly(tabToClose);
    }
    setShowUnsavedDialog(false);
    setTabToClose(null);
  }, [tabToClose, closeTabDirectly]);

  const handleUnsavedCancel = useCallback(() => {
    setShowUnsavedDialog(false);
    setTabToClose(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            handleNewFile();
            break;
          case 'o':
            e.preventDefault();
            handleOpenFile();
            break;
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              handleSaveAs();
            } else {
              handleSaveFile();
            }
            break;
          case 't':
            e.preventDefault();
            createNewEmptyTab();
            break;
          case 'w':
            e.preventDefault();
            if (activeTabId) {
              handleTabClose(activeTabId);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewFile, handleOpenFile, handleSaveFile, handleSaveAs, createNewEmptyTab, activeTabId, handleTabClose]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-center">
          <i className="fa fa-spinner fa-spin text-2xl mb-2"></i>
          <p>Loading file...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-editor h-full flex flex-col bg-gray-900 text-white">
      <Toolbar
        activeTab={activeTab}
        settings={settings}
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onSaveAs={handleSaveAs}
        onToggleSettings={() => setShowSettings(true)}
        canSave={activeTab !== null && (!activeTab.saved || !activeTab.filePath)}
      />

      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onNewTab={createNewEmptyTab}
      />

      <EditorView
        activeTab={activeTab}
        settings={settings}
        onContentChange={handleContentChange}
      />

      <StatusBar
        activeTab={activeTab}
        settings={settings}
      />

      {/* Dialogs */}
      <SettingsPanel
        isOpen={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={setSettings}
      />

      <FileDialog
        isOpen={showOpenDialog}
        mode="open"
        title="Open File"
        supportedExtensions={supportedExtensions}
        onSelect={handleFileOpen}
        onCancel={() => setShowOpenDialog(false)}
      />

      <FileDialog
        isOpen={showSaveDialog}
        mode="save"
        title="Save File"
        initialFileName={activeTab?.fileName || 'untitled.txt'}
        onSelect={handleFileSave}
        onCancel={() => {
          setShowSaveDialog(false);
          setTabToClose(null);
        }}
      />

      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        fileName={tabs.find(t => t.id === tabToClose)?.fileName || 'Untitled'}
        onSave={handleUnsavedSave}
        onDontSave={handleUnsavedDontSave}
        onCancel={handleUnsavedCancel}
      />
    </div>
  );
};

export default TextEditor;
