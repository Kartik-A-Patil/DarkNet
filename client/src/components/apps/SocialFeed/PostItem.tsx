import React, { useState } from 'react';
import { Post } from './types';

interface PostItemProps {
  post: Post;
  handleLike: (postId: string) => void;
  handleRepost: (postId: string) => void;
  handleBookmark?: (postId: string) => void;
  getReputationColor: (reputation: number) => string;
  onUserClick?: (username: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  handleLike,
  handleRepost,
  handleBookmark,
  getReputationColor,
  onUserClick
}) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'exploit': return 'category-exploit';
      case 'research': return 'category-research';
      case 'news': return 'category-news';
      case 'tutorial': return 'category-tutorial';
      case 'question': return 'category-question';
      default: return 'category-news';
    }
  };

  const openImageModal = () => {
    if (post.imageUrl) {
      setImageModalOpen(true);
    }
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
  };

  return (
    <>
      <div
        data-post-id={post.id}
        className="social-post bg-gray-800 border-b border-gray-700 p-4 transition-colors opacity-0"
      >
        <div className="flex items-start space-x-3">
          <div className="post-avatar">
            {post.avatar}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Post Header */}
            <div className="flex items-center space-x-2 mb-2">
              <span 
                className="font-semibold text-white cursor-pointer hover:underline"
                onClick={() => onUserClick?.(post.username)}
              >
                {post.username}
              </span>
              {post.verified && (
                <span className="verified-badge">
                  <i className="fa fa-check"></i>
                </span>
              )}
              <span 
                className="text-gray-400 text-sm cursor-pointer hover:underline"
                onClick={() => onUserClick?.(post.username)}
              >
                {post.handle}
              </span>
              <span className={`text-xs ${getReputationColor(post.reputation)}`}>
                {post.reputation}%
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500 text-sm cursor-pointer hover:underline">
                {post.timestamp}
              </span>
              {post.category && (
                <span className={`category-badge ${getCategoryColor(post.category)}`}>
                  {post.category}
                </span>
              )}
            </div>
            
            {/* Post Content */}
            <div className="text-white leading-relaxed mb-3">
              {post.content.split(' ').map((word, index) => {
                if (word.startsWith('#')) {
                  return (
                    <span key={index} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                      {word}{' '}
                    </span>
                  );
                }
                return word + ' ';
              })}
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="mb-3">
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="post-image w-full max-h-64 object-cover cursor-pointer"
                  onClick={openImageModal}
                  onError={(e) => {
                    console.error('Image failed to load:', post.imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="post-tag text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center space-x-6 text-gray-400">
              <button
                onClick={() => handleLike(post.id)}
                className={`action-btn like-btn flex items-center space-x-1 ${
                  post.isLiked ? 'liked' : ''
                }`}
              >
                <i className={`fa ${post.isLiked ? 'fa-heart' : 'fa-heart-o'}`}></i>
                <span>{post.likes.toLocaleString()}</span>
              </button>
              
              <button className="action-btn comment-btn flex items-center space-x-1">
                <i className="fa fa-comment-o"></i>
                <span>{post.comments.toLocaleString()}</span>
              </button>
              
              <button
                onClick={() => handleRepost(post.id)}
                className={`action-btn repost-btn flex items-center space-x-1 ${
                  post.isReposted ? 'reposted' : ''
                }`}
              >
                <i className="fa fa-retweet"></i>
                <span>{post.reposts.toLocaleString()}</span>
              </button>
              
              {handleBookmark && (
                <button
                  onClick={() => handleBookmark(post.id)}
                  className={`action-btn bookmark-btn ${
                    post.isBookmarked ? 'bookmarked' : ''
                  }`}
                >
                  <i className={`fa ${post.isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                </button>
              )}
              
              <button className="action-btn share-btn">
                <i className="fa fa-share"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && post.imageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white rounded-full p-2 hover:bg-opacity-100"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostItem;
