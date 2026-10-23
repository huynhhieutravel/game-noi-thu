import levelsData from '../data/levels.json';
import bossesData from '../data/bosses.json';
import { CharacterRegistry } from './CharacterRegistry';
import { RelicManager } from './RelicManager';
import { CombatEngine } from './CombatEngine';
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
  primaryCollection: string;
  sisterCollections: string[];
  vanguardEnabled: boolean;
}

export class LevelManager {
  public static readonly TOTAL_LEVELS = 100;
  public static readonly TOTAL_CHAPTERS = 10;
  public static readonly LEVELS_PER_CHAPTER = 10;

  public static readonly VANGUARD_AMBASSADORS = [
    'kasa_obake',
    'nekomata_calico',
    'bake_danuki',
    'kappa_cucumber'
  ];

  public static readonly CHAPTERS: ChapterConfig[] = [
    {
      chapterNum: 1,
      startLevel: 1,
      endLevel: 10,
      worldId: 'yokai',
      title: 'Nhật Bản • Bách Quỷ Khởi Nguyên',
      sub: 'Khởi nguyên huyền bí xứ Phù Tang',
      icon: '⛩️',
      bossId: 'boss_orochi',
      bossName: 'Yamata-no-Orochi',
      bossSymbol: '🐉',
      color: 0xd90429,
      hex: '#d90429',
      primaryCollection: 'yokai',
      sisterCollections: [],
      vanguardEnabled: false
    },
    {
      chapterNum: 2,
      startLevel: 11,
      endLevel: 20,
      worldId: 'egypt',
      title: 'Ai Cập • Sa Mạc & Sông Nile',
      sub: 'Chư Thần Sông Nile & Linh Thú Sa Mạc',
      icon: '🏺',
      bossId: 'boss_apep_pharaoh',
      bossName: 'Apep & Pharaoh Golem',
      bossSymbol: '🐺',
      color: 0xe76f51,
      hex: '#e76f51',
      primaryCollection: 'egypt',
      sisterCollections: ['animal'],
      vanguardEnabled: true
    },
    {
      chapterNum: 3,
      startLevel: 21,
      endLevel: 30,
      worldId: 'greece',
      title: 'Hy Lạp • Đỉnh Núi Olympus',
      sub: 'Lôi Đình Chư Thần & Kỳ Thú Thần Thoại',
      icon: '🏛️',
      bossId: 'boss_typhon_hydra',
      bossName: 'Typhon & Hydra Lerna',
      bossSymbol: '⚡',
      color: 0x3a86ff,
      hex: '#3a86ff',
      primaryCollection: 'greece',
      sisterCollections: ['fantasy'],
      vanguardEnabled: true
    },
    {
      chapterNum: 4,
      startLevel: 31,
      endLevel: 40,
      worldId: 'wuxia',
      title: 'Tam Giới • Tiên Ma Á Đông',
      sub: 'Phi Kiếm Tiên Hiệp & Thần Thoại Joseon',
      icon: '🗡️',
      bossId: 'boss_chaos_dragon',
      bossName: 'Thái Cổ Hắc Long & Imoogi',
      bossSymbol: '✨',
      color: 0xd00000,
      hex: '#d00000',
      primaryCollection: 'wuxia',
      sisterCollections: ['korea', 'yokai'],
      vanguardEnabled: true
    },
    {
      chapterNum: 5,
      startLevel: 41,
      endLevel: 50,
      worldId: 'india',
      title: 'Nam Á • Sử Thi Sông Hằng',
      sub: 'Sử Thi Ramayana & Tinh Linh Rừng Thiêng',
      icon: '🕉️',
      bossId: 'boss_ravana_asura',
      bossName: 'Asura Mười Đầu Ravana',
      bossSymbol: '🐘',
      color: 0xfb5607,
      hex: '#fb5607',
      primaryCollection: 'india',
      sisterCollections: ['plant', 'yokai'],
      vanguardEnabled: true
    },
    {
      chapterNum: 6,
      startLevel: 51,
      endLevel: 60,
      worldId: 'pirate',
      title: 'Vùng Biển Chết • Hải Tặc & Thủy Cung',
      sub: 'Hạm Đội Bóng Ma & Vực Thẳm Đại Dương',
      icon: '⚓',
      bossId: 'boss_davy_jones_kraken',
      bossName: 'Davy Jones & Cự Quái Kraken',
      bossSymbol: '🐙',
      color: 0x118ab2,
      hex: '#118ab2',
      primaryCollection: 'pirate',
      sisterCollections: ['underwater', 'sea'],
      vanguardEnabled: true
    },
    {
      chapterNum: 7,
      startLevel: 61,
      endLevel: 70,
      worldId: 'dinosaur',
      title: 'Tiền Sử • Hỏa Diệm Khủng Long',
      sub: 'Bạo Chúa T-Rex & Cự Quái Nguyên Thủy',
      icon: '🦖',
      bossId: 'boss_magma_trex',
      bossName: 'Bạo Chúa Nham Thạch Magma T-Rex',
      bossSymbol: '🌋',
      color: 0xef476f,
      hex: '#ef476f',
      primaryCollection: 'dinosaur',
      sisterCollections: ['monster'],
      vanguardEnabled: true
    },
    {
      chapterNum: 8,
      startLevel: 71,
      endLevel: 80,
      worldId: 'space',
      title: 'Tương Lai • Hạm Đội Cơ Giáp',
      sub: 'Vũ Trụ Vô Cực & Binh Đoàn Robot Chiến Đấu',
      icon: '🌌',
      bossId: 'boss_singularity_void_dragon',
      bossName: 'Rồng Hố Đen Singularity',
      bossSymbol: '⭐',
      color: 0x4cc9f0,
      hex: '#4cc9f0',
      primaryCollection: 'space',
      sisterCollections: ['robot'],
      vanguardEnabled: true
    },
    {
      chapterNum: 9,
      startLevel: 81,
      endLevel: 90,
      worldId: 'monster',
      title: 'Hỗn Độn • Đại Loạn Đấu Vạn Giới',
      sub: 'Vết Nứt Đa Chiều & Cuộc Chiến Xuyên Không',
      icon: '🌀',
      bossId: 'boss_king_slime_behemoth',
      bossName: 'Hỗn Độn Ma Thần (Slime & Behemoth)',
      bossSymbol: '👾',
      color: 0x9b5de5,
      hex: '#9b5de5',
      primaryCollection: 'all',
      sisterCollections: ['yokai', 'fantasy', 'monster', 'space', 'egypt', 'greece'],
      vanguardEnabled: true
    },
    {
      chapterNum: 10,
      startLevel: 91,
      endLevel: 100,
      worldId: 'underwater',
      title: 'Tối Thượng • Đại Chiến 16 Cự Trùm',
      sub: 'Vương Toạ Thần Thoại & Hộ Vệ Tối Cao',
      icon: '👑',
      bossId: 'boss_omega_mecha_colossus',
      bossName: 'Cỗ Máy Tối Thượng Omega Colossus',
      bossSymbol: '🤖',
      color: 0xffd166,
      hex: '#ffd166',
      primaryCollection: 'all',
      sisterCollections: ['yokai', 'wuxia', 'egypt', 'greece', 'robot'],
      vanguardEnabled: true
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
   * Deterministically shuffles an array based on an integer seed.
   */
  private static seededShuffle<T>(arr: T[], seed: number): T[] {
    const result = [...arr];
    let s = seed;
    for (let i = result.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Intra-Chapter Pacing Formula:
   * Selects an optimal, balanced character pool for a given campaign level (11 - 100):
   * - Levels 1-3: 60% Primary + 40% Vanguard Ambassadors & Familiar squad
   * - Levels 4-7: 75% Primary + 25% Sister Collection
   * - Levels 8-9: 50% Primary + 50% Sister Collection (Elite convergence)
   * - Level 10: Boss Finale featuring signature realm guardians + traveling squad
   */
  public static getCharacterPoolForLevel(levelNum: number, chapter: ChapterConfig): string[] {
    const stepInChapter = ((levelNum - 1) % this.LEVELS_PER_CHAPTER) + 1;
    const poolSize = levelNum <= 20 ? 18 : levelNum <= 50 ? 22 : 28;

    const getAllNonBoss = () => CharacterRegistry.getAll().filter(c => !CharacterRegistry.isBoss(c) && !CharacterRegistry.isCompanion(c));
    const getNonBoss = (col: string) => {
      if (col === 'all') return getAllNonBoss();
      return CharacterRegistry.getNonBossByCollection(col);
    };

    const primaryCandidates = this.seededShuffle(getNonBoss(chapter.primaryCollection), levelNum * 13 + 7);
    const sisterCandidates: string[] = [];
    chapter.sisterCollections.forEach((sc, idx) => {
      const chars = this.seededShuffle(getNonBoss(sc), levelNum * 19 + idx * 31);
      sisterCandidates.push(...chars.map(c => c.id));
    });

    const pool = new Set<string>();

    if (chapter.primaryCollection === 'all') {
      for (const c of primaryCandidates) {
        pool.add(c.id);
        if (pool.size >= poolSize) break;
      }
    } else if (stepInChapter <= 3) {
      // 70% Primary + 30% Vanguard & Sister
      const primTarget = Math.max(6, Math.round(poolSize * 0.70));
      for (const c of primaryCandidates) {
        pool.add(c.id);
        if (pool.size >= primTarget) break;
      }
      if (chapter.vanguardEnabled) {
        const shuffledVanguard = this.seededShuffle(this.VANGUARD_AMBASSADORS, levelNum);
        for (const v of shuffledVanguard) {
          if (pool.size < poolSize) pool.add(v);
        }
      }
      for (const sId of sisterCandidates) {
        if (pool.size < poolSize) pool.add(sId);
      }
    } else if (stepInChapter <= 7) {
      // 75% Primary + 25% Sister
      const primTarget = Math.max(8, Math.round(poolSize * 0.75));
      for (const c of primaryCandidates) {
        pool.add(c.id);
        if (pool.size >= primTarget) break;
      }
      for (const sId of sisterCandidates) {
        if (pool.size < poolSize) pool.add(sId);
      }
    } else if (stepInChapter <= 9) {
      // 65% Primary + 35% Sister (Elite convergence)
      const primTarget = Math.max(8, Math.round(poolSize * 0.65));
      for (const c of primaryCandidates) {
        pool.add(c.id);
        if (pool.size >= primTarget) break;
      }
      for (const sId of sisterCandidates) {
        if (pool.size < poolSize) pool.add(sId);
      }
    } else {
      // Milestone Boss Level: 70% Primary + Sister + 1 Vanguard companion facing the Boss
      const primTarget = Math.max(8, Math.round(poolSize * 0.70));
      for (const c of primaryCandidates) {
        pool.add(c.id);
        if (pool.size >= primTarget) break;
      }
      for (const sId of sisterCandidates) {
        if (pool.size < poolSize - 1) pool.add(sId);
      }
      if (chapter.vanguardEnabled) {
        pool.add(this.VANGUARD_AMBASSADORS[levelNum % this.VANGUARD_AMBASSADORS.length]);
      }
    }

    // Safety fallback: if pool still hasn't reached target size, pull from all non-boss characters
    if (pool.size < poolSize) {
      const allChars = this.seededShuffle(getAllNonBoss(), levelNum * 37 + 101);
      for (const c of allChars) {
        pool.add(c.id);
        if (pool.size >= poolSize) break;
      }
    }

    return Array.from(pool);
  }

  /**
   * Return level configuration by Level ID or Number.
   * If Level 1..10, loads from handcrafted levels.json.
   * If Level 11..100, procedural generation tailored to chapter theme and progressive difficulty.
   */
  public static getLevelConfig(levelIdOrNum: string | number, currentTheme?: string, difficulty?: DifficultyLevel): LevelConfig {
    const levelNum = typeof levelIdOrNum === 'number'
      ? levelIdOrNum
      : (parseInt(String(levelIdOrNum).replace('level_', '')) || 1);
    const levelId = typeof levelIdOrNum === 'string' && levelIdOrNum.startsWith('level_')
      ? levelIdOrNum
      : `level_${String(levelNum).padStart(2, '0')}`;

    // 1. Check handcrafted levels (Levels 1 - 10)
    const allLevels = levelsData as LevelConfig[];
    const found = allLevels.find(l => (l.id === levelId || l.levelNumber === levelNum) && l.levelNumber <= 10);
    let baseConfig: LevelConfig;

    if (found) {
      baseConfig = {
        ...found,
        // Guarantee clean character pool
        characterPool: found.characterPool.filter(id => !CharacterRegistry.isBoss(id))
      };
    } else {
      // 2. Procedural Level for Levels 11 - 100 with Sister-Theme Pairing & Intra-Chapter Pacing
      const chapter = this.getChapterByLevel(levelNum);
      const theme = chapter.worldId;
      const pool = this.getCharacterPoolForLevel(levelNum, chapter);

      // Board Dimensions
      const rows = levelNum <= 20 ? 6 : levelNum <= 50 ? 6 : 8;
      const cols = levelNum <= 20 ? 8 : levelNum <= 50 ? 10 : 12;

      // Boss configuration if it's the milestone 10th level of chapter
      const isBossLevel = levelNum % 10 === 0;

      // Dynamic Gravity Movement (Milestone Boss levels always use static 'none' to focus on boss mechanics)
      const MOVEMENTS: BoardMovement[] = [
        'none',
        'down',
        'up',
        'left',
        'right',
        'split_vertical',
        'split_horizontal',
        'center_row',
        'center_col'
      ];
      const movement = isBossLevel ? 'none' : MOVEMENTS[levelNum % MOVEMENTS.length];

      // Time Limit (scales smoothly, minimum 75 seconds)
      const timeLimit = Math.max(75, 160 - Math.floor(levelNum * 0.7));
      let bossConfig: BossConfig | undefined = undefined;
      if (isBossLevel) {
        const bList = bossesData as any[];
        const bData = bList.find(b => b.id === chapter.bossId) || bList.find(b => b.theme === theme) || bList[(chapter.chapterNum - 1) % bList.length] || bList[0];
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

      // Relic Reward linked to RelicManager
      const chapterRelics = RelicManager.getInstance().getRelicsByChapter(chapter.chapterNum);
      const mod10 = levelNum % 10;
      let relicItem = chapterRelics[0]; // Hạ phẩm (Màn 1-4)
      if (mod10 >= 5 && mod10 <= 8 && chapterRelics[1]) {
        relicItem = chapterRelics[1]; // Trung phẩm (Màn 5-8)
      } else if ((mod10 === 9 || mod10 === 0) && chapterRelics[2]) {
        relicItem = chapterRelics[2]; // Thượng phẩm (Màn 9, 10 Trùm)
      }

      const relicReward: RelicReward = relicItem ? {
        id: relicItem.id,
        name: relicItem.name,
        japaneseName: relicItem.subName,
        icon: relicItem.icon,
        description: relicItem.skillDesc,
        worldId: relicItem.worldId,
        levelId,
        tier: relicItem.tier,
        tierName: relicItem.tierName,
        image: relicItem.image,
        skillName: relicItem.skillName,
        skillDesc: relicItem.skillDesc,
        rageCost: relicItem.rageCost
      } : {
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
        { id: `badge_${levelId}_easy`, name: `Đồng Màn ${levelNum}`, characterId: badgeChar1, tier: 1, rarity: 'common' },
        { id: `badge_${levelId}_med`, name: `Bạc Màn ${levelNum}`, characterId: badgeChar2, tier: 2, rarity: 'rare' },
        { id: `badge_${levelId}_hard`, name: `Vàng Màn ${levelNum}`, characterId: badgeChar3, tier: 3, rarity: 'epic' }
      ];

      baseConfig = {
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
            characterPoolCount: Math.min(pool.length, levelNum <= 20 ? 14 : levelNum <= 50 ? 16 : 20),
            modifierMultiplier: 0.6,
            rewardMultiplier: 1.0
          },
          medium: {
            timeLimit,
            characterPoolCount: Math.min(pool.length, levelNum <= 20 ? 18 : levelNum <= 50 ? 20 : 24),
            modifierMultiplier: 1.0,
            rewardMultiplier: 1.5
          },
          hard: {
            timeLimit: Math.round(timeLimit * 0.75),
            characterPoolCount: Math.min(pool.length, levelNum <= 20 ? 22 : levelNum <= 50 ? 24 : 28),
            modifierMultiplier: 1.5,
            rewardMultiplier: 2.5
          }
        },
        quests,
        relicReward,
        badgeRewards
      };
    }

    if (difficulty) {
      return this.applyDifficultyToConfig(baseConfig, difficulty);
    }
    const sanitizedQuests = LevelManager.sanitizeQuestsForDifficulty(
      baseConfig.quests,
      baseConfig.modifiers,
      'medium',
      baseConfig.timeLimit,
      false,
      !!baseConfig.boss
    );
    return {
      ...baseConfig,
      quests: sanitizedQuests
    };
  }

  /**
   * 🛡️ Comprehensive Quest Sanitizer & Feasibility Guarantee
   * Guarantees 100% feasibility of every 3-star quest on every level across Easy, Medium, and Hard.
   * If a level or difficulty setting has 0 of a requested obstacle (e.g. stones, ice, locks),
   * or fewer than the target, this method seamlessly adapts the quest to a fair skill challenge
   * (e.g. Combo streak, speedrun, or no-booster) so players are never blocked from earning 3 stars.
   */
  public static sanitizeQuestsForDifficulty(
    baseQuests: LevelQuest[] | undefined,
    modifiers: Record<string, number | undefined> | undefined,
    difficulty: DifficultyLevel,
    timeLimit: number = 90,
    isStopwatch: boolean = false,
    isBoss: boolean = false
  ): LevelQuest[] {
    const defaultQuests: LevelQuest[] = [
      { id: 'q1', type: 'clear', target: 1, description: isBoss ? 'Tiêu diệt Trùm Thử Thách' : 'Dọn sạch bàn cờ trước khi hết giờ', icon: '🎯' },
      { id: 'q2', type: 'combo', target: difficulty === 'easy' ? 4 : difficulty === 'hard' ? 6 : 5, description: `Đạt chuỗi Combo liên tiếp x${difficulty === 'easy' ? 4 : difficulty === 'hard' ? 6 : 5}`, icon: '⚡' },
      { id: 'q3', type: 'no_booster', target: 0, description: 'Không dùng bất kỳ Trợ giúp nào', icon: '✨' }
    ];

    if (!baseQuests || baseQuests.length === 0) {
      return defaultQuests;
    }

    const mods = modifiers || {};
    const stoneCount = mods.stoneCount || 0;
    const iceCount = mods.iceCount || 0;
    const lockCount = mods.lockCount || 0;

    const sanitized: LevelQuest[] = [];

    for (let i = 0; i < baseQuests.length; i++) {
      const q = baseQuests[i];
      let validQ: LevelQuest = { ...q };

      if (q.type === 'break_stone') {
        if (stoneCount >= (q.target || 1)) {
          validQ = { ...q };
        } else if (stoneCount > 0) {
          validQ = {
            ...q,
            target: stoneCount,
            description: `Phá vỡ ít nhất ${stoneCount} tảng đá cản trở`
          };
        } else {
          // Zero stones on this difficulty/level -> adapt to fair combo challenge
          const comboTarget = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 6 : 5;
          validQ = {
            id: q.id || `q${i + 1}`,
            type: 'combo',
            target: comboTarget,
            description: `Đạt chuỗi Combo liên tiếp x${comboTarget}`,
            icon: '⚡'
          };
        }
      } else if (q.type === 'break_ice') {
        if (iceCount >= (q.target || 1)) {
          validQ = { ...q };
        } else if (iceCount > 0) {
          validQ = {
            ...q,
            target: iceCount,
            description: `Phá tan toàn bộ ${iceCount} khối băng giá`
          };
        } else {
          // Zero ice on this difficulty/level -> adapt to fair combo challenge
          const comboTarget = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 6 : 5;
          validQ = {
            id: q.id || `q${i + 1}`,
            type: 'combo',
            target: comboTarget,
            description: `Đạt chuỗi Combo liên tiếp x${comboTarget}`,
            icon: '⚡'
          };
        }
      } else if (q.type === 'rescue_cages') {
        if (lockCount >= (q.target || 1)) {
          validQ = { ...q };
        } else if (lockCount > 0) {
          validQ = {
            ...q,
            target: lockCount,
            description: `Mở thành công ${lockCount} Ổ khóa phong ấn`
          };
        } else {
          // Zero locks on this difficulty/level -> adapt to no_booster
          validQ = {
            id: q.id || `q${i + 1}`,
            type: 'no_booster',
            target: 0,
            description: 'Không dùng bất kỳ Trợ giúp nào',
            icon: '✨'
          };
        }
      } else if (q.type === 'time_left') {
        if (isStopwatch) {
          validQ = {
            ...q,
            description: 'Hoàn thành bàn cờ tốc chiến (Thời gian Vàng)',
            icon: '⏱️'
          };
        } else {
          const maxSafeTarget = Math.max(15, Math.round(timeLimit * 0.45));
          if (q.target > maxSafeTarget) {
            validQ = {
              ...q,
              target: maxSafeTarget,
              description: `Hoàn thành khi thời gian còn > ${maxSafeTarget}s`
            };
          }
        }
      }

      sanitized.push(validQ);
    }

    // De-duplicate quest types: if multiple quests ended up with the same type (e.g. combo),
    // diversify so the 3 stars remain varied and exciting!
    const seenTypes = new Set<string>();
    for (let i = 0; i < sanitized.length; i++) {
      const q = sanitized[i];
      if (seenTypes.has(q.type) && q.type !== 'clear') {
        if (!seenTypes.has('no_booster')) {
          sanitized[i] = {
            id: q.id,
            type: 'no_booster',
            target: 0,
            description: 'Không dùng bất kỳ Trợ giúp nào',
            icon: '✨'
          };
        } else if (!seenTypes.has('no_shuffle')) {
          sanitized[i] = {
            id: q.id,
            type: 'no_shuffle',
            target: 0,
            description: 'Không sử dụng tính năng Đổi vị trí',
            icon: '🔄'
          };
        }
      }
      seenTypes.add(sanitized[i].type);
    }

    return sanitized;
  }

  /**
   * Clone and adjust a LevelConfig according to Difficulty (Easy, Medium, Hard).
   */
  public static applyDifficultyToConfig(base: LevelConfig, difficulty: DifficultyLevel): LevelConfig {
    const diffCfg = base.difficulties?.[difficulty];
    const levelNum = base.levelNumber;
    const isEasy = difficulty === 'easy';
    const isHard = difficulty === 'hard';

    // 1. Chapter 1 Easy Mode Custom Pacing (User approved specs)
    if (isEasy && levelNum <= 10) {
      let r = 4;
      let c = 6;
      let poolCount = 4;
      let mov: BoardMovement = 'none';
      let gold = 35;
      let silver = 55;

      switch (levelNum) {
        case 1:
          r = 4; c = 6; poolCount = 4; mov = 'none'; gold = 35; silver = 55;
          break;
        case 2:
          r = 6; c = 6; poolCount = 7; mov = 'none'; gold = 45; silver = 70;
          break;
        case 3:
          r = 6; c = 6; poolCount = 8; mov = 'none'; gold = 50; silver = 75;
          break;
        case 4:
          r = 6; c = 8; poolCount = 9; mov = 'none'; gold = 60; silver = 90;
          break;
        case 5:
          r = 6; c = 8; poolCount = 10; mov = 'none'; gold = 65; silver = 95;
          break;
        case 6:
          r = 6; c = 8; poolCount = 11; mov = 'none'; gold = 70; silver = 100;
          break;
        case 7:
          r = 6; c = 10; poolCount = 12; mov = 'down'; gold = 80; silver = 110;
          break;
        case 8:
          r = 6; c = 10; poolCount = 13; mov = 'left'; gold = 85; silver = 115;
          break;
        case 9:
          r = 8; c = 8; poolCount = 14; mov = 'center_row'; gold = 95; silver = 125;
          break;
        case 10:
          r = 8; c = 9; poolCount = 12; mov = 'none'; gold = 110; silver = 140;
          break;
      }

      const rawPool = base.characterPool || [];
      const pool = [...rawPool].slice(0, poolCount);
      const finalModifiers = {};
      const sanitizedQuests = LevelManager.sanitizeQuestsForDifficulty(
        base.quests,
        finalModifiers,
        'easy',
        silver + 60,
        true,
        false
      );

      return {
        ...base,
        rows: r,
        columns: c,
        characterPool: pool,
        movement: mov,
        modifiers: finalModifiers,
        isStopwatch: true,
        targetGoldSeconds: gold,
        targetSilverSeconds: silver,
        timeLimit: silver + 60,
        quests: sanitizedQuests
      };
    }

    // 2. Easy Mode for Levels 11 - 100 (Dynamic Onet Variety Formula: 12-22 unique characters)
    if (isEasy) {
      const r = levelNum <= 30 ? 6 : levelNum <= 70 ? 6 : 8;
      const c = levelNum <= 30 ? 8 : levelNum <= 70 ? 10 : 10;
      const totalPairs = (r * c) / 2;
      const rawPool = base.characterPool || [];
      const stepInChapter = ((levelNum - 1) % 10) + 1;
      const intraStepBonus = stepInChapter <= 3 ? 0 : stepInChapter <= 7 ? 1 : 2;
      const baseFloor = levelNum <= 20 ? 12 : levelNum <= 50 ? 14 : 16;
      const minFloor = baseFloor + intraStepBonus;
      const maxCap = levelNum <= 20 ? 15 : levelNum <= 50 ? 18 : 22;
      const targetU = Math.round(totalPairs * 0.52);
      const poolCount = Math.min(rawPool.length, Math.max(minFloor, Math.min(maxCap, targetU)));
      const pool = [...rawPool].slice(0, poolCount);
      const gold = 60 + Math.floor(levelNum * 0.8);
      const silver = gold + 35;

      // Only very light modifiers, no hard stones/barricades in Easy
      const lightMods = levelNum <= 20 ? {} : {
        iceCount: Math.min(2, Math.floor(levelNum / 40)),
        webCount: Math.min(1, Math.floor(levelNum / 50))
      };

      let scaledBoss = base.boss;
      if (base.boss) {
        const bossCombat = CombatEngine.calculateBossStats(
          levelNum,
          'easy',
          base.boss.maxHp || 600,
          (base.boss as any).attackPower || 120
        );
        scaledBoss = {
          ...base.boss,
          maxHp: bossCombat.maxHp,
          actionIntervalSeconds: bossCombat.actionIntervalSeconds,
          attackPower: bossCombat.attackPower
        } as any;
      }

      const sanitizedQuests = LevelManager.sanitizeQuestsForDifficulty(
        base.quests,
        lightMods,
        'easy',
        silver + 60,
        true,
        !!base.boss
      );

      return {
        ...base,
        rows: r,
        columns: c,
        characterPool: pool,
        movement: levelNum <= 15 ? 'none' : base.movement,
        modifiers: lightMods,
        isStopwatch: true,
        targetGoldSeconds: gold,
        targetSilverSeconds: silver,
        timeLimit: silver + 60,
        boss: scaledBoss,
        quests: sanitizedQuests
      };
    }

    // 3. Medium & Hard Modes
    const rawPool = base.characterPool || [];
    const pool = [...rawPool];
    const limitedPool = diffCfg?.characterPoolCount && pool.length > diffCfg.characterPoolCount
      ? pool.slice(0, diffCfg.characterPoolCount)
      : pool;

    const mult = diffCfg?.modifierMultiplier ?? (isHard ? 1.5 : 1.0);
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

    const targetTime = diffCfg?.timeLimit || (isHard ? Math.round(base.timeLimit * 0.75) : base.timeLimit);

    let scaledBoss = base.boss;
    if (base.boss) {
      const bossCombat = CombatEngine.calculateBossStats(
        levelNum,
        difficulty,
        base.boss.maxHp || 600,
        (base.boss as any).attackPower || 120
      );
      scaledBoss = {
        ...base.boss,
        maxHp: bossCombat.maxHp,
        actionIntervalSeconds: bossCombat.actionIntervalSeconds,
        attackPower: bossCombat.attackPower
      } as any;
    }

    const sanitizedQuests = LevelManager.sanitizeQuestsForDifficulty(
      base.quests,
      scaledModifiers,
      difficulty,
      targetTime,
      false,
      !!base.boss
    );

    return {
      ...base,
      isStopwatch: false,
      timeLimit: targetTime,
      characterPool: limitedPool,
      modifiers: scaledModifiers,
      boss: scaledBoss,
      quests: sanitizedQuests
    };
  }
}
