import React from 'react';
import { User, ActiveTab } from './types';

interface SidebarProps {
  currentUser: User;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  getStatusColor: (status: string) => string;
  getReputationColor: (reputation: number) => string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  getStatusColor,
  getReputationColor
}) => {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
      {/* User Profile */}
      <div className="mb-6 p-3 bg-gray-750 rounded-lg">
        <div className="flex items-center mb-3">
          <div className="post-avatar mr-3">
            {currentUser.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-white">{currentUser.username}</span>
              {currentUser.verified && (
                <span className="verified-badge">
                  <i className="fa fa-check"></i>
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">{currentUser.handle}</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-300 mb-3">{currentUser.bio}</div>
        
        <div className="flex justify-between text-xs">
          <span><strong>{currentUser.followers.toLocaleString()}</strong> followers</span>
          <span><strong>{currentUser.following.toLocaleString()}</strong> following</span>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs ${getStatusColor(currentUser.status)}`}>
            ● {currentUser.status}
          </span>
          <span className={`text-xs ${getReputationColor(currentUser.reputation)}`}>
            {currentUser.reputation}%
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-1 mb-6">
        <button
          onClick={() => setActiveTab('feed')}
          className={`nav-btn w-full text-left flex items-center ${
            activeTab === 'feed' ? 'active' : ''
          }`}
        >
          <i className="fa fa-home mr-3"></i>
          Feed
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`nav-btn w-full text-left flex items-center ${
            activeTab === 'trending' ? 'active' : ''
          }`}
        >
          <i className="fa fa-fire mr-3"></i>
          Trending
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`nav-btn w-full text-left flex items-center ${
            activeTab === 'profile' ? 'active' : ''
          }`}
        >
          <i className="fa fa-user mr-3"></i>
          Profile
        </button>
      </div>

      {/* Trending Topics */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-400">TRENDING</h3>
        <div className="space-y-1">
          {['#CVE2024', '#BugBounty', '#ZeroDay', '#OSINT', '#Forensics'].map((tag) => (
            <div key={tag} className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer p-1 rounded trending-topic">
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
