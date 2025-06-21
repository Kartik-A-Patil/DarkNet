import { v4 as uuidv4 } from 'uuid';

/**
 * Player tier levels representing progression from Script Kiddie to Legend
 */
export type PlayerTier = 'script-kiddie' | 'operator' | 'ghost' | 'legend';

/**
 * Experience point categories
 */
export interface ExperiencePoints {
  total: number;
  exploit: number;
  socialEngineering: number;
  stealth: number;
  ctf: number;
  market: number;
  discovery: number;
}

/**
 * Tier requirements and unlocks
 */
export interface TierRequirements {
  minimumXP: number;
  minimumSkillLevel: number; // Average across all skills
  specificRequirements: {
    ctfWins?: number;
    stealthOperations?: number;
    marketTransactions?: number;
    exploitsCreated?: number;
    socialEngineeringSuccess?: number;
  };
  lawEnforcementRequirements: {
    maxSuspicionLevel: number;
    maxActiveInvestigations: number;
  };
}

/**
 * Tier benefits and unlocks
 */
export interface TierBenefits {
  unlocks: {
    features: string[];
    exploitTypes: string[];
    marketAccess: string[];
    ctfChallenges: string[];
    specialAbilities: string[];
  };
  bonuses: {
    xpMultiplier: number;
    stealthBonus: number;
    marketDiscounts: number;
    skillGainRate: number;
    lawEnforcementResistance: number;
  };
  limits: {
    maxConcurrentOperations: number;
    advancedToolAccess: boolean;
    mentorshipAvailable: boolean;
  };
}

/**
 * Achievement tracking
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'exploit' | 'stealth' | 'social' | 'ctf' | 'market' | 'discovery' | 'special';
  tier: PlayerTier;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  hidden: boolean; // Some achievements are hidden until unlocked
}

/**
 * Player progression statistics
 */
export interface PlayerStats {
  // Core stats
  totalOperations: number;
  successfulExploits: number;
  failedExploits: number;
  socialEngineeringAttempts: number;
  socialEngineeringSuccesses: number;
  
  // Stealth metrics
  undetectedOperations: number;
  averageStealthRating: number;
  lawEnforcementEvasions: number;
  
  // CTF performance
  ctfParticipations: number;
  ctfWins: number;
  ctfFlagsFound: number;
  
  // Market activity
  marketTransactions: number;
  marketReputation: number;
  exploitsSold: number;
  
  // Discovery metrics
  networksDiscovered: number;
  vulnerabilitiesFound: number;
  zeroDoysDiscovered: number;
}

/**
 * Tier System implementation
 */
export class TierSystem {
  private playerData: Map<string, {
    tier: PlayerTier;
    xp: ExperiencePoints;
    stats: PlayerStats;
    achievements: Map<string, Achievement>;
    tierUnlockedAt: Map<PlayerTier, Date>;
  }> = new Map();

  private tierRequirements: Map<PlayerTier, TierRequirements> = new Map();
  private tierBenefits: Map<PlayerTier, TierBenefits> = new Map();
  private allAchievements: Map<string, Achievement> = new Map();

  constructor() {
    this.initializeTierSystem();
    this.initializeAchievements();
  }

  /**
   * Initialize tier requirements and benefits
   */
  private initializeTierSystem(): void {
    // Script Kiddie (Starting tier)
    this.tierRequirements.set('script-kiddie', {
      minimumXP: 0,
      minimumSkillLevel: 1,
      specificRequirements: {},
      lawEnforcementRequirements: {
        maxSuspicionLevel: 100,
        maxActiveInvestigations: 10
      }
    });

    this.tierBenefits.set('script-kiddie', {
      unlocks: {
        features: ['basic-scanning', 'simple-exploits', 'beginner-ctf'],
        exploitTypes: ['web-basic', 'network-basic'],
        marketAccess: ['basic-marketplace'],
        ctfChallenges: ['beginner'],
        specialAbilities: []
      },
      bonuses: {
        xpMultiplier: 1.0,
        stealthBonus: 0,
        marketDiscounts: 0,
        skillGainRate: 1.0,
        lawEnforcementResistance: 0
      },
      limits: {
        maxConcurrentOperations: 2,
        advancedToolAccess: false,
        mentorshipAvailable: false
      }
    });

    // Operator (Intermediate tier)
    this.tierRequirements.set('operator', {
      minimumXP: 5000,
      minimumSkillLevel: 4,
      specificRequirements: {
        exploitsCreated: 5,
        socialEngineeringSuccess: 3,
        ctfWins: 1
      },
      lawEnforcementRequirements: {
        maxSuspicionLevel: 60,
        maxActiveInvestigations: 2
      }
    });

    this.tierBenefits.set('operator', {
      unlocks: {
        features: ['advanced-scanning', 'social-engineering', 'intermediate-ctf', 'basic-marketplace-selling'],
        exploitTypes: ['web-advanced', 'network-advanced', 'system-basic'],
        marketAccess: ['intermediate-marketplace', 'exploit-trading'],
        ctfChallenges: ['intermediate', 'team-based'],
        specialAbilities: ['trace-cleaning', 'basic-evasion']
      },
      bonuses: {
        xpMultiplier: 1.25,
        stealthBonus: 10,
        marketDiscounts: 0.05,
        skillGainRate: 1.2,
        lawEnforcementResistance: 0.1
      },
      limits: {
        maxConcurrentOperations: 5,
        advancedToolAccess: true,
        mentorshipAvailable: false
      }
    });

    // Ghost (Advanced tier)
    this.tierRequirements.set('ghost', {
      minimumXP: 25000,
      minimumSkillLevel: 7,
      specificRequirements: {
        exploitsCreated: 20,
        socialEngineeringSuccess: 15,
        ctfWins: 5,
        stealthOperations: 50,
        marketTransactions: 25
      },
      lawEnforcementRequirements: {
        maxSuspicionLevel: 30,
        maxActiveInvestigations: 1
      }
    });

    this.tierBenefits.set('ghost', {
      unlocks: {
        features: ['ghost-mode', 'advanced-evasion', 'expert-ctf', 'premium-marketplace'],
        exploitTypes: ['zero-day-creation', 'advanced-persistence', 'system-advanced'],
        marketAccess: ['elite-marketplace', 'zero-day-trading', 'service-contracts'],
        ctfChallenges: ['advanced', 'red-team-ops'],
        specialAbilities: ['evidence-destruction', 'advanced-stealth', 'investigation-manipulation']
      },
      bonuses: {
        xpMultiplier: 1.5,
        stealthBonus: 25,
        marketDiscounts: 0.15,
        skillGainRate: 1.5,
        lawEnforcementResistance: 0.3
      },
      limits: {
        maxConcurrentOperations: 10,
        advancedToolAccess: true,
        mentorshipAvailable: true
      }
    });

    // Legend (Master tier)
    this.tierRequirements.set('legend', {
      minimumXP: 100000,
      minimumSkillLevel: 9,
      specificRequirements: {
        exploitsCreated: 100,
        socialEngineeringSuccess: 75,
        ctfWins: 25,
        stealthOperations: 200,
        marketTransactions: 100
      },
      lawEnforcementRequirements: {
        maxSuspicionLevel: 10,
        maxActiveInvestigations: 0
      }
    });

    this.tierBenefits.set('legend', {
      unlocks: {
        features: ['legend-mode', 'master-evasion', 'legend-ctf', 'elite-marketplace-ownership'],
        exploitTypes: ['nation-state-level', 'advanced-apt', 'custom-frameworks'],
        marketAccess: ['underground-networks', 'nation-state-contracts', 'zero-day-broking'],
        ctfChallenges: ['expert', 'nation-state-sim', 'capture-the-flag-master'],
        specialAbilities: ['perfect-stealth', 'law-enforcement-immunity', 'mentorship', 'network-leadership']
      },
      bonuses: {
        xpMultiplier: 2.0,
        stealthBonus: 50,
        marketDiscounts: 0.25,
        skillGainRate: 2.0,
        lawEnforcementResistance: 0.6
      },
      limits: {
        maxConcurrentOperations: 20,
        advancedToolAccess: true,
        mentorshipAvailable: true
      }
    });
  }

  /**
   * Initialize achievement system
   */
  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      // Script Kiddie achievements
      {
        id: 'first-exploit',
        name: 'First Blood',
        description: 'Successfully execute your first exploit',
        category: 'exploit',
        tier: 'script-kiddie',
        xpReward: 100,
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        hidden: false
      },
      {
        id: 'social-engineer',
        name: 'People Person',
        description: 'Successfully execute a social engineering attack',
        category: 'social',
        tier: 'script-kiddie',
        xpReward: 150,
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        hidden: false
      },
      {
        id: 'stealth-master',
        name: 'Ghost in the Machine',
        description: 'Complete 10 operations without being detected',
        category: 'stealth',
        tier: 'script-kiddie',
        xpReward: 250,
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        hidden: false
      },

      // Operator achievements
      {
        id: 'exploit-creator',
        name: 'Code Warrior',
        description: 'Create and successfully deploy 5 custom exploits',
        category: 'exploit',
        tier: 'operator',
        xpReward: 500,
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        hidden: false
      },
      {
        id: 'ctf-champion',
        name: 'Flag Hunter',
        description: 'Win your first CTF competition',
        category: 'ctf',
        tier: 'operator',
        xpReward: 750,
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        hidden: false
      },
      {
        id: 'market-trader',
        name: 'Digital Merchant',
        description: 'Complete 10 marketplace transactions',
        category: 'market',
        tier: 'operator',
        xpReward: 400,
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        hidden: false
      },

      // Ghost achievements
      {
        id: 'zero-day-hunter',
        name: 'Zero Day Hunter',
        description: 'Discover and exploit 3 zero-day vulnerabilities',
        category: 'discovery',
        tier: 'ghost',
        xpReward: 2000,
        unlocked: false,
        progress: 0,
        maxProgress: 3,
        hidden: false
      },
      {
        id: 'investigation-survivor',
        name: 'Untouchable',
        description: 'Evade law enforcement for 30 consecutive days',
        category: 'stealth',
        tier: 'ghost',
        xpReward: 1500,
        unlocked: false,
        progress: 0,
        maxProgress: 30,
        hidden: false
      },
      {
        id: 'social-mastermind',
        name: 'Puppet Master',
        description: 'Successfully manipulate 25 NPCs through social engineering',
        category: 'social',
        tier: 'ghost',
        xpReward: 1200,
        unlocked: false,
        progress: 0,
        maxProgress: 25,
        hidden: false
      },

      // Legend achievements
      {
        id: 'legend-ascension',
        name: 'Legendary Hacker',
        description: 'Reach the Legend tier',
        category: 'special',
        tier: 'legend',
        xpReward: 5000,
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        hidden: false
      },
      {
        id: 'perfect-stealth',
        name: 'Digital Ghost',
        description: 'Complete 100 operations with perfect stealth ratings',
        category: 'stealth',
        tier: 'legend',
        xpReward: 3000,
        unlocked: false,
        progress: 0,
        maxProgress: 100,
        hidden: false
      },
      {
        id: 'market-mogul',
        name: 'Underground Kingpin',
        description: 'Achieve 100,000 credits in total marketplace earnings',
        category: 'market',
        tier: 'legend',
        xpReward: 2500,
        unlocked: false,
        progress: 0,
        maxProgress: 100000,
        hidden: false
      },

      // Hidden achievements
      {
        id: 'law-enforcement-nemesis',
        name: 'Most Wanted',
        description: 'Have 5 active investigations against you simultaneously',
        category: 'special',
        tier: 'ghost',
        xpReward: 1000,
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        hidden: true
      },
      {
        id: 'ctf-dominator',
        name: 'Competition Destroyer',
        description: 'Win 10 CTF competitions in a row',
        category: 'ctf',
        tier: 'legend',
        xpReward: 4000,
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        hidden: true
      }
    ];

    achievements.forEach(achievement => {
      this.allAchievements.set(achievement.id, achievement);
    });
  }

  /**
   * Initialize a new player
   */
  public initializePlayer(playerId: string): void {
    this.playerData.set(playerId, {
      tier: 'script-kiddie',
      xp: {
        total: 0,
        exploit: 0,
        socialEngineering: 0,
        stealth: 0,
        ctf: 0,
        market: 0,
        discovery: 0
      },
      stats: {
        totalOperations: 0,
        successfulExploits: 0,
        failedExploits: 0,
        socialEngineeringAttempts: 0,
        socialEngineeringSuccesses: 0,
        undetectedOperations: 0,
        averageStealthRating: 100,
        lawEnforcementEvasions: 0,
        ctfParticipations: 0,
        ctfWins: 0,
        ctfFlagsFound: 0,
        marketTransactions: 0,
        marketReputation: 0,
        exploitsSold: 0,
        networksDiscovered: 0,
        vulnerabilitiesFound: 0,
        zeroDoysDiscovered: 0
      },
      achievements: new Map(Array.from(this.allAchievements.entries()).map(([id, achievement]) => [
        id,
        { ...achievement, unlocked: false, progress: 0 }
      ])),
      tierUnlockedAt: new Map([['script-kiddie', new Date()]])
    });
  }

  /**
   * Award experience points
   */
  public awardExperience(
    playerId: string,
    category: keyof ExperiencePoints,
    amount: number,
    reason: string
  ): { newXP: number; tierUp: boolean; newTier?: PlayerTier } {
    const player = this.playerData.get(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Apply tier bonuses
    const tierBenefits = this.tierBenefits.get(player.tier)!;
    const multipliedAmount = Math.round(amount * tierBenefits.bonuses.xpMultiplier);

    // Award XP
    if (category !== 'total') {
      player.xp[category] += multipliedAmount;
    }
    player.xp.total += multipliedAmount;

    // Check for tier progression
    const currentTier = player.tier;
    const newTier = this.checkTierProgression(playerId);
    const tierUp = newTier !== currentTier;

    if (tierUp) {
      player.tier = newTier;
      player.tierUnlockedAt.set(newTier, new Date());
      
      // Award tier achievement if applicable
      this.checkAndAwardAchievements(playerId, 'tier-up', { tier: newTier });
    }

    return {
      newXP: player.xp.total,
      tierUp,
      newTier: tierUp ? newTier : undefined
    };
  }

  /**
   * Update player statistics
   */
  public updatePlayerStats(
    playerId: string,
    statUpdates: Partial<PlayerStats>
  ): void {
    const player = this.playerData.get(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    Object.assign(player.stats, statUpdates);
    this.checkAndAwardAchievements(playerId, 'stat-update', statUpdates);
  }

  /**
   * Check if player meets requirements for tier progression
   */
  private checkTierProgression(playerId: string): PlayerTier {
    const player = this.playerData.get(playerId);
    if (!player) return 'script-kiddie';

    const tiers: PlayerTier[] = ['legend', 'ghost', 'operator', 'script-kiddie'];
    
    for (const tier of tiers) {
      if (this.meetsRequirements(playerId, tier)) {
        return tier;
      }
    }

    return 'script-kiddie';
  }

  /**
   * Check if player meets specific tier requirements
   */
  private meetsRequirements(playerId: string, tier: PlayerTier): boolean {
    const player = this.playerData.get(playerId);
    const requirements = this.tierRequirements.get(tier);
    
    if (!player || !requirements) return false;

    // Check minimum XP
    if (player.xp.total < requirements.minimumXP) return false;

    // Check minimum skill level (would need to integrate with GameplayManager)
    // This is a placeholder - would need actual skill level checking
    
    // Check specific requirements
    const specific = requirements.specificRequirements;
    const stats = player.stats;

    if (specific.ctfWins && stats.ctfWins < specific.ctfWins) return false;
    if (specific.stealthOperations && stats.undetectedOperations < specific.stealthOperations) return false;
    if (specific.marketTransactions && stats.marketTransactions < specific.marketTransactions) return false;
    if (specific.exploitsCreated && stats.successfulExploits < specific.exploitsCreated) return false;
    if (specific.socialEngineeringSuccess && stats.socialEngineeringSuccesses < specific.socialEngineeringSuccess) return false;

    // Check law enforcement requirements (would need integration with LawEnforcementSystem)
    // This is a placeholder for now

    return true;
  }

  /**
   * Check and award achievements
   */
  private checkAndAwardAchievements(
    playerId: string,
    trigger: string,
    data: any
  ): Achievement[] {
    const player = this.playerData.get(playerId);
    if (!player) return [];

    const awardedAchievements: Achievement[] = [];

    player.achievements.forEach((achievement, id) => {
      if (achievement.unlocked) return;

      let progressIncrement = 0;
      let shouldCheck = false;

      switch (achievement.id) {
        case 'first-exploit':
          if (trigger === 'stat-update' && data.successfulExploits > 0) {
            progressIncrement = 1;
            shouldCheck = true;
          }
          break;

        case 'social-engineer':
          if (trigger === 'stat-update' && data.socialEngineeringSuccesses > 0) {
            progressIncrement = 1;
            shouldCheck = true;
          }
          break;

        case 'stealth-master':
          if (trigger === 'stat-update' && data.undetectedOperations) {
            progressIncrement = data.undetectedOperations;
            shouldCheck = true;
          }
          break;

        case 'exploit-creator':
          if (trigger === 'stat-update' && data.successfulExploits) {
            achievement.progress = player.stats.successfulExploits;
            shouldCheck = true;
          }
          break;

        case 'ctf-champion':
          if (trigger === 'stat-update' && data.ctfWins > 0) {
            progressIncrement = data.ctfWins;
            shouldCheck = true;
          }
          break;

        case 'market-trader':
          if (trigger === 'stat-update' && data.marketTransactions) {
            achievement.progress = player.stats.marketTransactions;
            shouldCheck = true;
          }
          break;

        case 'legend-ascension':
          if (trigger === 'tier-up' && data.tier === 'legend') {
            progressIncrement = 1;
            shouldCheck = true;
          }
          break;

        // Add more achievement checks here
      }

      if (shouldCheck) {
        achievement.progress += progressIncrement;
        
        if (achievement.progress >= achievement.maxProgress) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date();
          awardedAchievements.push(achievement);
          
          // Award achievement XP
          this.awardExperience(playerId, 'total', achievement.xpReward, `Achievement: ${achievement.name}`);
        }
      }
    });

    return awardedAchievements;
  }

  /**
   * Get player's current tier and progression info
   */
  public getPlayerProgression(playerId: string): {
    tier: PlayerTier;
    xp: ExperiencePoints;
    stats: PlayerStats;
    nextTier?: PlayerTier;
    progressToNextTier?: number;
    tierBenefits: TierBenefits;
    achievements: Achievement[];
  } | null {
    const player = this.playerData.get(playerId);
    if (!player) return null;

    const tierBenefits = this.tierBenefits.get(player.tier)!;
    const achievements = Array.from(player.achievements.values())
      .filter(a => !a.hidden || a.unlocked);

    // Calculate next tier and progress
    let nextTier: PlayerTier | undefined;
    let progressToNextTier: number | undefined;

    const tierOrder: PlayerTier[] = ['script-kiddie', 'operator', 'ghost', 'legend'];
    const currentTierIndex = tierOrder.indexOf(player.tier);
    
    if (currentTierIndex < tierOrder.length - 1) {
      nextTier = tierOrder[currentTierIndex + 1];
      const nextTierRequirements = this.tierRequirements.get(nextTier)!;
      progressToNextTier = Math.min(100, (player.xp.total / nextTierRequirements.minimumXP) * 100);
    }

    return {
      tier: player.tier,
      xp: player.xp,
      stats: player.stats,
      nextTier,
      progressToNextTier,
      tierBenefits,
      achievements
    };
  }

  /**
   * Get all available achievements for a tier
   */
  public getAchievementsForTier(tier: PlayerTier): Achievement[] {
    return Array.from(this.allAchievements.values())
      .filter(achievement => achievement.tier === tier);
  }

  /**
   * Check if player has access to specific features
   */
  public hasAccess(playerId: string, feature: string): boolean {
    const player = this.playerData.get(playerId);
    if (!player) return false;

    const tierBenefits = this.tierBenefits.get(player.tier)!;
    
    return tierBenefits.unlocks.features.includes(feature) ||
           tierBenefits.unlocks.exploitTypes.includes(feature) ||
           tierBenefits.unlocks.marketAccess.includes(feature) ||
           tierBenefits.unlocks.ctfChallenges.includes(feature) ||
           tierBenefits.unlocks.specialAbilities.includes(feature);
  }

  /**
   * Get tier benefits for a specific tier
   */
  public getTierBenefits(tier: PlayerTier): TierBenefits | null {
    return this.tierBenefits.get(tier) || null;
  }

  /**
   * Get tier requirements for a specific tier
   */
  public getTierRequirements(tier: PlayerTier): TierRequirements | null {
    return this.tierRequirements.get(tier) || null;
  }

  /**
   * Get player's tier unlock history
   */
  public getTierHistory(playerId: string): Map<PlayerTier, Date> | null {
    const player = this.playerData.get(playerId);
    return player ? new Map(player.tierUnlockedAt) : null;
  }

  /**
   * Get leaderboard across all players
   */
  public getGlobalLeaderboard(): Array<{
    playerId: string;
    tier: PlayerTier;
    totalXP: number;
    achievements: number;
  }> {
    return Array.from(this.playerData.entries())
      .map(([playerId, data]) => ({
        playerId,
        tier: data.tier,
        totalXP: data.xp.total,
        achievements: Array.from(data.achievements.values()).filter(a => a.unlocked).length
      }))
      .sort((a, b) => {
        // Sort by tier first, then by XP
        const tierOrder: PlayerTier[] = ['legend', 'ghost', 'operator', 'script-kiddie'];
        const aTierIndex = tierOrder.indexOf(a.tier);
        const bTierIndex = tierOrder.indexOf(b.tier);
        
        if (aTierIndex !== bTierIndex) {
          return aTierIndex - bTierIndex;
        }
        
        return b.totalXP - a.totalXP;
      });
  }
}
