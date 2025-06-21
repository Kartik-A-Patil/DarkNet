import { UserProfile } from './types';

// Mock user profiles for demonstration
export const mockUserProfiles: Record<string, UserProfile> = {
  'WhiteHat_Alice': {
    username: 'WhiteHat_Alice',
    handle: '@whitehatalice',
    avatar: '👩‍💻',
    bio: 'Cybersecurity researcher specializing in web application security. Bug bounty hunter with 50+ CVEs discovered.',
    followers: 2847,
    following: 892,
    reputation: 92,
    status: 'online',
    verified: true,
    joinedDate: 'January 2023',
    location: 'San Francisco, CA',
    website: 'alice-security.com',
    badges: ['🛡️', '🔍', '🏆'],
    posts: [
      {
        id: 'alice_1',
        username: 'WhiteHat_Alice',
        handle: '@whitehatalice',
        avatar: '👩‍💻',
        timestamp: '2h',
        content: 'Just discovered a critical XSS vulnerability in a major e-commerce platform. Responsible disclosure process initiated. Details in 90 days! 🔒',
        likes: 156,
        reposts: 23,
        comments: 41,
        tags: ['#BugBounty', '#XSS', '#ResponsibleDisclosure'],
        isLiked: false,
        isReposted: false,
        reputation: 92,
        verified: true,
        isBookmarked: false,
        category: 'research'
      }
    ],
    postsCount: 342,
    memberSince: 'January 2023',
    lastSeen: '2 minutes ago',
    specializations: ['Web Security', 'Bug Bounty', 'Penetration Testing', 'OWASP'],
    achievements: ['Top 10 Bug Bounty Hunter 2024', '50+ CVEs Discovered', 'Security Conference Speaker'],
    isFollowing: false
  },
  
  'RedTeam_Bob': {
    username: 'RedTeam_Bob',
    handle: '@redteambob',
    avatar: '🕵️‍♂️',
    bio: 'Red team operator | OSCP & CISSP certified | Teaching others to think like an attacker to defend better.',
    followers: 4521,
    following: 1243,
    reputation: 88,
    status: 'hacking',
    verified: true,
    joinedDate: 'March 2022',
    location: 'London, UK',
    website: 'redteam-training.co.uk',
    badges: ['💀', '🎯', '🔥'],
    posts: [
      {
        id: 'bob_1',
        username: 'RedTeam_Bob',
        handle: '@redteambob',
        avatar: '🕵️‍♂️',
        timestamp: '4h',
        content: 'Successfully completed a 3-week red team engagement. Compromised the entire AD forest in 48 hours. Time to write the report and help blue team strengthen defenses! 💪',
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMGYxNzJhIi8+Cjx0ZXh0IHg9IjIwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmNjYwMCI+UmVkIFRlYW0gUmVwb3J0IC0gQ09ORklERU5USUFMPC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmZmZmYiPkV4ZWN1dGl2ZSBTdW1tYXJ5PC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZjY2MDAiPkNSSVRJQ0FMOiA3IEZpbmRpbmdzPC90ZXh0Pgo8dGV3eHQgeD0iMjAiIHk9IjExMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmNjYwMCI+SElHSDogMTIgRmluZGluZ3M8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZjk5MDAiPk1FRElVTTogNSBGaW5kaW5nczwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjE1MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzAwZmYwMCI+RE9NQUlOIEFETUlOIEFDSElFVkVEPC90ZXh0Pgo8L3N2Zz4K',
        likes: 203,
        reposts: 67,
        comments: 89,
        tags: ['#RedTeam', '#ActiveDirectory', '#PenTest'],
        isLiked: false,
        isReposted: false,
        reputation: 88,
        verified: true,
        isBookmarked: false,
        category: 'exploit'
      }
    ],
    postsCount: 189,
    memberSince: 'March 2022',
    lastSeen: '5 minutes ago',
    specializations: ['Red Team Operations', 'Active Directory', 'Social Engineering', 'Physical Security'],
    achievements: ['OSCP Certified', 'CISSP Certified', 'DEF CON Speaker', 'Red Team Lead'],
    isFollowing: true
  },

  'BlueTeam_Carol': {
    username: 'BlueTeam_Carol',
    handle: '@blueteamcarol',
    avatar: '🛡️',
    bio: 'SOC analyst turned threat hunter. Building better detection rules one false positive at a time.',
    followers: 3214,
    following: 987,
    reputation: 85,
    status: 'online',
    verified: false,
    joinedDate: 'August 2023',
    location: 'Austin, TX',
    website: 'threatHunter.blog',
    badges: ['🔍', '📊', '⚡'],
    posts: [
      {
        id: 'carol_1',
        username: 'BlueTeam_Carol',
        handle: '@blueteamcarol',
        avatar: '🛡️',
        timestamp: '1h',
        content: 'New Sigma rule for detecting Cobalt Strike beacon traffic. Tested against our lab environment - 99.2% detection rate with minimal false positives! 🎯',
        likes: 87,
        reposts: 34,
        comments: 12,
        tags: ['#ThreatHunting', '#Sigma', '#CobaltStrike'],
        isLiked: true,
        isReposted: false,
        reputation: 85,
        verified: false,
        isBookmarked: true,
        category: 'research'
      }
    ],
    postsCount: 156,
    memberSince: 'August 2023',
    lastSeen: '10 minutes ago',
    specializations: ['Threat Hunting', 'SIEM', 'Incident Response', 'Malware Analysis'],
    achievements: ['GCTI Certified', 'SOC Analyst of the Year 2024', 'Open Source Contributor'],
    isFollowing: false
  }
};

// Helper function to get user profile by username
export const getUserProfile = (username: string): UserProfile | null => {
  return mockUserProfiles[username] || null;
};
