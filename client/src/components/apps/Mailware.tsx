import React, { useState, useEffect } from 'react';
import { useOS } from '../../contexts/OSContext';

// Global variable for admin email (easy to change)
const ADMIN_EMAIL = 'admin@gmail.com';

// Types for our email app
interface Email {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: {
    name: string;
    email: string;
  };
  subject: string;
  body: string;
  timestamp: Date;
  read: boolean;
  folder: string;
  hasAttachment: boolean;
}

interface EmailFolder {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

// Mock data for emails
const generateMockEmails = (count: number = 50): Email[] => {
  const senders = [
    { name: 'Alex Thompson', email: 'alex.t@darkmail.onion' },
    { name: 'Morgan Blake', email: 'mblake@securecom.net' },
    { name: 'Jamie Rivers', email: 'jrivers@encrypt.io' },
    { name: 'Admin', email: ADMIN_EMAIL },
    { name: 'Shadow Services', email: 'no-reply@shadow-services.onion' },
    { name: 'Crypto Exchange', email: 'support@crypto-ex.io' },
    { name: 'Dana Kim', email: 'dana@privatemail.com' },
    { name: 'Network Sentinel', email: 'alerts@netsentinel.io' },
    { name: 'Dark Forum', email: 'notifications@darkforum.onion' },
    { name: 'System Administrator', email: 'sysadmin@system.local' }
  ];
  
  const subjects = [
    'Security Alert: Unusual Activity Detected',
    'Your encrypted message has been delivered',
    'New login from unknown location',
    'Invitation to private network',
    'Action Required: Verify your identity',
    'Firewall update available',
    'System Notification: Storage at 85% capacity',
    'New secure channel established',
    'Your order #38291 has been processed',
    'Your account password was changed',
    'Network scan results available',
    'Subscription expiring soon',
    'Vulnerability detected in your system',
    'Verification code: 283940',
    'Weekly security report'
  ];
  
  const bodyTemplates = [
    'We have detected unusual login activity on your account from IP address 192.168.1.1. If this was not you, please secure your account immediately.',
    'Your encrypted message has been successfully delivered to the recipient. Self-destruct timer has been initiated.',
    'This is an automated message to inform you that your system scan completed successfully. No vulnerabilities were detected.',
    'Please find attached the requested documents. The password for the encrypted archive was sent through separate channel.',
    'The network configuration changes have been applied successfully. All services are running normally.',
    'Your subscription will expire in 7 days. Please renew to maintain uninterrupted access to our services.',
    'This is a reminder that your secure storage allocation is reaching its limit. Please consider upgrading or removing unused data.',
    'The transaction you initiated has been confirmed. The funds have been transferred using our secure protocol.',
    'Your request for access has been approved. You now have level 3 clearance to the requested resources.',
    'System alert: Multiple failed authentication attempts have been blocked. Your security protocols are functioning correctly.'
  ];
  
  const folders = ['inbox', 'sent', 'trash'];
  
  return Array.from({ length: count }, (_, i) => {
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const recipient = { name: 'Hackos User', email: 'user@hackos.local' };
    const folder = folders[Math.floor(Math.random() * folders.length)];
    const isInSent = folder === 'sent';
    
    // If it's in sent folder, swap sender and recipient
    const from = isInSent ? recipient : sender;
    const to = isInSent ? sender : recipient;
    
    // Generate random date within the last 30 days
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: `email-${i + 1}`,
      from,
      to,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      body: bodyTemplates[Math.floor(Math.random() * bodyTemplates.length)] +
        '\n\n' + 'This is additional text to make the email longer. ' +
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Nullam euismod, nisi vel consectetur euismod, nisi nisl consectetur nisi, ' +
        'euismod nisi nisl euismod nisi.\n\nRegards,\n' + from.name,
      timestamp,
      read: Math.random() > 0.3, // 70% chance of being read
      folder,
      hasAttachment: Math.random() > 0.7 // 30% chance of having attachment
    };
  });
};

const Mailware: React.FC = () => {
  // OS context for window management
  const { isSudoMode } = useOS();
  
  // State
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeTab, setActiveTab] = useState<'mail' | 'settings'>('mail');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  });

  // State for resizable panes
  const [listWidth, setListWidth] = useState<number>(35); // Default percentage width
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Handle mouse down to start resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle mouse move while resizing
  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (isDragging) {
        // Calculate width percentage based on mouse position
        const containerWidth = document.querySelector('.mail-container')?.clientWidth || 1;
        const percentage = (e.clientX / containerWidth) * 100;
        
        // Constrain width between 20% and 80%
        const constrainedWidth = Math.max(20, Math.min(80, percentage));
        setListWidth(constrainedWidth);
      }
    };

    const handleResizeEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isDragging]);
  
  // Initialize mock emails
  useEffect(() => {
    setEmails(generateMockEmails());
  }, []);
  
  // Email folders - simplified to just inbox, sent, trash
  const folders: EmailFolder[] = [
    { id: 'inbox', name: 'Inbox', icon: 'fa-inbox' },
    { id: 'sent', name: 'Sent', icon: 'fa-paper-plane' },
    { id: 'trash', name: 'Trash', icon: 'fa-trash-alt' },
  ];
  
  // Update folder counts
  const foldersWithCount = folders.map(folder => {
    const count = emails.filter(email => email.folder === folder.id).length;
    return { ...folder, count };
  });
  
  // Get emails for selected folder
  const getFilteredEmails = () => {
    let filteredEmails = emails.filter(email => email.folder === selectedFolder);
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredEmails = filteredEmails.filter(email => 
        email.from.name.toLowerCase().includes(query) ||
        email.subject.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query)
      );
    }
    
    // Sort by timestamp (newest first)
    return filteredEmails.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  };
  
  // Mark email as read
  const markAsRead = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, read: true } : email
    ));
  };
  
  // Delete email (move to trash)
  const deleteEmail = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, folder: 'trash' } : email
    ));
    
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const emailDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    
    if (emailDate === today) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };
  
  // Handle compose email form changes
  const handleComposeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setComposeData({
      ...composeData,
      [name]: value
    });
  };
  
  // Send email
  const sendEmail = () => {
    const newEmail: Email = {
      id: `email-${Date.now()}`,
      from: {
        name: 'Hackos User',
        email: 'user@hackos.local'
      },
      to: {
        name: composeData.to,
        email: composeData.to
      },
      subject: composeData.subject,
      body: composeData.body,
      timestamp: new Date(),
      read: true,
      folder: 'sent',
      hasAttachment: false
    };
    
    setEmails([...emails, newEmail]);
    setShowComposeModal(false);
    setComposeData({
      to: '',
      subject: '',
      body: ''
    });
  };
  
  // Get unread count for folder
  const getUnreadCount = (folderId: string) => {
    return emails.filter(email => email.folder === folderId && !email.read).length;
  };

  // Check if email is from admin
  const isAdminEmail = (email: string) => {
    return email === ADMIN_EMAIL;
  };

  // Close the selected email
  const closeEmail = () => {
    setSelectedEmail(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with compose button, folders and tabs moved to bottom */}
        <div className="w-16 md:w-36 lg:w-48 bg-gray-800 flex flex-col border-r border-gray-700">
          {/* Compose Button */}
          <button 
            className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 md:rounded-lg md:py-2 md:px-4 m-2 flex items-center justify-center"
            onClick={() => setShowComposeModal(true)}
          >
            <i className="fa fa-plus md:mr-2"></i>
            <span className="hidden md:inline">Compose</span>
          </button>
          
          {/* Folders */}
          <div className="flex-1 overflow-y-auto mt-2">
            {foldersWithCount.map(folder => (
              <div 
                key={folder.id}
                className={`p-2 mb-1 flex items-center justify-between cursor-pointer ${
                  selectedFolder === folder.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setSelectedEmail(null);
                  setActiveTab('mail'); 
                }}
              >
                <div className="flex items-center">
                  <i className={`fa ${folder.icon} w-5 text-gray-400`}></i>
                  <span className="hidden md:inline ml-2">{folder.name}</span>
                </div>
                {getUnreadCount(folder.id) > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getUnreadCount(folder.id)}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Tabs moved to sidebar bottom */}
          <div className="border-t border-gray-700 p-2">
            <div className="flex flex-col space-y-1">
              <button 
                className={`p-2 rounded text-left flex items-center ${activeTab === 'mail' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('mail')}
              >
                <i className="fa fa-envelope w-5 text-center"></i>
                <span className="hidden md:inline ml-2">Mail</span>
              </button>
              <button 
                className={`p-2 rounded text-left flex items-center ${activeTab === 'settings' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('settings')}
              >
                <i className="fa fa-cog w-5 text-center"></i>
                <span className="hidden md:inline ml-2">Settings</span>
              </button>
            </div>
          </div>
        </div>
        
        {activeTab === 'mail' && (
          <div className="flex flex-1 overflow-hidden mail-container">
            {/* Email List with search bar at top */}
            {selectedEmail ? (
              <div 
                className="border-r border-gray-700 flex flex-col overflow-hidden"
                style={{ width: `${listWidth}%` }}
              >
                {/* Search bar moved to top of mail list */}
                <div className="border-b border-gray-700 p-3 bg-gray-800">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search emails"
                      className="bg-gray-900 w-full px-3 py-1.5 rounded pl-8 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <i className="fa fa-search absolute left-2.5 top-2.5 text-gray-500"></i>
                  </div>
                </div>
                
                <div className="border-b border-gray-700 p-3 flex items-center justify-between">
                  <div className="font-medium">{selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)}</div>
                  <div className="text-sm text-gray-400">{getFilteredEmails().length} emails</div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {getFilteredEmails().length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No emails in this folder
                    </div>
                  ) : (
                    getFilteredEmails().map(email => (
                      <div 
                        key={email.id}
                        className={`border-b border-gray-700 p-3 cursor-pointer ${
                          selectedEmail?.id === email.id ? 'bg-gray-800' : email.read ? '' : 'bg-gray-800 bg-opacity-60'
                        } hover:bg-gray-700 ${isAdminEmail(email.from.email) ? 'border-l-4 border-l-red-500' : ''}`}
                        onClick={() => {
                          setSelectedEmail(email);
                          if (!email.read) {
                            markAsRead(email.id);
                          }
                        }}
                      >
                        <div className="flex items-center mb-1">
                          <div className={`flex-1 font-medium ${!email.read ? 'text-white' : 'text-gray-400'}`}>
                            {selectedFolder === 'sent' ? `To: ${email.to.name || email.to.email}` : email.from.name}
                            {isAdminEmail(email.from.email) && 
                              <span className="ml-2 bg-red-500 text-xs text-white px-1.5 py-0.5 rounded-full">Admin</span>
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(email.timestamp)}
                          </div>
                        </div>
                        <div className={`${!email.read ? 'font-medium' : ''} truncate`}>
                          {email.subject}
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="text-xs text-gray-500 truncate flex-1">
                            {email.body.substring(0, 60)}...
                          </div>
                          {email.hasAttachment && (
                            <i className="fa fa-paperclip text-gray-500 ml-1"></i>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 border-r border-gray-700 flex flex-col overflow-hidden">
                {/* Search bar moved to top of mail list */}
                <div className="border-b border-gray-700 p-3 bg-gray-800">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search emails"
                      className="bg-gray-900 w-full px-3 py-1.5 rounded pl-8 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <i className="fa fa-search absolute left-2.5 top-2.5 text-gray-500"></i>
                  </div>
                </div>
                
                <div className="border-b border-gray-700 p-3 flex items-center justify-between">
                  <div className="font-medium">{selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)}</div>
                  <div className="text-sm text-gray-400">{getFilteredEmails().length} emails</div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {getFilteredEmails().length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No emails in this folder
                    </div>
                  ) : (
                    getFilteredEmails().map(email => (
                      <div 
                        key={email.id}
                        className={`border-b border-gray-700 p-3 cursor-pointer ${
                          selectedEmail?.id === email.id ? 'bg-gray-800' : email.read ? '' : 'bg-gray-800 bg-opacity-60'
                        } hover:bg-gray-700 ${isAdminEmail(email.from.email) ? 'border-l-4 border-l-red-500' : ''}`}
                        onClick={() => {
                          setSelectedEmail(email);
                          if (!email.read) {
                            markAsRead(email.id);
                          }
                        }}
                      >
                        <div className="flex items-center mb-1">
                          <div className={`flex-1 font-medium ${!email.read ? 'text-white' : 'text-gray-400'}`}>
                            {selectedFolder === 'sent' ? `To: ${email.to.name || email.to.email}` : email.from.name}
                            {isAdminEmail(email.from.email) && 
                              <span className="ml-2 bg-red-500 text-xs text-white px-1.5 py-0.5 rounded-full">Admin</span>
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(email.timestamp)}
                          </div>
                        </div>
                        <div className={`${!email.read ? 'font-medium' : ''} truncate`}>
                          {email.subject}
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="text-xs text-gray-500 truncate flex-1">
                            {email.body.substring(0, 60)}...
                          </div>
                          {email.hasAttachment && (
                            <i className="fa fa-paperclip text-gray-500 ml-1"></i>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* Resizable divider */}
            {selectedEmail && (
              <div 
                className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize"
                onMouseDown={handleResizeStart}
              ></div>
            )}
            
            {/* Email Viewer */}
            {selectedEmail && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b border-gray-700 p-3 flex items-center justify-between bg-gray-800">
                  <div className="flex items-center">
                    <button
                      className="p-1.5 rounded hover:bg-gray-700 mr-2"
                      onClick={closeEmail}
                      title="Close email"
                    >
                      <i className="fa fa-times"></i>
                    </button>
                    <h2 className="font-medium truncate">{selectedEmail.subject}</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-1.5 rounded hover:bg-gray-700"
                      title="Reply"
                    >
                      <i className="fa fa-reply"></i>
                    </button>
                    <button 
                      className="p-1.5 rounded hover:bg-gray-700"
                      onClick={() => deleteEmail(selectedEmail.id)}
                      title="Delete email"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div className={`bg-gray-800 p-4 ${isAdminEmail(selectedEmail.from.email) ? 'border-l-4 border-l-red-500' : ''}`}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full ${isAdminEmail(selectedEmail.from.email) ? 'bg-red-500' : 'bg-gray-600'} flex items-center justify-center text-lg mr-3`}>
                      {selectedEmail.from.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium flex items-center">
                        {selectedEmail.from.name}
                        {isAdminEmail(selectedEmail.from.email) && 
                          <span className="ml-2 bg-red-500 text-xs text-white px-1.5 py-0.5 rounded-full">Admin</span>
                        }
                      </div>
                      <div className="text-sm text-gray-400">{selectedEmail.from.email}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedEmail.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    To: {selectedEmail.to.name} &lt;{selectedEmail.to.email}&gt;
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="whitespace-pre-wrap">
                    {selectedEmail.body}
                  </div>
                  
                  {selectedEmail.hasAttachment && (
                    <div className="mt-6 border-t border-gray-700 pt-4">
                      <div className="text-sm font-medium mb-2">Attachments</div>
                      <div className="bg-gray-800 rounded p-2 inline-flex items-center">
                        <i className="fa fa-file-pdf text-red-500 mr-2"></i>
                        <span>document.pdf</span>
                        <span className="text-xs text-gray-500 mx-2">(2.4 MB)</span>
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <i className="fa fa-download text-gray-400"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h2 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Mail Settings</h2>
              
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2 text-blue-400">Account</h3>
                <div className="bg-gray-900 p-4 rounded">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-400">Email address:</div>
                    <div>user@hackos.local</div>
                    <div className="text-gray-400">Name:</div>
                    <div>Hackos User</div>
                    <div className="text-gray-400">Storage used:</div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-700 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{width: '35%'}}></div>
                      </div>
                      <span className="text-sm">35%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2 text-blue-400">Privacy</h3>
                <div className="bg-gray-900 p-4 rounded">
                  <div className="flex items-center mb-3">
                    <input type="checkbox" id="block-remote-content" className="mr-2" defaultChecked />
                    <label htmlFor="block-remote-content">Block remote content in messages</label>
                  </div>
                  <div className="flex items-center mb-3">
                    <input type="checkbox" id="hide-ip" className="mr-2" defaultChecked />
                    <label htmlFor="hide-ip">Hide IP address in outgoing emails</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="encrypt-emails" className="mr-2" defaultChecked />
                    <label htmlFor="encrypt-emails">Encrypt all emails by default</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2 text-blue-400">Appearance</h3>
                <div className="bg-gray-900 p-4 rounded">
                  <div className="flex items-center mb-3">
                    <div className="w-24 text-gray-400">View mode:</div>
                    <select className="bg-gray-800 border border-gray-700 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-400">
                      <option>Compact view</option>
                      <option>Default view</option>
                      <option>Comfortable view</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-24 text-gray-400">Theme:</div>
                    <select className="bg-gray-800 border border-gray-700 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-400">
                      <option>Dark (Default)</option>
                      <option>Darker</option>
                      <option>High Contrast</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl border border-gray-700">
            <div className="border-b border-gray-700 py-3 px-4 flex items-center justify-between">
              <h3 className="font-medium">New Message</h3>
              <button 
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800"
                onClick={() => setShowComposeModal(false)}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center mb-2 border-b border-gray-700 pb-2">
                  <label className="w-16 text-gray-400">To:</label>
                  <input 
                    type="text"
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none"
                    name="to"
                    value={composeData.to}
                    onChange={handleComposeChange}
                  />
                </div>
                <div className="flex items-center border-b border-gray-700 pb-2">
                  <label className="w-16 text-gray-400">Subject:</label>
                  <input 
                    type="text"
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none"
                    name="subject"
                    value={composeData.subject}
                    onChange={handleComposeChange}
                  />
                </div>
              </div>
              <textarea
                className="w-full h-64 bg-gray-800 p-3 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                placeholder="Write your message here..."
                name="body"
                value={composeData.body}
                onChange={handleComposeChange}
              ></textarea>
              <div className="mt-4 flex justify-between items-center">
                <button className="p-2 hover:bg-gray-800 rounded" title="Attach file">
                  <i className="fa fa-paperclip"></i>
                </button>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                    onClick={() => setShowComposeModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`px-3 py-1 rounded ${
                      !composeData.to || !composeData.subject 
                      ? 'bg-blue-900 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    onClick={sendEmail}
                    disabled={!composeData.to || !composeData.subject}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mailware;