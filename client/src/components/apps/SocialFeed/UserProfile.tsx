import React from 'react';
import { UserProfile, Post } from './types';
import PostItem from './PostItem';

interface UserProfileProps {
  user: UserProfile;
  currentUser: { username: string };
  onBack: () => void;
  onFollow?: (username: string) => void;
  handleLike: (postId: string) => void;
  handleRepost: (postId: string) => void;
  handleBookmark?: (postId: string) => void;
  getReputationColor: (reputation: number) => string;
}

const UserProfileComponent: React.FC<UserProfileProps> = ({
  user,
  currentUser,
  onBack,
  onFollow,
  handleLike,
  handleRepost,
  handleBookmark,
  getReputationColor
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'hacking': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'hacking': return '💀';
      case 'offline': return '⚫';
      default: return '⚫';
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fa fa-arrow-left text-lg"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{user.username}</h1>
              <p className="text-sm text-gray-400">{user.postsCount} posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="text-6xl">{user.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                {user.verified && <span className="text-blue-400">✓</span>}
                {user.badges?.map((badge, index) => (
                  <span key={index} className="text-xl">{badge}</span>
                ))}
              </div>
              <p className="text-gray-300 mb-1">{user.handle}</p>
              <div className="flex items-center space-x-2 mb-3">
                <span className={`text-sm ${getStatusColor(user.status)}`}>
                  {getStatusIcon(user.status)} {user.status}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-400">Last seen: {user.lastSeen}</span>
              </div>
              <p className="text-gray-300 mb-4">{user.bio}</p>
              
              {/* User Stats */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{user.followers.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{user.following.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Following</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getReputationColor(user.reputation)}`}>
                    {user.reputation}
                  </div>
                  <div className="text-xs text-gray-400">Reputation</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{user.postsCount}</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-400 mb-4">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <i className="fa fa-map-marker"></i>
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center space-x-1">
                    <i className="fa fa-link"></i>
                    <a href={`https://${user.website}`} className="text-blue-400 hover:text-blue-300">
                      {user.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <i className="fa fa-calendar"></i>
                  <span>Joined {user.memberSince}</span>
                </div>
              </div>

              {/* Specializations */}
              {user.specializations && user.specializations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-green-400 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {user.achievements && user.achievements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Achievements</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.achievements.map((achievement, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-900 text-yellow-400 text-xs rounded-full"
                      >
                        🏆 {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {currentUser.username !== user.username && (
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => onFollow?.(user.username)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  user.isFollowing
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="border-b border-gray-700">
        <div className="flex">
          <button className="flex-1 p-4 text-center text-white bg-gray-800 border-b-2 border-green-500">
            Posts
          </button>
          <button className="flex-1 p-4 text-center text-gray-400 hover:text-white transition-colors">
            Replies
          </button>
          <button className="flex-1 p-4 text-center text-gray-400 hover:text-white transition-colors">
            Media
          </button>
        </div>
      </div>

      {/* User Posts */}
      <div className="divide-y divide-gray-700">
        {user.posts.length > 0 ? (
          user.posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              handleLike={handleLike}
              handleRepost={handleRepost}
              handleBookmark={handleBookmark}
              getReputationColor={getReputationColor}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-400">
            <i className="fa fa-ghost text-4xl mb-4"></i>
            <p className="text-lg mb-2">No posts yet</p>
            <p className="text-sm">This user hasn't shared anything in the shadows yet...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileComponent;
