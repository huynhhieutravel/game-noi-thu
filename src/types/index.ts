export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ElementType = 'water' | 'fire' | 'wind' | 'earth' | 'spirit' | 'thunder';
export type BoardMovement =
  | 'none'
  | 'down'
  | 'up'
  | 'left'
  | 'right'
  | 'center_row'
  | 'center_col'
  | 'split_vertical'
  | 'split_horizontal'
  | 'chaos';

export type TileModifier = 'none' | 'ice' | 'stone' | 'lock' | 'fog' | 'lightning' | 'lucky_pot' | 'shapeshifter' | 'thorn' | 'web' | 'barricade';

export interface CharacterPalette {
  bg: string;
  primary: string;
  accent: string;
  glow: string;
}

export interface CharacterData {
  id: string;
  name: string;
  japaneseName: string;
  collection: string;
  chapter?: number;
  chapterId?: string;
  chapterTitle?: string;
  rarity: Rarity;
  element: ElementType;
  description: string;
  palette: CharacterPalette;
  symbol: string;
  asset?: string;
  imagePath?: string;
  sheetIndex?: number;
}

export interface CollectionData {
  id: string;
  name: string;
  japaneseTitle: string;
  themeFolder?: string;
  description: string;
  totalCharacters: number;
  totalChapters?: number;
  rewardLegendaryId: string;
}

export interface GridPoint {
  r: number;
  c: number;
}

export interface PortalConnection {
  portalA: GridPoint;
  portalB: GridPoint;
  pathA: GridPoint[];
  pathB: GridPoint[];
}

export interface MatchPath {
  points: GridPoint[];
  turns: number;
  portalConnection?: PortalConnection;
}

export interface TileState {
  r: number;
  c: number;
  characterId: string | null;
  modifier: TileModifier;
  iceLayers: number;
  isLocked: boolean;
  isKey: boolean;
  isFogged: boolean;
  isBossSymbol: boolean;
  isCleared: boolean;
  modifierLevel?: number;
  // Dynamic Special Tile properties
  isLightning?: boolean;
  isLuckyPot?: boolean;
  luckyPotTimeLeft?: number;
  isShapeshifter?: boolean;
  hasRelicShard?: boolean;
}

export interface BossSkill {
  type: string;
  name: string;
  description: string;
}

export interface BossConfig {
  id: string;
  name: string;
  japaneseName?: string;
  native_name?: string;
  title?: string;
  element?: string;
  symbol?: string;
  theme?: string;
  image?: string;
  maxHp: number;
  actionIntervalSeconds: number;
  headsOrParts?: number;
  parts?: number;
  part_name?: string;
  skills: BossSkill[];
  desc?: string;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface LevelQuest {
  id: string;
  type: 'clear' | 'combo' | 'no_booster' | 'time_left' | 'break_ice' | 'break_stone' | 'rescue_cages' | 'no_shuffle';
  target: number;
  description: string;
  icon?: string;
}

export interface DifficultyConfig {
  timeLimit: number;
  characterPoolCount?: number;
  modifierMultiplier?: number;
  rewardMultiplier: number;
  rows?: number;
  columns?: number;
  movement?: BoardMovement;
  isStopwatch?: boolean;
  targetGoldSeconds?: number;
  targetSilverSeconds?: number;
}

export interface RelicReward {
  id: string;
  name: string;
  japaneseName?: string;
  icon: string;
  description: string;
  worldId: string;
  levelId: string;
  tier?: 'common' | 'rare' | 'epic';
  tierName?: string;
  image?: string;
  skillName?: string;
  skillDesc?: string;
  rageCost?: number;
}

export interface BadgeReward {
  id: string;
  name: string;
  characterId: string;
  tier: 1 | 2 | 3; // 1: Easy, 2: Medium, 3: Hard
  rarity: Rarity;
}

export interface LevelConfig {
  id: string;
  levelNumber: number;
  worldId: string;
  title: string;
  rows: number;
  columns: number;
  characterPool: string[];
  timeLimit: number;
  isStopwatch?: boolean;
  targetGoldSeconds?: number;
  targetSilverSeconds?: number;
  movement?: BoardMovement;
  modifiers?: {
    iceCount?: number;
    stoneCount?: number;
    lockCount?: number;
    fogCount?: number;
    thornCount?: number;
    webCount?: number;
    barricadeCount?: number;
  };
  hasPortals?: boolean;
  boss?: BossConfig;
  rewards: {
    coins: number;
    stars: number;
    unlockCharacterId?: string;
  };
  // Extended Progression
  quests?: LevelQuest[];
  relicReward?: RelicReward;
  badgeRewards?: BadgeReward[];
  difficulties?: {
    easy: DifficultyConfig;
    medium: DifficultyConfig;
    hard: DifficultyConfig;
  };
}

export interface CompanionLevelInfo {
  level: number;
  skillDesc: string;
  passiveDesc: string;
  perkSummary?: string;
  requiredShards: number;
  requiredCoins: number;
}

export const COMPANION_UPGRADE_COSTS: Record<number, { shards: number; coins: number }> = {
  1: { shards: 10, coins: 200 },
  2: { shards: 25, coins: 500 },
  3: { shards: 50, coins: 1000 },
  4: { shards: 100, coins: 2000 }
};

export interface CompanionTierInfo {
  tier: number;
  tierName: string;
  badge: string;
  skillName: string;
  skillDesc: string;
  bossCounterDesc: string;
  maxLevel: number;
}

export interface CompanionConfig {
  id: string;
  name: string;
  title: string;
  icon: string;
  element: string;
  elementLabel?: string;
  themeColor: number;
  skillName: string;
  skillDesc: string;
  passiveName?: string;
  passiveDesc?: string;
  cost: number;
  unlockReqDesc?: string;
  roleDescription?: string;
  isApexSSR?: boolean;
  levels?: CompanionLevelInfo[];
  evolutionTiers?: Record<number, CompanionTierInfo>;
}

export interface UserSaveData {
  version: number;
  coins: number;
  diamonds?: number;
  universalShards?: number;
  stars: number;
  highestLevel: number;
  levelStars: Record<string, number>;
  selectedTheme?: string;
  selectedWallpaper?: string;
  selectedCompanion?: string;
  unlockedCompanions?: string[];
  companionTiers?: Record<string, number>;
  companionLevels?: Record<string, number>;
  companionShards?: Record<string, number>;
  companionExp?: Record<string, number>;
  zenHighScore?: number;
  survivalHighScore?: number;
  survivalMaxWaves?: number;
  discoveredCharacters: Record<string, { discoveredAt: number; count: number }>;
  boosters: {
    hint: number;
    shuffle: number;
    bomb: number;
  };
  settings: {
    sound: boolean;
    music: boolean;
    vibration: boolean;
  };
  // New Relic, Badge, and World Multi-verse Progression
  relicsCollected?: Record<string, boolean>;
  relicShards?: Record<string, number>;
  relicStars?: Record<string, number>;
  equippedRelicId?: string;
  badgesCollected?: Record<string, boolean>;
  completedDifficulties?: Record<string, { easy?: boolean; medium?: boolean; hard?: boolean }>;
  unlockedRealms?: string[];
  activeRealm?: string;
  activeGameSession?: ActiveGameSession | null;
  // Daily Omikuji & 7-Day Fortune
  lastOmikujiDate?: string;
  omikujiStreak?: number;
  omikujiHistory?: Array<{ date: string; fortuneType: string }>;
  // Mythic Hunter Achievements & Titles
  unlockedAchievements?: Record<string, boolean>;
  selectedTitle?: string;
}

export type OmikujiFortuneType = 'dai_cat' | 'trung_cat' | 'tieu_cat' | 'cat' | 'mat_cat';

export interface DailyFortuneResult {
  fortuneType: OmikujiFortuneType;
  japaneseTitle: string;
  vietnameseTitle: string;
  blessingText: string;
  coins: number;
  diamonds: number;
  universalShards: number;
  boosterReward?: { type: 'hint' | 'shuffle' | 'bomb'; count: number };
  isJackpotDay7?: boolean;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeKey?: string;
  rewardDiamonds: number;
  rewardUniversalShards?: number;
  playerTitleReward: string;
  category: 'battle' | 'combo' | 'progression' | 'collection' | 'zen';
}


export interface ActiveGameSession {
  levelId: string;
  difficulty: DifficultyLevel;
  score: number;
  lives: number;
  timeRemaining: number;
  isSurvivalMode?: boolean;
  isZenMode?: boolean;
  bossId?: string;
  bossHp?: number;
  playerCombatHp?: number;
  survivalWave?: number;
  timestamp: number;
  gridState?: TileState[][];
}

