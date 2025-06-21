import React from 'react';
import { Post } from './types';
import PostItem from './PostItem';

interface PostFeedProps {
  posts: Post[];
  handleLike: (postId: string) => void;
  handleRepost: (postId: string) => void;
  handleBookmark?: (postId: string) => void;
  getReputationColor: (reputation: number) => string;
  onUserClick?: (username: string) => void;
}

const PostFeed: React.FC<PostFeedProps> = ({
  posts,
  handleLike,
  handleRepost,
  handleBookmark,
  getReputationColor,
  onUserClick
}) => {
  return (
    <div>
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          handleLike={handleLike}
          handleRepost={handleRepost}
          handleBookmark={handleBookmark}
          getReputationColor={getReputationColor}
          onUserClick={onUserClick}
        />
      ))}
    </div>
  );
};

export default PostFeed;
