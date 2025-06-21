export interface Post {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  likes: number;
  reposts: number;
  comments: number;
  tags: string[];
  isLiked: boolean;
  isReposted: boolean;
  reputation: number;
  verified?: boolean;
  isBookmarked?: boolean;
  category?: 'exploit' | 'research' | 'news' | 'tutorial' | 'question';
}

export interface User {
  username: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  reputation: number;
  status: 'online' | 'offline' | 'hacking';
  verified?: boolean;
  joinedDate?: string;
  location?: string;
  website?: string;
  badges?: string[];
}

export interface UserProfile extends User {
  posts: Post[];
  postsCount: number;
  memberSince: string;
  lastSeen: string;
  specializations: string[];
  achievements: string[];
  isFollowing?: boolean;
}

export type ActiveTab = 'feed' | 'trending' | 'profile' | 'user-profile';
