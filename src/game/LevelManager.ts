import levelsData from '../data/levels.json';
import bossesData from '../data/bosses.json';
import { CharacterRegistry } from './CharacterRegistry';
import {
  BadgeReward,
  BoardMovement,
  BossConfig,
  DifficultyLevel,
  LevelConfig,
  LevelQuest,
  RelicReward
} from '../types';

export interface ChapterConfig {
  chapterNum: number; // 1 to 10
  startLevel: number;
  endLevel: number;
  worldId: string;
  title: string;
  sub: string;
  icon: string;
  bossId: string;
  bossName: string;
  bossSymbol: string;
  color: number;
  hex: string;
}

export class LevelManager {
  public static readonly TOTAL_LEVELS = 100;
  public static readonly TOTAL_CHAPTERS = 10;
  public static readonly LEVELS_PER_CHAPTER = 10;

  public static readonly CHAPTERS: ChapterConfig[] = [
    {
      chapterNum: 1,
      startLevel: 1,
      endLevel: 10,
      worldId: 'yokai',
      title: 'Nhật Bản • Bách Quỷ Đồ Thư',
      sub: 'Khởi nguyên huyền bí xứ Phù Tang',
      icon: '⛩️',
      bossId: 'boss_orochi',
      bossName: 'Yamata-no-Orochi',
      bossSymbol: '🐉',
      color: 0xd90429,
      hex: '#d90429'
    },
    {
      chapterNum: 2,
      startLevel: 11,
      endLevel: 20,
      worldId: 'egypt',
      title: 'Ai Cập • Kim Tự Tháp Thần Bí',
      sub: 'Chư Thần Sông Nile & Lời Nguyền Sa Mạc',
      icon: '🏺',
      bossId: 'boss_apep_pharaoh',
      bossName: 'Apep & Pharaoh Golem',
      bossSymbol: '🐺',
      color: 0xe76f51,
      hex: '#e76f51'
    },
    {
      chapterNum: 3,
      startLevel: 21,
      endLevel: 30,
      worldId: 'greece',
      title: 'Hy Lạp • Đỉnh Núi Olympus',
      sub: 'Lôi Đình Zeus & Minh Giới Hades',
      icon: '🏛️',
      bossId: 'boss_typhon_medusa',
      bossName: 'Typhon & Medusa Gorgon',
      bossSymbol: '⚡',
      color: 0x3a86ff,
      hex: '#3a86ff'
    },
    {
      chapterNum: 4,
      startLevel: 31,
      endLevel: 40,
      worldId: 'wuxia',
      title: 'Võ Hiệp • Cửu Châu Tiên Giới',
      sub: 'Phi Kiếm Ngự Phong & Trảm Ma Độ Thế',
      icon: '🗡️',
      bossId: 'boss_chaos_demon',
      bossName: 'Hỗn Độn Ma Tôn & Kiếm Linh',
      bossSymbol: '✨',
      color: 0xd00000,
      hex: '#d00000'
    },
    {
      chapterNum: 5,
      startLevel: 41,
      endLevel: 50,
      worldId: 'korea',
      title: 'Hàn Quốc • Thần Thoại Joseon',
      sub: 'Cửu Vĩ Hồ Ly & Thần Thú Trấn Linh',
      icon: '🐯',
      bossId: 'boss_gumiho_tiger',
      bossName: 'Cửu Vĩ Linh Hồ & Hổ Thần',
      bossSymbol: '🦊',
      color: 0x8338ec,
      hex: '#8338ec'
    },
    {
      chapterNum: 6,
      startLevel: 51,
      endLevel: 60,
      worldId: 'india',
      title: 'Ấn Độ • Sử Thi Ramayana',
      sub: 'Sông Hằng Thần Bí & Voi Thần Ganesha',
      icon: '🕉️',
      bossId: 'boss_asura_ravana',
      bossName: 'Asura Mahishasura & Ravana',
      bossSymbol: '🐘',
      color: 0xfb5607,
      hex: '#fb5607'
    },
    {
      chapterNum: 7,
      startLevel: 61,
      endLevel: 70,
      worldId: 'sea',
      title: 'Đông Nam Á • Long Vương Mê Kông',
      sub: 'Phaya Naga & Kim Xí Điểu Garuda',
      icon: '🐲',
      bossId: 'boss_naga_garuda',
      bossName: 'Phaya Naga & Chiến Thần Garuda',
      bossSymbol: '🌊',
      color: 0x06d6a0,
      hex: '#06d6a0'
    },
    {
      chapterNum: 8,
      startLevel: 71,
      endLevel: 80,
      worldId: 'pirate',
      title: 'Hải Tặc • Vùng Biển Tử Thần',
      sub: 'Hạm Đội Bóng Ma & Chúa Tể Kraken',
      icon: '⚓',
      bossId: 'boss_davy_jones_kraken',
      bossName: 'Davy Jones & Cự Quái Kraken',
      bossSymbol: '🐙',
      color: 0x118ab2,
      hex: '#118ab2'
    },
    {
      chapterNum: 9,
      startLevel: 81,
      endLevel: 90,
      worldId: 'dinosaur',
      title: 'Kỷ Băng Hà • Hỏa Diệm Khủng Long',
      sub: 'Bạo Chúa T-Rex & Cự Long Tiền Sử',
      icon: '🦖',
      bossId: 'boss_volcanic_trex',
      bossName: 'Bạo Chúa T-Rex & Thần Dực',
      bossSymbol: '🌋',
      color: 0xef476f,
      hex: '#ef476f'
    },
    {
      chapterNum: 10,
      startLevel: 91,
      endLevel: 100,
      worldId: 'space',
      title: 'Thiên Hà • Vũ Trụ Vô Cực',
      sub: 'Cơ Giáp Tối Thượng & Tinh Vân Tinh Tú',
      icon: '🌌',
      bossId: 'boss_cosmic_titan',
      bossName: 'Vũ Trụ Cự Thần & Cơ Giáp Tinh Hà',
      bossSymbol: '⭐',
      color: 0x4cc9f0,
      hex: '#4cc9f0'
    }
  ];

  public static getChapterByLevel(levelNum: number): ChapterConfig {
    const clamped = Math.max(1, Math.min(this.TOTAL_LEVELS, levelNum));
    const chapterIdx = Math.floor((clamped - 1) / this.LEVELS_PER_CHAPTER);
    return this.CHAPTERS[chapterIdx] || this.CHAPTERS[0];
  }

  public static getChapterConfig(chapterNum: number): ChapterConfig {
    const idx = Math.max(1, Math.min(this.TOTAL_CHAPTERS, chapterNum)) - 1;
    return this.CHAPTERS[idx] || this.CHAPTERS[0];
  }

  public static getAllChapters(): ChapterConfig[] {
    return this.CHAPTERS;
  }

  /**
   * Return level configuration by Level ID or Number.
   * If Level 1..10, loads from handcrafted levels.json.
   * If Level 11..100, procedural generation tailored to chapter theme and progressive difficulty.
   */
  public static getLevelConfig(levelIdOrNum: string | number, currentTheme?: string): LevelConfig {
    const levelNum = typeof levelIdOrNum === 'number'
      ? levelIdOrNum
      : (parseInt(String(levelIdOrNum).replace('level_', '')) || 1);
    const levelId = typeof levelIdOrNum === 'string' && levelIdOrNum.startsWith('level_')
      ? levelIdOrNum
      : `level_${String(levelNum).padStart(2, '0')}`;

    // 1. Check handcrafted levels (Levels 1 - 10)
    const allLevels = levelsData as LevelConfig[];
    const found = allLevels.find(l => (l.id === levelId || l.levelNumber === levelNum) && l.levelNumber <= 10);
    if (found) {
      return {
        ...found,
        // Guarantee clean character pool
        characterPool: found.characterPool.filter(id => !CharacterRegistry.isBoss(id))
      };
    }

    // 2. Procedural Level for Levels 11 - 100
    const chapter = this.getChapterByLevel(levelNum);
    const theme = chapter.worldId;

    // Get non-boss character pool for this theme
    let themeChars = CharacterRegistry.getNonBossByCollection(theme);
    if (themeChars.length < 8) {
      themeChars = CharacterRegistry.getNonBossByCollection('yokai');
    }
    const poolSize = Math.min(themeChars.length, 8 + Math.floor(levelNum / 6));
    const pool = themeChars.map(c => c.id).slice(0, poolSize);

    // Board Dimensions
    const rows = levelNum <= 20 ? 6 : levelNum <= 50 ? 6 : 8;
    const cols = levelNum <= 20 ? 8 : levelNum <= 50 ? 10 : 12;

    // Dynamic Gravity Movement
    const MOVEMENTS: BoardMovement[] = [
      'none',
      'down',
      'up',
      'left',
      'right',
      'split_vertical',
      'split_horizontal',
      'center_row',
      'center_col',
      'chaos'
    ];
    const movement = MOVEMENTS[levelNum % MOVEMENTS.length];

    // Time Limit (scales smoothly, minimum 75 seconds)
    const timeLimit = Math.max(75, 160 - Math.floor(levelNum * 0.7));

    // Boss configuration if it's the milestone 10th level of chapter
    const isBossLevel = levelNum % 10 === 0;
    let bossConfig: BossConfig | undefined = undefined;
    if (isBossLevel) {
      const bList = bossesData as any[];
      const bData = bList.find(b => b.theme === theme) || bList[(chapter.chapterNum - 1) % bList.length] || bList[0];
      bossConfig = {
        id: bData.id,
        name: bData.name,
        japaneseName: bData.native_name || bData.title,
        native_name: bData.native_name,
        title: bData.title,
        element: bData.element,
        symbol: bData.symbol,
        theme: bData.theme,
        image: bData.id,
        maxHp: Math.round((bData.max_hp || 600) * (1 + levelNum / 80)),
        actionIntervalSeconds: Math.max(6, (bData.action_interval || 8) - Math.floor(levelNum / 50)),
        headsOrParts: bData.parts || 8,
        parts: bData.parts || 8,
        part_name: bData.part_name || 'Bộ Phận',
        skills: bData.skills || [],
        desc: bData.desc
      };
    }

    // Quests
    const quests: LevelQuest[] = [
      { id: 'q1', type: 'clear', target: 1, description: 'Dọn sạch bàn cờ trước khi hết giờ', icon: '🎯' },
      { id: 'q2', type: 'combo', target: 4 + Math.min(6, Math.floor(levelNum / 15)), description: `Đạt chuỗi Combo liên tiếp x${4 + Math.min(6, Math.floor(levelNum / 15))}`, icon: '⚡' },
      { id: 'q3', type: 'no_booster', target: 0, description: 'Không dùng trợ giúp', icon: '⭐' }
    ];

    // Relic Reward
    const relicReward: RelicReward = {
      id: `relic_${theme}_${levelNum}`,
      name: `Mảnh Thần Khí ${chapter.title.split('•')[0].trim()}`,
      japaneseName: `${chapter.title.split('•')[1]?.trim() || '神器'}`,
      icon: isBossLevel ? '👑' : chapter.icon,
      description: `Mảnh vỡ cổ vật rơi ra từ ${chapter.title} tại Màn ${levelNum}. Thu thập để gia tăng sức mạnh.`,
      worldId: theme,
      levelId
    };

    // 3 Monster Badges per level
    const badgeChar1 = pool[0] || 'kasa_obake';
    const badgeChar2 = pool[1] || 'nurikabe';
    const badgeChar3 = pool[2] || 'tengu';
    const badgeRewards: BadgeReward[] = [
      { id: `badge_${levelId}_easy`, name: `Huy Hiệu Đồng Màn ${levelNum}`, characterId: badgeChar1, tier: 1, rarity: 'common' },
      { id: `badge_${levelId}_med`, name: `Huy Hiệu Bạc Màn ${levelNum}`, characterId: badgeChar2, tier: 2, rarity: 'rare' },
      { id: `badge_${levelId}_hard`, name: `Huy Hiệu Vàng Màn ${levelNum}`, characterId: badgeChar3, tier: 3, rarity: 'epic' }
    ];

    return {
      id: levelId,
      levelNumber: levelNum,
      worldId: theme,
      title: isBossLevel
        ? `Màn ${levelNum}: Trảm Đại Trùm ${bossConfig?.name || chapter.bossName}`
        : `Màn ${levelNum}: ${chapter.title.split('•')[1]?.trim() || chapter.title}`,
      rows,
      columns: cols,
      timeLimit,
      movement,
      modifiers: {
        iceCount: Math.min(6, Math.floor(levelNum / 15)),
        stoneCount: Math.min(4, Math.floor(levelNum / 20)),
        thornCount: Math.min(4, Math.floor(levelNum / 20)),
        webCount: Math.min(4, Math.floor(levelNum / 25)),
        barricadeCount: Math.min(3, Math.floor(levelNum / 30))
      },
      characterPool: pool,
      boss: bossConfig,
      rewards: {
        coins: 150 + levelNum * 25,
        stars: 3
      },
      difficulties: {
        easy: {
          timeLimit: Math.round(timeLimit * 1.3),
          characterPoolCount: Math.min(pool.length, 10),
          modifierMultiplier: 0.6,
          rewardMultiplier: 1.0
        },
        medium: {
          timeLimit,
          characterPoolCount: Math.min(pool.length, 16),
          modifierMultiplier: 1.0,
          rewardMultiplier: 1.5
        },
        hard: {
          timeLimit: Math.round(timeLimit * 0.75),
          characterPoolCount: Math.min(pool.length, 22),
          modifierMultiplier: 1.5,
          rewardMultiplier: 2.5
        }
      },
      quests,
      relicReward,
      badgeRewards
    };
  }

  /**
   * Clone and adjust a LevelConfig according to Difficulty (Easy, Medium, Hard).
   */
  public static applyDifficultyToConfig(base: LevelConfig, difficulty: DifficultyLevel): LevelConfig {
    const diffCfg = base.difficulties?.[difficulty];
    if (!diffCfg) return { ...base };

    const pool = [...base.characterPool];
    const limitedPool = diffCfg.characterPoolCount && pool.length > diffCfg.characterPoolCount
      ? pool.slice(0, diffCfg.characterPoolCount)
      : pool;

    const mult = diffCfg.modifierMultiplier ?? 1.0;
    const baseMods = base.modifiers || {};
    const scaledModifiers = {
      iceCount: Math.round((baseMods.iceCount || 0) * mult),
      stoneCount: Math.round((baseMods.stoneCount || 0) * mult),
      thornCount: Math.round((baseMods.thornCount || 0) * mult),
      webCount: Math.round((baseMods.webCount || 0) * mult),
      barricadeCount: Math.round((baseMods.barricadeCount || 0) * mult),
      lockCount: Math.round((baseMods.lockCount || 0) * mult),
      fogCount: Math.round((baseMods.fogCount || 0) * mult)
    };

    return {
      ...base,
      timeLimit: diffCfg.timeLimit,
      characterPool: limitedPool,
      modifiers: scaledModifiers
    };
  }
}
