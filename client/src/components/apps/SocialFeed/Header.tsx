import React from 'react';
import { ActiveTab } from './types';

interface HeaderProps {
  activeTab: ActiveTab;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <h1 className="text-xl font-bold text-green-400">
        {activeTab === 'feed' && '🌐 DarkNet Social'}
        {activeTab === 'trending' && '🔥 Trending Topics'}
        {activeTab === 'profile' && '👤 Profile'}
      </h1>
    </div>
  );
};

export default Header;
