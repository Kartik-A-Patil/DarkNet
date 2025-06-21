import { v4 as uuidv4 } from "uuid";
import { TierSystem, PlayerTier, ExperiencePoints } from "./progression/tierSystem";

// Interfaces for game entities
interface Exploit {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  successRate: number;
  author: string;
  code?: string;
  targetService?: string;
  language?: string;
  traceLevel?: number;
}

interface ScanResult {
  host: string;
  ports: number[];
  services: any[];
  vulnerabilities: string[];
  traceLevel: number;
  success: boolean;
}

interface NetworkHost {
  ip: string;
  hostname?: string;
  os?: string;
  services?: any[];
}

// Mock Exploit Manager
class MockExploitManager {
  private exploits: Map<string, Exploit> = new Map();

  createExploit(
    name: string,
    description: string,
    code: string,
    language: string,
    targetService: string,
    author: string,
    traceLevel: number,
    successRate: number
  ): Exploit {
    const exploit: Exploit = {
      id: uuidv4(),
      name,
      description,
      difficulty: Math.floor(Math.random() * 5) + 1,
      successRate,
      author,
      code,
      targetService,
      language,
      traceLevel
    };
    this.exploits.set(exploit.id, exploit);
    return exploit;
  }

  getExploit(id: string): Exploit | null {
    return this.exploits.get(id) || null;
  }

  async executeExploit(exploitId: string, targetIp: string, options?: any) {
    const exploit = this.getExploit(exploitId);
    if (!exploit) {
      return { success: false, message: "Exploit not found", traceEvidence: 5 };
    }

    const success = Math.random() < (exploit.successRate / 100);
    return {
      success,
      message: success ? "Exploit successful" : "Exploit failed",
      traceEvidence: exploit.traceLevel || Math.floor(Math.random() * 5) + 1,
      gainedAccess: success,
      accessLevel: success ? (Math.random() > 0.5 ? "admin" : "user") : undefined
    };
  }

  filterExploits(filter: any): Exploit[] {
    return Array.from(this.exploits.values());
  }
}

// Mock interfaces and classes for systems not yet implemented
interface ScanResult {
  host: string;
  ports: number[];
  services: any[];
  vulnerabilities: string[];
  traceLevel: number;
}

interface NetworkHost {
  ip: string;
  hostname?: string;
  os?: string;
  services?: any[];
}

// Mock Law Enforcement System
class MockLawEnforcementSystem {
  private playerSuspicion: Map<string, number> = new Map();

  recordSuspiciousActivity(playerId: string, activityType: string, traceLevel: number, target?: string): void {
    const currentSuspicion = this.playerSuspicion.get(playerId) || 0;
    this.playerSuspicion.set(playerId, currentSuspicion + traceLevel);
  }

  getPlayerSuspicion(playerId: string): number {
    return this.playerSuspicion.get(playerId) || 0;
  }

  getPlayerInvestigations(playerId: string) {
    return [];
  }

  attemptEraseEvidence(playerId: string, investigationId: string, evidenceId: string) {
    return { success: false, message: "Not implemented" };
  }

  attemptBribe(playerId: string, investigationId: string, amount: number) {
    return { success: false, message: "Not implemented" };
  }
}

// Mock Social Engineering System
class MockSocialEngineeringSystem {
  private targets: Map<string, any> = new Map();
  private attacks: Map<string, any> = new Map();

  executeAttack(attackId: string, playerId: string): { success: boolean; traceLevel: number; message: string } {
    const attack = this.attacks.get(attackId);
    if (!attack) {
      return { success: false, traceLevel: 5, message: "Attack not found" };
    }
    
    const success = Math.random() > 0.5;
    return {
      success,
      traceLevel: Math.floor(Math.random() * 5) + 1,
      message: success ? "Attack successful" : "Attack failed"
    };
  }

  addTarget(target: any): void {
    this.targets.set(target.id, target);
  }

  listTargets() {
    return Array.from(this.targets.values());
  }

  listTemplates() {
    return [];
  }

  createAttack(playerId: string, type: string, targetId: string, content?: string, templateId?: string) {
    const attackId = uuidv4();
    const attack = { id: attackId, playerId, type, targetId, content, templateId };
    this.attacks.set(attackId, attack);
    return attack;
  }
}

// Mock Network Scanner System
class MockNetworkScannerSystem {
  private knownHosts: Map<string, NetworkHost> = new Map();
  private scanHistory: Map<string, ScanResult[]> = new Map();

  async scanTarget(targetIp: string, scanType: string, options: any): Promise<ScanResult> {
    const result: ScanResult = {
      host: targetIp,
      ports: [22, 80, 443, 21],
      services: [
        { port: 22, name: "SSH", version: "OpenSSH 7.4" },
        { port: 80, name: "HTTP", version: "Apache 2.4" },
        { port: 443, name: "HTTPS", version: "Apache 2.4" },
        { port: 21, name: "FTP", version: "vsftpd 3.0.3" }
      ],
      vulnerabilities: ["CVE-2021-44228", "CVE-2019-6340"],
      traceLevel: Math.floor(Math.random() * 5) + 1,
      success: true
    };

    // Update known hosts
    if (!this.knownHosts.has(targetIp)) {
      this.knownHosts.set(targetIp, {
        ip: targetIp,
        hostname: `host-${targetIp.replace(/\./g, "-")}`,
        os: "Linux",
        services: result.services
      });
    }

    // Update scan history
    const history = this.scanHistory.get(targetIp) || [];
    history.push(result);
    this.scanHistory.set(targetIp, history);

    return result;
  }

  performScan(targetIp: string, scanType: string, playerId: string) {
    return this.scanTarget(targetIp, scanType, { playerId });
  }

  getKnownHosts(): NetworkHost[] {
    return Array.from(this.knownHosts.values());
  }

  getHost(ip: string): NetworkHost | undefined {
    return this.knownHosts.get(ip);
  }

  getScanHistory(ip: string): ScanResult[] {
    return this.scanHistory.get(ip) || [];
  }
}

/**
 * GameplayManager integrates all hacking mechanics and game systems together
 * Acts as a facade for the underlying systems to simplify usage
 */
export class GameplayManager {
  private exploitManager: MockExploitManager;
  private lawEnforcement: MockLawEnforcementSystem;
  private socialEngineering: MockSocialEngineeringSystem;
  private networkScanner: MockNetworkScannerSystem;
  private tierSystem: TierSystem;
  private playerSkillLevels: Map<string, Record<string, number>> = new Map(); // Player ID -> skill levels

  constructor(jsInterpreter?: any, pythonInterpreter?: any) {
    // Initialize all game systems
    this.exploitManager = new MockExploitManager();
    this.lawEnforcement = new MockLawEnforcementSystem();
    this.socialEngineering = new MockSocialEngineeringSystem();
    this.networkScanner = new MockNetworkScannerSystem();
    this.tierSystem = new TierSystem();

    // Set default player skill levels
    this.initDefaultPlayerSkills("default");
  }

  /**
   * Initialize default player skill levels and tier system for a new player
   */
  private initDefaultPlayerSkills(playerId: string): void {
    this.playerSkillLevels.set(playerId, {
      coding: 1,
      networking: 1,
      softwareEngineering: 1,
      socialEngineering: 1,
      cryptography: 1,
      forensics: 1,
      reverseEngineering: 1
    });

    // Initialize player in tier system
    this.tierSystem.initializePlayer(playerId);
  }

  /**
   * Initialize a new player in all systems
   */
  public initializePlayer(playerId: string): void {
    this.initDefaultPlayerSkills(playerId);
  }

  /**
   * Get a player's skill levels
   */
  getPlayerSkills(playerId: string): Record<string, number> {
    const skills = this.playerSkillLevels.get(playerId);
    if (!skills) {
      this.initDefaultPlayerSkills(playerId);
      return this.playerSkillLevels.get(playerId)!;
    }
    return skills;
  }

  /**
   * Update a player's skill level in a specific area
   */
  updatePlayerSkill(
    playerId: string,
    skillName: string,
    newLevel: number
  ): boolean {
    const skills = this.getPlayerSkills(playerId);
    if (skills[skillName] !== undefined) {
      skills[skillName] = Math.max(1, Math.min(newLevel, 10));
      return true;
    }
    return false;
  }

  /**
   * Award experience points for various activities with integration to existing systems
   */
  private awardXP(
    playerId: string,
    category: keyof ExperiencePoints,
    baseAmount: number,
    reason: string,
    activityData?: any
  ): void {
    const result = this.tierSystem.awardExperience(playerId, category, baseAmount, reason);
    
    if (result.tierUp && result.newTier) {
      // Notify player of tier progression
      console.log(`🎉 Player ${playerId} advanced to ${result.newTier} tier!`);
      
      // Dispatch tier up event
      document.dispatchEvent(new CustomEvent('player-tier-up', {
        detail: {
          playerId,
          newTier: result.newTier,
          totalXP: result.newXP
        }
      }));
    }
  }

  /**
   * Scan a target IP address
   */
  async scanTarget(
    playerId: string,
    targetIp: string,
    scanType: string,
    options: Record<string, any> = {}
  ): Promise<{
    scanResult: ScanResult;
    lawEnforcementActivity?: { detected: boolean; message?: string };
  }> {
    // Get player skills
    const skills = this.getPlayerSkills(playerId);
    const networkingSkill = skills.networking;

    // Adjust scan options based on skills
    const skillAdjustedOptions = {
      ...options,
      // Higher skill gives more accurate results
      serviceDetection: options.serviceDetection !== false
    };

    // Perform the scan
    const scanResult = await this.networkScanner.scanTarget(
      targetIp,
      scanType,
      skillAdjustedOptions
    );

    // Award XP for scanning activity
    const baseXP = scanType === 'stealth' ? 15 : 10;
    this.awardXP(playerId, 'discovery', baseXP, `Network scan: ${scanType}`);

    // Update tier system stats
    this.tierSystem.updatePlayerStats(playerId, {
      totalOperations: 1
    });

    // Record activity with law enforcement based on trace level
    const traceLevel = scanResult.traceLevel;
    const baseDetectionChance = traceLevel / 20; // 0.05 to 0.5 for trace levels 1-10

    // Skills reduce detection chance
    const skillFactor = 1 - networkingSkill / 20; // 0.95 to 0.5 reduction factor
    const detectionChance = baseDetectionChance * skillFactor;

    let lawEnforcementActivity = undefined;

    // Check if the activity was detected
    if (Math.random() < detectionChance) {
      // Record suspicious activity
      this.lawEnforcement.recordSuspiciousActivity(
        playerId,
        "scan",
        traceLevel,
        targetIp
      );

      lawEnforcementActivity = {
        detected: true,
        message: `Your scan left traces that were detected. Current suspicion level: ${this.lawEnforcement.getPlayerSuspicion(
          playerId
        )}`
      };
    } else {
      lawEnforcementActivity = {
        detected: false
      };

      // Award stealth XP for undetected scans
      this.awardXP(playerId, 'stealth', 5, 'Undetected scan');
      this.tierSystem.updatePlayerStats(playerId, {
        undetectedOperations: 1
      });
    }

    return {
      scanResult,
      lawEnforcementActivity
    };
  }

  /**
   * Execute an exploit against a target
   */
  async executeExploit(
    playerId: string,
    exploitId: string,
    targetIp: string,
    options?: Record<string, any>
  ): Promise<{
    result: any;
    accessGained: boolean;
    accessLevel?: string;
    lawEnforcementActivity?: { detected: boolean; message?: string };
  }> {
    // Get player skills
    const skills = this.getPlayerSkills(playerId);
    const codingSkill = skills.coding;
    const softwareSkill = skills.softwareEngineering;

    // Get the exploit
    const exploit = this.exploitManager.getExploit(exploitId);

    if (!exploit) {
      return {
        result: { success: false, message: "Exploit not found" },
        accessGained: false
      };
    }

    // Execute the exploit
    const result = await this.exploitManager.executeExploit(
      exploitId,
      targetIp,
      options
    );

    // Award XP based on exploit success
    if (result.success) {
      const baseXP = exploit.difficulty * 50; // More difficult exploits give more XP
      this.awardXP(playerId, 'exploit', baseXP, `Successful exploit: ${exploit.name}`);
      
      // Update tier system stats
      this.tierSystem.updatePlayerStats(playerId, {
        successfulExploits: 1,
        totalOperations: 1
      });
    } else {
      // Small XP for failed attempts (learning experience)
      this.awardXP(playerId, 'exploit', 10, `Failed exploit attempt: ${exploit.name}`);
      
      // Update tier system stats
      this.tierSystem.updatePlayerStats(playerId, {
        failedExploits: 1,
        totalOperations: 1
      });
    }

    // Calculate if law enforcement detects this activity
    const traceLevel = result.traceEvidence;

    // Base detection chance from trace evidence
    const baseDetectionChance = traceLevel / 15; // 0.07 to 0.67 for trace levels 1-10

    // Skills reduce detection chance (average of coding and software skills)
    const avgSkill = (codingSkill + softwareSkill) / 2;
    const skillFactor = 1 - avgSkill / 25; // 0.96 to 0.6 reduction factor
    const detectionChance = baseDetectionChance * skillFactor;

    let lawEnforcementActivity = undefined;

    // Check if the activity was detected
    if (Math.random() < detectionChance) {
      // Record suspicious activity
      this.lawEnforcement.recordSuspiciousActivity(
        playerId,
        "exploit",
        traceLevel,
        targetIp
      );

      // Get current player suspicion
      const suspicionLevel = this.lawEnforcement.getPlayerSuspicion(playerId);

      lawEnforcementActivity = {
        detected: true,
        message: `Your exploit left traces that were detected. Current suspicion level: ${suspicionLevel}`
      };
    } else {
      lawEnforcementActivity = {
        detected: false
      };

      // Award stealth XP for undetected exploits
      if (result.success) {
        this.awardXP(playerId, 'stealth', 25, 'Undetected successful exploit');
        this.tierSystem.updatePlayerStats(playerId, {
          undetectedOperations: 1
        });
      }
    }

    return {
      result,
      accessGained: result.gainedAccess || false,
      accessLevel: result.accessLevel,
      lawEnforcementActivity
    };
  }

  /**
   * Execute a social engineering attack
   */
  executeSocialEngineeringAttack(
    playerId: string,
    attackId: string
  ): {
    result: any;
    lawEnforcementActivity?: { detected: boolean; message?: string };
  } {
    // Get player skills
    const skills = this.getPlayerSkills(playerId);
    const socialEngineeringSkill = skills.socialEngineering;

    // Execute the attack
    const result = this.socialEngineering.executeAttack(attackId, playerId);

    // Update tier system stats
    this.tierSystem.updatePlayerStats(playerId, {
      socialEngineeringAttempts: 1,
      totalOperations: 1
    });

    // Award XP based on attack success
    if (result.success) {
      const baseXP = 75; // Base XP for successful social engineering
      this.awardXP(playerId, 'socialEngineering', baseXP, 'Successful social engineering attack');
      
      // Update tier system stats
      this.tierSystem.updatePlayerStats(playerId, {
        socialEngineeringSuccesses: 1
      });
    } else {
      // Small XP for failed attempts
      this.awardXP(playerId, 'socialEngineering', 15, 'Failed social engineering attempt');
    }

    // Calculate if law enforcement detects this activity
    if (result.success) {
      const traceLevel = result.traceLevel;

      // Base detection chance from trace evidence
      const baseDetectionChance = traceLevel / 25; // 0.04 to 0.4 for trace levels 1-10

      // Skills reduce detection chance
      const skillFactor = 1 - socialEngineeringSkill / 15; // 0.93 to 0.33 reduction factor
      const detectionChance = baseDetectionChance * skillFactor;

      let lawEnforcementActivity = undefined;

      // Check if the activity was detected
      if (Math.random() < detectionChance) {
        // Record suspicious activity
        this.lawEnforcement.recordSuspiciousActivity(
          playerId,
          "socialEngineering",
          traceLevel
        );

        lawEnforcementActivity = {
          detected: true,
          message: `Your social engineering attack left traces. Current suspicion level: ${this.lawEnforcement.getPlayerSuspicion(
            playerId
          )}`
        };
      } else {
        lawEnforcementActivity = {
          detected: false
        };

        // Award stealth XP for undetected attacks
        this.awardXP(playerId, 'stealth', 20, 'Undetected social engineering');
        this.tierSystem.updatePlayerStats(playerId, {
          undetectedOperations: 1
        });
      }

      return {
        result,
        lawEnforcementActivity
      };
    }

    // If attack failed, no law enforcement detection
    return {
      result
    };
  }

  /**
   * Award XP for CTF participation and wins
   */
  public awardCTFExperience(
    playerId: string,
    type: 'participation' | 'flag' | 'win',
    details?: { flagValue?: number; difficulty?: number }
  ): void {
    let xp = 0;
    let reason = '';
    
    switch (type) {
      case 'participation':
        xp = 50;
        reason = 'CTF participation';
        this.tierSystem.updatePlayerStats(playerId, {
          ctfParticipations: 1
        });
        break;
      case 'flag':
        xp = (details?.flagValue || 100) + (details?.difficulty || 1) * 25;
        reason = 'CTF flag capture';
        this.tierSystem.updatePlayerStats(playerId, {
          ctfFlagsFound: 1
        });
        break;
      case 'win':
        xp = 500;
        reason = 'CTF competition win';
        this.tierSystem.updatePlayerStats(playerId, {
          ctfWins: 1
        });
        break;
    }
    
    this.awardXP(playerId, 'ctf', xp, reason);
  }

  /**
   * Award XP for market activities
   */
  public awardMarketExperience(
    playerId: string,
    type: 'transaction' | 'sale' | 'reputation',
    amount: number,
    details?: any
  ): void {
    let xp = 0;
    let reason = '';
    
    switch (type) {
      case 'transaction':
        xp = Math.min(100, amount / 10); // 1 XP per 10 credits, max 100 XP
        reason = 'Market transaction';
        this.tierSystem.updatePlayerStats(playerId, {
          marketTransactions: 1
        });
        break;
      case 'sale':
        xp = Math.min(200, amount / 5); // 1 XP per 5 credits, max 200 XP
        reason = 'Exploit sale';
        this.tierSystem.updatePlayerStats(playerId, {
          exploitsSold: 1
        });
        break;
      case 'reputation':
        xp = amount * 10; // Direct XP based on reputation gain
        reason = 'Market reputation increase';
        this.tierSystem.updatePlayerStats(playerId, {
          marketReputation: amount
        });
        break;
    }
    
    this.awardXP(playerId, 'market', xp, reason);
  }

  /**
   * Award XP for discovery activities
   */
  public awardDiscoveryExperience(
    playerId: string,
    type: 'network' | 'vulnerability' | 'zero-day',
    details?: any
  ): void {
    let xp = 0;
    let reason = '';
    let statUpdate: any = {};
    
    switch (type) {
      case 'network':
        xp = 30;
        reason = 'Network discovery';
        statUpdate.networksDiscovered = 1;
        break;
      case 'vulnerability':
        xp = 150;
        reason = 'Vulnerability discovery';
        statUpdate.vulnerabilitiesFound = 1;
        break;
      case 'zero-day':
        xp = 1000;
        reason = 'Zero-day discovery';
        statUpdate.zeroDoysDiscovered = 1;
        break;
    }
    
    this.awardXP(playerId, 'discovery', xp, reason);
    this.tierSystem.updatePlayerStats(playerId, statUpdate);
  }

  /**
   * Get player's active investigations
   */
  getPlayerInvestigations(playerId: string) {
    return this.lawEnforcement.getPlayerInvestigations(playerId);
  }

  /**
   * Attempt to erase evidence from an investigation
   */
  eraseEvidence(playerId: string, investigationId: string, evidenceId: string) {
    // Get player skills
    const skills = this.getPlayerSkills(playerId);
    const forensicsSkill = skills.forensics;

    const result = this.lawEnforcement.attemptEraseEvidence(
      playerId,
      investigationId,
      evidenceId
    );

    // Award XP for successful evidence erasure
    if (result.success) {
      this.awardXP(playerId, 'stealth', 100, 'Evidence erasure');
      this.tierSystem.updatePlayerStats(playerId, {
        lawEnforcementEvasions: 1
      });
    }

    return result;
  }

  /**
   * Attempt to bribe an official
   */
  bribeOfficial(playerId: string, investigationId: string, amount: number) {
    const result = this.lawEnforcement.attemptBribe(playerId, investigationId, amount);

    // Award XP for successful bribes
    if (result.success) {
      this.awardXP(playerId, 'stealth', 150, 'Official bribe');
      this.tierSystem.updatePlayerStats(playerId, {
        lawEnforcementEvasions: 1
      });
    }

    return result;
  }

  /**
   * Create a custom exploit
   */
  createExploit(
    playerId: string,
    name: string,
    description: string,
    code: string,
    language: "javascript" | "python",
    targetService: string,
    difficulty: number,
    traceLevel: number,
    targetVersion?: string
  ): Exploit {
    // Get player skills
    const skills = this.getPlayerSkills(playerId);
    const codingSkill = skills.coding;

    // Adjust success rate based on player skill and exploit difficulty
    // Higher skill = higher base success rate
    // Higher difficulty = lower success rate
    const baseSuccessRate = 0.3 + codingSkill / 20; // 0.35 to 0.8
    const difficultyFactor = 1 - difficulty / 15; // 0.93 to 0.33 for difficulty 1-10
    const successRate = Math.max(
      0.1,
      Math.min(0.9, baseSuccessRate * difficultyFactor)
    );

    // Create and return the exploit
    const exploit = this.exploitManager.createExploit(
      name,
      description,
      code,
      language,
      targetService,
      playerId,
      traceLevel,
      successRate
    );

    // Award XP for exploit creation
    const creationXP = difficulty * 25;
    this.awardXP(playerId, 'exploit', creationXP, `Created exploit: ${name}`);

    return exploit;
  }

  /**
   * List available exploits
   */
  listExploits(filter?: Record<string, any>) {
    return this.exploitManager.filterExploits(filter || {});
  }

  /**
   * Get all known network hosts
   */
  getKnownHosts() {
    return this.networkScanner.getKnownHosts();
  }

  /**
   * Get a specific host by IP
   */
  getHost(ip: string): NetworkHost | undefined {
    return this.networkScanner.getHost(ip);
  }

  /**
   * Get scan history for a specific IP
   */
  getScanHistory(ip: string): ScanResult[] {
    return this.networkScanner.getScanHistory(ip);
  }

  /**
   * Create a social engineering target profile
   */
  createSocialEngineeringTarget(
    name: string,
    jobTitle: string,
    organization: string,
    accessLevel: "low" | "medium" | "high" | "critical",
    traits: Record<string, number>,
    email?: string,
    phone?: string
  ) {
    const target = {
      id: uuidv4(),
      name,
      jobTitle,
      organization,
      accessLevel,
      email,
      phone,
      psychologicalTraits: {
        trustLevel: traits.trustLevel || 5,
        curiosity: traits.curiosity || 5,
        security: traits.security || 5,
        authority: traits.authority || 5,
        helpfulness: traits.helpfulness || 5
      }
    };

    this.socialEngineering.addTarget(target);

    return target;
  }

  /**
   * List all social engineering targets
   */
  listSocialEngineeringTargets() {
    return this.socialEngineering.listTargets();
  }

  /**
   * Create a social engineering attack
   */
  createSocialEngineeringAttack(
    playerId: string,
    type: string,
    targetId: string,
    content?: string,
    templateId?: string
  ) {
    const playerName = playerId; // In a real game, you might have a display name

    return this.socialEngineering.createAttack(
      playerId,
      type,
      targetId,
      content,
      templateId
    );
  }

  /**
   * Get all available social engineering templates
   */
  getSocialEngineeringTemplates() {
    return this.socialEngineering.listTemplates();
  }

  /**
   * Get player suspicion level
   */
  getPlayerSuspicion(playerId: string): number {
    return this.lawEnforcement.getPlayerSuspicion(playerId);
  }

  // =============================================
  // TIER SYSTEM INTEGRATION METHODS
  // =============================================

  /**
   * Get player's tier progression and status
   */
  public getPlayerProgression(playerId: string) {
    return this.tierSystem.getPlayerProgression(playerId);
  }

  /**
   * Get tier benefits for a specific tier
   */
  public getTierBenefits(tier: PlayerTier) {
    return this.tierSystem.getTierBenefits(tier);
  }

  /**
   * Get tier requirements for a specific tier
   */
  public getTierRequirements(tier: PlayerTier) {
    return this.tierSystem.getTierRequirements(tier);
  }

  /**
   * Check if player has access to specific features
   */
  public hasFeatureAccess(playerId: string, feature: string): boolean {
    return this.tierSystem.hasAccess(playerId, feature);
  }

  /**
   * Get achievements for a specific tier
   */
  public getAchievementsForTier(tier: PlayerTier) {
    return this.tierSystem.getAchievementsForTier(tier);
  }

  /**
   * Get global leaderboard
   */
  public getGlobalLeaderboard() {
    return this.tierSystem.getGlobalLeaderboard();
  }

  /**
   * Get player's tier unlock history
   */
  public getPlayerTierHistory(playerId: string) {
    return this.tierSystem.getTierHistory(playerId);
  }
}

// Export the gameplay manager creator function
export const createGameplayManager = (
  jsInterpreter: any,
  pythonInterpreter: any,
): GameplayManager => {
  return new GameplayManager(jsInterpreter, pythonInterpreter);
};
