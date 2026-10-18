import levelsData from '../data/levels.json';

export type StageType = 'regular' | 'miniboss' | 'boss';

export interface StageLootConfig {
  levelNumber: number;
  chapter: number;
  chapterName: string;
  stageName: string;
  stageType: StageType;
  
  // Mathematical Base Values
  baseExp: number;
  baseCoins: number;
  
  // Multipliers
  stageExpMult: number;     // 1.0 (regular), 1.25 (miniboss), 1.6 (boss)
  stageCoinMult: number;    // 1.0 (regular), 1.25 (miniboss), 1.5 (boss)
  
  // Item specific to this stage
  itemType: 'hint' | 'shuffle' | 'bomb';
  itemName: string;
  itemIcon: string;
  itemDropRate: { easy: number; medium: number; hard: number };

  // Companions
  mainCompanionId: string;
  mainCompanionName: string;
  mainShardRate: { easy: number; medium: number; hard: number };

  subCompanionId: string;
  subCompanionName: string;
  subShardRate: { easy: number; medium: number; hard: number };

  // Precomputed reward matrix for easy inspection
  rewardsMatrix: {
    easy: { exp: number; coins: number; mainShardPct: string; subShardPct: string; itemPct: string };
    medium: { exp: number; coins: number; mainShardPct: string; subShardPct: string; itemPct: string };
    hard: { exp: number; coins: number; mainShardPct: string; subShardPct: string; itemPct: string };
    threeStarExpBonus: string;
    threeStarCoinBonus: string;
  };
}

export interface ChapterLootConfig {
  chapter: number;
  chapterName: string;
  levelRange: [number, number];
  mainCompanionId: string;
  mainCompanionName: string;
  subCompanionId: string;
  subCompanionName: string;
  baseExp: number;
  baseCoins: number;
  itemType: 'hint' | 'shuffle' | 'bomb';
  itemIcon: string;
  itemName: string;
}

export interface DifficultyDropRates {
  mainShardRate: number; // e.g. 0.025 = 2.5%
  subShardRate: number;  // e.g. 0.008 = 0.8%
  itemRate: number;      // e.g. 0.03 = 3%
  expMultiplier: number; // e.g. 1.0, 1.3, 1.8
  coinMultiplier: number;
}

export interface BossDropRates {
  bossShardRate: number; // 0.15, 0.30, 0.50
  bonusShardOn3Stars: number;
  expMultiplier: number;
}

export interface CalculatedLootResult {
  expEarned: number;
  coinsEarned: number;
  mainShardsEarned: number;
  mainCompanionId: string;
  mainCompanionName: string;
  subShardsEarned: number;
  subCompanionId: string;
  subCompanionName: string;
  itemEarned?: {
    type: 'hint' | 'shuffle' | 'bomb';
    name: string;
    icon: string;
  };
  isBoss: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export class LootManager {
  // 10 Chapters distribution for 10 Companions
  public static readonly CHAPTERS: ChapterLootConfig[] = [
    {
      chapter: 1,
      chapterName: 'Đền Thần Rừng Trúc (Japan/Yokai)',
      levelRange: [1, 10],
      mainCompanionId: 'inari_kitsune',
      mainCompanionName: 'Cáo Inari',
      subCompanionId: 'nekomata_cat',
      subCompanionName: 'Mèo Nekomata',
      baseExp: 12,
      baseCoins: 40,
      itemType: 'hint',
      itemIcon: '🔍',
      itemName: 'Kính Lúp'
    },
    {
      chapter: 2,
      chapterName: 'Biển Sâu Thủy Quái (Underwater)',
      levelRange: [11, 20],
      mainCompanionId: 'ryujin_pearl',
      mainCompanionName: 'Rồng Ryujin',
      subCompanionId: 'inari_kitsune',
      subCompanionName: 'Cáo Inari',
      baseExp: 15,
      baseCoins: 50,
      itemType: 'shuffle',
      itemIcon: '🔀',
      itemName: 'Hoán Đổi'
    },
    {
      chapter: 3,
      chapterName: 'Kim Tự Tháp Sa Mạc (Egypt Realm)',
      levelRange: [21, 30],
      mainCompanionId: 'hi_no_tori',
      mainCompanionName: 'Hi-no-tori',
      subCompanionId: 'nekomata_cat',
      subCompanionName: 'Mèo Nekomata',
      baseExp: 18,
      baseCoins: 60,
      itemType: 'bomb',
      itemIcon: '💣',
      itemName: 'Bom Nổ'
    },
    {
      chapter: 4,
      chapterName: 'Đỉnh Núi Hoàng Kim (Gold Peak)',
      levelRange: [31, 40],
      mainCompanionId: 'byakko_tiger',
      mainCompanionName: 'Bạch Hổ Byakko',
      subCompanionId: 'ryujin_pearl',
      subCompanionName: 'Rồng Ryujin',
      baseExp: 22,
      baseCoins: 75,
      itemType: 'hint',
      itemIcon: '🔍',
      itemName: 'Kính Lúp'
    },
    {
      chapter: 5,
      chapterName: 'Thánh Địa Cổ Hy Lạp (Ancient Greece)',
      levelRange: [41, 50],
      mainCompanionId: 'genbu_tortoise',
      mainCompanionName: 'Huyền Vũ Genbu',
      subCompanionId: 'hi_no_tori',
      subCompanionName: 'Hi-no-tori',
      baseExp: 26,
      baseCoins: 90,
      itemType: 'shuffle',
      itemIcon: '🔀',
      itemName: 'Hoán Đổi'
    },
    {
      chapter: 6,
      chapterName: 'Thần Điện Ánh Sáng (Olympus)',
      levelRange: [51, 60],
      mainCompanionId: 'kirin_sacred',
      mainCompanionName: 'Kỳ Lân Kirin',
      subCompanionId: 'byakko_tiger',
      subCompanionName: 'Bạch Hổ Byakko',
      baseExp: 30,
      baseCoins: 110,
      itemType: 'bomb',
      itemIcon: '💣',
      itemName: 'Bom Nổ'
    },
    {
      chapter: 7,
      chapterName: 'Hẻm Núi Sấm Sét (Thunder Canyon)',
      levelRange: [61, 70],
      mainCompanionId: 'raiju_thunder',
      mainCompanionName: 'Lôi Thú Raiju',
      subCompanionId: 'genbu_tortoise',
      subCompanionName: 'Huyền Vũ Genbu',
      baseExp: 35,
      baseCoins: 130,
      itemType: 'hint',
      itemIcon: '🔍',
      itemName: 'Kính Lúp'
    },
    {
      chapter: 8,
      chapterName: 'Hư Không Ảo Cảnh (Nether Dimension)',
      levelRange: [71, 80],
      mainCompanionId: 'yatagarasu_crow',
      mainCompanionName: 'Quạ Yatagarasu',
      subCompanionId: 'kirin_sacred',
      subCompanionName: 'Kỳ Lân Kirin',
      baseExp: 40,
      baseCoins: 150,
      itemType: 'shuffle',
      itemIcon: '🔀',
      itemName: 'Hoán Đổi'
    },
    {
      chapter: 9,
      chapterName: 'Dạ Hành Bách Quỷ (Night Parade)',
      levelRange: [81, 90],
      mainCompanionId: 'nekomata_cat',
      mainCompanionName: 'Mèo Nekomata',
      subCompanionId: 'raiju_thunder',
      subCompanionName: 'Lôi Thú Raiju',
      baseExp: 45,
      baseCoins: 175,
      itemType: 'bomb',
      itemIcon: '💣',
      itemName: 'Bom Nổ'
    },
    {
      chapter: 10,
      chapterName: 'Vực Thẳm Bát Kỳ (Orochi Abyss)',
      levelRange: [91, 100],
      mainCompanionId: 'orochi_serpent',
      mainCompanionName: 'Bát Kỳ Orochi',
      subCompanionId: 'yatagarasu_crow',
      subCompanionName: 'Quạ Yatagarasu',
      baseExp: 50,
      baseCoins: 200,
      itemType: 'bomb',
      itemIcon: '🌟',
      itemName: 'Túi Thần Dược'
    }
  ];

  // Calibrated Hardcore RPG / Gacha Drop Rates
  public static readonly DROP_RATES: Record<'easy' | 'medium' | 'hard', DifficultyDropRates> = {
    easy: {
      mainShardRate: 0.010, // 1.0% (~100 trận / mảnh)
      subShardRate: 0.003,  // 0.3% (~330 trận / mảnh)
      itemRate: 0.02,       // 2%
      expMultiplier: 1.0,
      coinMultiplier: 1.0
    },
    medium: {
      mainShardRate: 0.035, // 3.5% (~28 trận / mảnh)
      subShardRate: 0.010,  // 1.0% (~100 trận / mảnh)
      itemRate: 0.04,       // 4%
      expMultiplier: 1.25,
      coinMultiplier: 1.2
    },
    hard: {
      mainShardRate: 0.075, // 7.5% (~13 trận / mảnh)
      subShardRate: 0.020,  // 2.0% (~50 trận / mảnh)
      itemRate: 0.07,       // 7%
      expMultiplier: 1.6,
      coinMultiplier: 1.5
    }
  };

  // Boss Stage Rates (Levels ending in 0: 10, 20, ..., 100)
  public static readonly BOSS_RATES: Record<'easy' | 'medium' | 'hard', BossDropRates> = {
    easy: {
      bossShardRate: 0.08, // 8%
      bonusShardOn3Stars: 0,
      expMultiplier: 1.3
    },
    medium: {
      bossShardRate: 0.18, // 18%
      bonusShardOn3Stars: 0,
      expMultiplier: 1.6
    },
    hard: {
      bossShardRate: 0.30, // 30%
      bonusShardOn3Stars: 1,
      expMultiplier: 2.0
    }
  };

  /**
   * Get Chapter Configuration by Level Number (1 - 100)
   */
  public static getChapterConfig(levelNumber: number): ChapterLootConfig {
    const clampedLevel = Math.max(1, Math.min(100, levelNumber));
    const found = this.CHAPTERS.find(
      (c) => clampedLevel >= c.levelRange[0] && clampedLevel <= c.levelRange[1]
    );
    return found || this.CHAPTERS[0];
  }

  /**
   * Check if a level is a Boss Level (e.g. 10, 20, 30, ...)
   */
  public static isBossLevel(levelNumber: number): boolean {
    return levelNumber % 10 === 0;
  }

  /**
   * Check if a level is a Mini-Boss Level (e.g. 5, 15, 25, ...)
   */
  public static isMiniBossLevel(levelNumber: number): boolean {
    return levelNumber % 10 === 5;
  }

  /**
   * Get Stage Loot Configuration by Level Number (1 - 100)
   * With precise mathematical formulas for EXP, Coins, Items, and Shards
   */
  public static getStageLootConfig(levelNumber: number): StageLootConfig {
    const clampedLevel = Math.max(1, Math.min(100, levelNumber));
    const chapter = this.getChapterConfig(clampedLevel);

    const isBoss = clampedLevel % 10 === 0;
    const isMiniBoss = clampedLevel % 10 === 5;
    const stageType: StageType = isBoss ? 'boss' : isMiniBoss ? 'miniboss' : 'regular';

    // 1. Base EXP Formula: 10 + floor((level - 1) * 0.4)
    const baseExp = 10 + Math.floor((clampedLevel - 1) * 0.4);

    // 2. Base Coins Formula: 35 + floor((level - 1) * 1.65)
    const baseCoins = 35 + Math.floor((clampedLevel - 1) * 1.65);

    // 3. Stage Multipliers
    const stageExpMult = isBoss ? 1.6 : isMiniBoss ? 1.25 : 1.0;
    const stageCoinMult = isBoss ? 1.5 : isMiniBoss ? 1.25 : 1.0;

    // 4. Stage Title
    const lvlData = (levelsData as any[])?.find((l) => l.levelNumber === clampedLevel);
    let stageName = lvlData ? lvlData.title : `Màn ${clampedLevel}`;
    if (isBoss) {
      stageName = `👑 ${stageName} (ĐẠI TRÙM)`;
    } else if (isMiniBoss) {
      stageName = `⚔️ ${stageName} (MINI-BOSS)`;
    }

    // 5. Item Distribution per stage
    const mod10 = clampedLevel % 10;
    let itemType: 'hint' | 'shuffle' | 'bomb' = 'hint';
    let itemName = 'Kính Lúp';
    let itemIcon = '🔍';
    let itemDropRate = { easy: 0.02, medium: 0.04, hard: 0.07 };

    if (mod10 === 1 || mod10 === 4 || mod10 === 7) {
      itemType = 'hint';
      itemName = 'Kính Lúp';
      itemIcon = '🔍';
      itemDropRate = { easy: 0.02, medium: 0.04, hard: 0.07 };
    } else if (mod10 === 2 || mod10 === 8) {
      itemType = 'shuffle';
      itemName = 'Hoán Đổi';
      itemIcon = '🔀';
      itemDropRate = { easy: 0.02, medium: 0.04, hard: 0.07 };
    } else if (mod10 === 5) {
      // Mini-boss boosted item
      itemType = 'shuffle';
      itemName = 'Hoán Đổi Thần Tốc';
      itemIcon = '🌀';
      itemDropRate = { easy: 0.03, medium: 0.06, hard: 0.10 };
    } else if (mod10 === 3 || mod10 === 6 || mod10 === 9) {
      itemType = 'bomb';
      itemName = 'Bom Nổ';
      itemIcon = '💣';
      itemDropRate = { easy: 0.02, medium: 0.04, hard: 0.07 };
    } else if (isBoss) {
      itemType = 'bomb';
      itemName = 'Túi Thần Dược / Bùa Hộ Mệnh';
      itemIcon = '🌟';
      itemDropRate = { easy: 0.05, medium: 0.10, hard: 0.15 };
    }

    // 6. Shard Rates
    let mainShardRate = { easy: 0.010, medium: 0.035, hard: 0.075 };
    let subShardRate = { easy: 0.003, medium: 0.010, hard: 0.020 };

    if (isBoss) {
      mainShardRate = {
        easy: this.BOSS_RATES.easy.bossShardRate,
        medium: this.BOSS_RATES.medium.bossShardRate,
        hard: this.BOSS_RATES.hard.bossShardRate
      };
      subShardRate = { easy: 0, medium: 0, hard: 0 };
    } else if (isMiniBoss) {
      mainShardRate = { easy: 0.020, medium: 0.050, hard: 0.100 };
      subShardRate = { easy: 0.008, medium: 0.020, hard: 0.040 };
    }

    // 7. Rewards Matrix Calculation
    const calcExp = (diff: 'easy' | 'medium' | 'hard') => {
      const diffMult = isBoss
        ? this.BOSS_RATES[diff].expMultiplier
        : this.DROP_RATES[diff].expMultiplier;
      return Math.round(baseExp * stageExpMult * diffMult);
    };

    const calcCoins = (diff: 'easy' | 'medium' | 'hard') => {
      const diffMult = this.DROP_RATES[diff].coinMultiplier;
      return Math.round(baseCoins * stageCoinMult * diffMult);
    };

    return {
      levelNumber: clampedLevel,
      chapter: chapter.chapter,
      chapterName: chapter.chapterName,
      stageName,
      stageType,
      baseExp,
      baseCoins,
      stageExpMult,
      stageCoinMult,
      itemType,
      itemName,
      itemIcon,
      itemDropRate,
      mainCompanionId: chapter.mainCompanionId,
      mainCompanionName: chapter.mainCompanionName,
      mainShardRate,
      subCompanionId: chapter.subCompanionId,
      subCompanionName: chapter.subCompanionName,
      subShardRate,
      rewardsMatrix: {
        easy: {
          exp: calcExp('easy'),
          coins: calcCoins('easy'),
          mainShardPct: `${(mainShardRate.easy * 100).toFixed(1)}%`,
          subShardPct: isBoss ? '—' : `${(subShardRate.easy * 100).toFixed(1)}%`,
          itemPct: `${(itemDropRate.easy * 100).toFixed(0)}%`
        },
        medium: {
          exp: calcExp('medium'),
          coins: calcCoins('medium'),
          mainShardPct: `${(mainShardRate.medium * 100).toFixed(1)}%`,
          subShardPct: isBoss ? '—' : `${(subShardRate.medium * 100).toFixed(1)}%`,
          itemPct: `${(itemDropRate.medium * 100).toFixed(0)}%`
        },
        hard: {
          exp: calcExp('hard'),
          coins: calcCoins('hard'),
          mainShardPct: `${(mainShardRate.hard * 100).toFixed(1)}%`,
          subShardPct: isBoss ? '—' : `${(subShardRate.hard * 100).toFixed(1)}%`,
          itemPct: `${(itemDropRate.hard * 100).toFixed(0)}%`
        },
        threeStarExpBonus: '+30% EXP',
        threeStarCoinBonus: isBoss ? '+100 Xu (+1 Mảnh khi đạt 3⭐ Khó)' : '+50 Xu'
      }
    };
  }

  /**
   * Get all 10 stages of a chapter
   */
  public static getChapterStages(chapterNum: number): StageLootConfig[] {
    const ch = Math.max(1, Math.min(10, chapterNum));
    const startLvl = (ch - 1) * 10 + 1;
    const endLvl = ch * 10;
    const result: StageLootConfig[] = [];
    for (let l = startLvl; l <= endLvl; l++) {
      result.push(this.getStageLootConfig(l));
    }
    return result;
  }

  /**
   * Explains the mathematical formula used for all 100 stages
   */
  public static getMathematicalFormulasExplanation(): {
    expFormula: string;
    coinsFormula: string;
    difficultyMultipliers: string;
    starBonus: string;
  } {
    return {
      expFormula: 'Total EXP = Round[ BaseEXP(Level) * StageTypeMult * DiffMult * StarMult * (1 + PetBonus%) * NekomataMult ]',
      coinsFormula: 'Total Coins = Round[ (BaseCoins(Level) * StageTypeMult * DiffMult + StarBonus) * NekomataMult ]',
      difficultyMultipliers: '🟢 Dễ (x1.0 EXP/Xu) | 🟡 Vừa (x1.25 EXP, x1.2 Xu) | 🔴 Khó (x1.6 EXP, x1.5 Xu) | 👑 Boss (x1.3 - x2.0 EXP, x1.5 Xu)',
      starBonus: '1⭐ (x1.0 EXP, +0 Xu) | 2⭐ (x1.15 EXP, +20 Xu) | 3⭐ (x1.3 EXP, +50 Xu, Boss +100 Xu)'
    };
  }

  /**
   * Roll and calculate loot rewards for a completed level
   */
  public static calculateLoot(
    levelNumber: number,
    difficulty: 'easy' | 'medium' | 'hard',
    stars: number = 1,
    nekomataMultiplier: number = 1.0,
    bonusExpPercent: number = 0 // from companion level stats
  ): CalculatedLootResult {
    const stageConfig = this.getStageLootConfig(levelNumber);
    const diffRates = this.DROP_RATES[difficulty] || this.DROP_RATES.easy;
    const isBoss = stageConfig.stageType === 'boss';

    // 1. Calculate EXP with formula
    let expMult = isBoss
      ? (this.BOSS_RATES[difficulty]?.expMultiplier || 1.3)
      : diffRates.expMultiplier;
    const starMult = stars === 3 ? 1.3 : stars === 2 ? 1.15 : 1.0;
    let totalExp = Math.round(
      stageConfig.baseExp * stageConfig.stageExpMult * expMult * starMult * (1 + bonusExpPercent / 100) * nekomataMultiplier
    );
    totalExp = Math.max(5, totalExp);

    // 2. Calculate Coins
    const coinStarBonus = stars === 3 ? (isBoss ? 100 : 50) : stars === 2 ? 20 : 0;
    let totalCoins = Math.round(
      (stageConfig.baseCoins * stageConfig.stageCoinMult * diffRates.coinMultiplier + coinStarBonus) * nekomataMultiplier
    );

    // 3. Roll for Shards
    let mainShardsEarned = 0;
    let subShardsEarned = 0;

    const mainRoll = Math.random();
    if (mainRoll < stageConfig.mainShardRate[difficulty]) {
      mainShardsEarned = 1;
    }

    if (isBoss && stars === 3 && difficulty === 'hard' && this.BOSS_RATES.hard.bonusShardOn3Stars > 0) {
      mainShardsEarned += this.BOSS_RATES.hard.bonusShardOn3Stars;
    }

    if (!isBoss) {
      const subRoll = Math.random();
      if (subRoll < stageConfig.subShardRate[difficulty]) {
        subShardsEarned = 1;
      }
    }

    // Apply Nekomata 2.0x multiplier to shards if triggered
    if (nekomataMultiplier > 1 && (mainShardsEarned > 0 || subShardsEarned > 0)) {
      mainShardsEarned = Math.round(mainShardsEarned * nekomataMultiplier);
      subShardsEarned = Math.round(subShardsEarned * nekomataMultiplier);
    }

    // 4. Roll for Booster Item
    let itemEarned: CalculatedLootResult['itemEarned'] | undefined;
    const itemRoll = Math.random();
    if (itemRoll < stageConfig.itemDropRate[difficulty]) {
      itemEarned = {
        type: stageConfig.itemType,
        name: stageConfig.itemName,
        icon: stageConfig.itemIcon
      };
    }

    return {
      expEarned: totalExp,
      coinsEarned: totalCoins,
      mainShardsEarned,
      mainCompanionId: stageConfig.mainCompanionId,
      mainCompanionName: stageConfig.mainCompanionName,
      subShardsEarned,
      subCompanionId: stageConfig.subCompanionId,
      subCompanionName: stageConfig.subCompanionName,
      itemEarned,
      isBoss,
      difficulty
    };
  }
}
