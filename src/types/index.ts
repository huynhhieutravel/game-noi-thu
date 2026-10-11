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
}

export interface RelicReward {
  id: string;
  name: string;
  japaneseName?: string;
  icon: string;
  description: string;
  worldId: string;
  levelId: string;
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

export interface CompanionConfig {
  id: string;
  name: string;
  title: string;
  icon: string;
  element: string;
  themeColor: number;
  skillName: string;
  skillDesc: string;
  cost: number;
  unlockReqDesc?: string;
}

export interface UserSaveData {
  version: number;
  coins: number;
  stars: number;
  highestLevel: number;
  levelStars: Record<string, number>;
  selectedTheme?: string;
  selectedCompanion?: string;
  unlockedCompanions?: string[];
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
  badgesCollected?: Record<string, boolean>;
  completedDifficulties?: Record<string, { easy?: boolean; medium?: boolean; hard?: boolean }>;
  unlockedRealms?: string[];
  activeRealm?: string;
}
