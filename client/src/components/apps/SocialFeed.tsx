import React, { useState, useEffect } from 'react';
import { useAnimations } from '../../hooks/useAnimations';
import Sidebar from './SocialFeed/Sidebar';
import Header from './SocialFeed/Header';
import PostComposer from './SocialFeed/PostComposer';
import MainContent from './SocialFeed/MainContent';
import UserProfile from './SocialFeed/UserProfile';
import { Post, User, ActiveTab, UserProfile as UserProfileType } from './SocialFeed/types';
import { mockPosts } from './SocialFeed/mockData';
import { getUserProfile } from './SocialFeed/mockUserProfiles';
import { socialFeedStyles } from './SocialFeed/styles';

const SocialFeed: React.FC = () => {
  const { fade, hacker } = useAnimations();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser] = useState<User>({
    username: 'CyberNinja',
    handle: '@cyber_ninja',
    avatar: '🥷',
    bio: 'Ethical hacker | Security researcher | Coffee addict ☕',
    followers: 1337,
    following: 420,
    reputation: 95,
    status: 'online',
    verified: true,
    joinedDate: 'March 2023',
    location: 'Cyberspace',
    website: 'darknet.ninja',
    badges: ['🛡️', '💀', '🔥']
  });
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileType | null>(null);

  useEffect(() => {
    setPosts(mockPosts);
    
    // Animate posts on load
    setTimeout(() => {
      const postElements = document.querySelectorAll('.social-post');
      postElements.forEach((post, index) => {
        setTimeout(() => {
          (post as HTMLElement).style.opacity = '1';
          fade.fadeIn(post as HTMLElement);
        }, index * 100);
      });
    }, 100);
  }, [fade]);

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );

    // Animate like button
    const button = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
    if (button) {
      hacker.accessGranted(button as HTMLElement);
    }
  };

  const handleRepost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isReposted: !post.isReposted,
              reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1
            }
          : post
      )
    );

    // Animate repost button
    const button = document.querySelector(`[data-post-id="${postId}"] .repost-btn`);
    if (button) {
      hacker.networkScan(document.querySelectorAll(`[data-post-id="${postId}"] .repost-btn`));
    }
  };

  const handleBookmark = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );

    // Animate bookmark button
    const button = document.querySelector(`[data-post-id="${postId}"] .bookmark-btn`);
    if (button) {
      hacker.accessGranted(button as HTMLElement);
    }
  };

  const handlePost = (image?: string) => {
    if (newPost.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        username: currentUser.username,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        timestamp: 'now',
        content: newPost,
        likes: 0,
        reposts: 0,
        comments: 0,
        tags: [],
        isLiked: false,
        isReposted: false,
        reputation: currentUser.reputation,
        verified: currentUser.verified,
        isBookmarked: false,
        category: 'news',
        ...(image && { image })
      };
      
      setPosts(prev => [post, ...prev]);
      setNewPost('');

      // Animate new post
      setTimeout(() => {
        const newPostElement = document.querySelector('.social-post:first-child');
        if (newPostElement) {
          (newPostElement as HTMLElement).style.opacity = '1';
          fade.fadeIn(newPostElement as HTMLElement);
        }
      }, 50);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'hacking': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 95) return 'text-green-400';
    if (reputation >= 85) return 'text-blue-400';
    if (reputation >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleUserClick = (username: string) => {
    const userProfile = getUserProfile(username);
    if (userProfile) {
      setSelectedUserProfile(userProfile);
      setActiveTab('user-profile');
    }
  };

  const handleBackToFeed = () => {
    setSelectedUserProfile(null);
    setActiveTab('feed');
  };

  const handleFollow = (username: string) => {
    // In a real app, this would make an API call
    if (selectedUserProfile && selectedUserProfile.username === username) {
      setSelectedUserProfile({
        ...selectedUserProfile,
        isFollowing: !selectedUserProfile.isFollowing,
        followers: selectedUserProfile.isFollowing 
          ? selectedUserProfile.followers - 1 
          : selectedUserProfile.followers + 1
      });
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white flex">
      <style>{socialFeedStyles}</style>
      
      {activeTab === 'user-profile' && selectedUserProfile ? (
        <UserProfile
          user={selectedUserProfile}
          currentUser={currentUser}
          onBack={handleBackToFeed}
          onFollow={handleFollow}
          handleLike={handleLike}
          handleRepost={handleRepost}
          handleBookmark={handleBookmark}
          getReputationColor={getReputationColor}
        />
      ) : (
        <>
          <Sidebar
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            getStatusColor={getStatusColor}
            getReputationColor={getReputationColor}
          />

          <div className="flex-1 flex flex-col">
            <Header activeTab={activeTab} />

            {activeTab === 'feed' && (
              <PostComposer
                currentUser={currentUser}
                newPost={newPost}
                setNewPost={setNewPost}
                handlePost={handlePost}
              />
            )}

            <MainContent
              activeTab={activeTab}
              posts={posts}
              handleLike={handleLike}
              handleRepost={handleRepost}
              handleBookmark={handleBookmark}
              getReputationColor={getReputationColor}
              onUserClick={handleUserClick}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SocialFeed;
