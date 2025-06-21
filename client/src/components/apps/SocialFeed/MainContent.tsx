import React from 'react';
import { ActiveTab } from './types';
import PostFeed from './PostFeed';
import { Post } from './types';

interface MainContentProps {
  activeTab: ActiveTab;
  posts: Post[];
  handleLike: (postId: string) => void;
  handleRepost: (postId: string) => void;
  handleBookmark?: (postId: string) => void;
  getReputationColor: (reputation: number) => string;
  onUserClick?: (username: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  posts,
  handleLike,
  handleRepost,
  handleBookmark,
  getReputationColor,
  onUserClick
}) => {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {activeTab === 'feed' && (
        <PostFeed
          posts={posts}
          handleLike={handleLike}
          handleRepost={handleRepost}
          handleBookmark={handleBookmark}
          getReputationColor={getReputationColor}
          onUserClick={onUserClick}
        />
      )}

      {activeTab === 'trending' && (
        <PostFeed
          posts={posts.filter(post => post.category === 'exploit' || post.category === 'research')}
          handleLike={handleLike}
          handleRepost={handleRepost}
          handleBookmark={handleBookmark}
          getReputationColor={getReputationColor}
          onUserClick={onUserClick}
        />
      )}

      {activeTab === 'profile' && (
        <div className="p-6">
          <div className="text-center text-gray-400">
            <i className="fa fa-user text-4xl mb-4"></i>
            <h2 className="text-xl font-semibold text-white mb-2">Profile</h2>
            <p>Profile management coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
