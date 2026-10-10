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
}

export interface BossSkill {
  type: 'ice_curse' | 'rock_blocker' | 'tile_swap' | 'fog_curse' | 'time_drain';
  name: string;
  description: string;
}

export interface BossConfig {
  id: string;
  name: string;
  japaneseName: string;
  maxHp: number;
  actionIntervalSeconds: number;
  headsOrParts?: number;
  skills: BossSkill[];
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
  boss?: BossConfig;
  rewards: {
    coins: number;
    stars: number;
    unlockCharacterId?: string;
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
}
