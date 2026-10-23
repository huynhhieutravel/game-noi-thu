import { DifficultyLevel } from '../types';

export interface PlayerCombatStats {
  maxHp: number;
  baseMatchDamage: number;
  damageReduction: number; // 0.0 to 0.60 (cap 60%)
  companionLevel: number;
  companionTier: number;
  relicHpBonus: number;
  relicDrBonus: number;
}

export interface BossCombatStats {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  attackPower: number;
  actionIntervalSeconds: number;
  isEnraged: boolean;
  headsOrParts: number;
}

export interface DamageCalculationResult {
  damageTaken: number;
  wardConsumed: boolean;
  absorbed: boolean;
}

export interface MatchDamageResult {
  totalDamage: number;
  comboMultiplier: number;
  feverMultiplier: number;
  healAmount: number;
}

/**
 * CombatEngine: Canonical implementation of ADR 0015 & ALGORITHM_WIKI_COMBAT_AND_DIFFICULTY
 * Governs bidirectional combat formulas, dynamic scaling, damage mitigation, and pressure rules.
 */
export class CombatEngine {
  public static readonly BASE_PLAYER_HP = 1000;
  public static readonly HP_PER_COMPANION_LEVEL = 80;
  public static readonly HP_PER_COMPANION_TIER = 250;
  public static readonly MAX_DAMAGE_REDUCTION = 0.60; // 60% hard cap

  public static readonly BASE_MATCH_DAMAGE = 15;
  public static readonly MATCH_DMG_PER_LEVEL = 2.5; // (Level * 5) / 2

  public static readonly ENRAGE_HP_THRESHOLD = 0.35; // 35% HP
  public static readonly ENRAGE_SPEED_MULTIPLIER = 0.5; // 50% cooldown reduction
  public static readonly ENRAGE_DMG_MULTIPLIER = 1.35; // +35% attack damage

  // Base Boss Stats
  public static readonly DEFAULT_BASE_BOSS_HP = 600;
  public static readonly DEFAULT_BASE_BOSS_ATTACK = 120;

  /**
   * Computes Player Combat Stats from companion level (1..10), tier (1..3), and relics.
   */
  public static calculatePlayerStats(options: {
    companionLevel?: number;
    companionTier?: number;
    companionId?: string;
    relicHpBonus?: number;
    relicDrBonus?: number;
  }): PlayerCombatStats {
    const level = Math.max(1, Math.min(10, options.companionLevel || 1));
    const tier = Math.max(1, Math.min(3, options.companionTier || 1));
    const relicHp = Math.max(0, options.relicHpBonus || 0);
    const relicDr = Math.max(0, options.relicDrBonus || 0);

    // Companion inherent DR: Genbu (turtle) grants +15% DR, Byakko grants +10% DR
    let companionDr = 0;
    if (options.companionId === 'genbu_tortoise') {
      companionDr = 0.15 + (tier - 1) * 0.05; // 15%..25%
    } else if (options.companionId === 'byakko_tiger') {
      companionDr = 0.08 + (tier - 1) * 0.03; // 8%..14%
    }

    const totalDr = Math.min(this.MAX_DAMAGE_REDUCTION, companionDr + relicDr);
    const maxHp = this.BASE_PLAYER_HP +
      (level * this.HP_PER_COMPANION_LEVEL) +
      (tier * this.HP_PER_COMPANION_TIER) +
      relicHp;

    const baseMatchDamage = Math.round(this.BASE_MATCH_DAMAGE + (level * this.MATCH_DMG_PER_LEVEL));

    return {
      maxHp,
      baseMatchDamage,
      damageReduction: totalDr,
      companionLevel: level,
      companionTier: tier,
      relicHpBonus: relicHp,
      relicDrBonus: relicDr
    };
  }

  /**
   * Computes Boss Combat Stats for a given Level and Difficulty.
   */
  public static calculateBossStats(
    levelNum: number,
    difficulty: DifficultyLevel = 'medium',
    baseHp: number = this.DEFAULT_BASE_BOSS_HP,
    baseAttack: number = this.DEFAULT_BASE_BOSS_ATTACK,
    baseInterval: number = 7.0
  ): BossCombatStats {
    const lvl = Math.max(1, Math.min(100, levelNum));

    // Difficulty Multipliers
    let hpMult = 1.8;
    let atkMult = 1.5;
    let interval = 4.5;

    if (difficulty === 'easy') {
      hpMult = 1.0;
      atkMult = 1.0;
      interval = 7.0;
    } else if (difficulty === 'hard') {
      hpMult = 3.0;
      atkMult = 2.2;
      interval = 3.0;
    }

    // Scaling Formulas from Wiki:
    // HP = BaseHP * (1 + Level / 15) * hpMult
    const scaledHp = Math.round(baseHp * (1 + lvl / 15) * hpMult);

    // DMG = BaseAttack * (1 + Level / 20) * atkMult
    const scaledAttack = Math.round(baseAttack * (1 + lvl / 20) * atkMult);

    return {
      id: `boss_lvl_${lvl}`,
      name: `Cự Trùm Màn ${lvl}`,
      maxHp: scaledHp,
      currentHp: scaledHp,
      attackPower: scaledAttack,
      actionIntervalSeconds: interval,
      isEnraged: false,
      headsOrParts: 8
    };
  }

  /**
   * Computes match damage dealt to Boss and HP healed to Player when a tile pair is connected.
   */
  public static calculateMatchDamage(
    baseMatchDamage: number,
    comboCount: number = 0,
    isFever: boolean = false
  ): MatchDamageResult {
    const comboMult = 1.0 + Math.min(2.5, comboCount * 0.15);
    const feverMult = isFever ? 1.5 : 1.0;
    const totalDmg = Math.round(baseMatchDamage * comboMult * feverMult);

    // Small healing on match (5 + combo * 1.5)
    const heal = 5 + Math.floor(comboCount * 1.5);

    return {
      totalDamage: totalDmg,
      comboMultiplier: comboMult,
      feverMultiplier: feverMult,
      healAmount: heal
    };
  }

  /**
   * Computes final damage taken by Player from an incoming Boss strike.
   */
  public static calculateDamageReceived(
    rawAttackDamage: number,
    damageReduction: number,
    isEnraged: boolean = false,
    hasDivineWard: boolean = false
  ): DamageCalculationResult {
    if (hasDivineWard) {
      return {
        damageTaken: 0,
        wardConsumed: true,
        absorbed: true
      };
    }

    let finalAttack = rawAttackDamage;
    if (isEnraged) {
      finalAttack = Math.round(finalAttack * this.ENRAGE_DMG_MULTIPLIER);
    }

    const effectiveDr = Math.min(this.MAX_DAMAGE_REDUCTION, Math.max(0, damageReduction));
    const damageTaken = Math.max(1, Math.round(finalAttack * (1 - effectiveDr)));

    return {
      damageTaken,
      wardConsumed: false,
      absorbed: false
    };
  }

  /**
   * Evaluates if Boss enters Enrage / Berserk Phase.
   */
  public static checkEnrage(currentHp: number, maxHp: number): boolean {
    if (maxHp <= 0) return false;
    return (currentHp / maxHp) <= this.ENRAGE_HP_THRESHOLD;
  }

  /**
   * Multi-Vector Pressure: Evaluates if a tile is within the Shadow Veil (Dynamic Fog) on Hard mode.
   * Internal tiles (Manhattan distance >= 2 from any border) are shrouded in mist.
   */
  public static isTileInShadowVeil(r: number, c: number, rows: number, cols: number): boolean {
    const distTop = r - 1;
    const distBottom = rows - r;
    const distLeft = c - 1;
    const distRight = cols - c;
    const minDistToBorder = Math.min(distTop, distBottom, distLeft, distRight);
    return minDistToBorder >= 2;
  }

  /**
   * Multi-Vector Pressure: Evaluates panic / mis-click penalty (ADR 0018).
   * If user clicks invalid pair consecutively under < 350ms for 3 or more times, deducts 2s.
   * Single rapid double-taps on touchscreen (consecutiveMisClicks < 3) do not trigger penalty.
   */
  public static evaluatePanicPenalty(
    deltaSinceLastClickMs: number,
    consecutiveMisClicks: number = 3
  ): { isPanic: boolean; timeDeductionSec: number } {
    if (deltaSinceLastClickMs > 0 && deltaSinceLastClickMs < 350 && consecutiveMisClicks >= 3) {
      return { isPanic: true, timeDeductionSec: 2.0 };
    }
    return { isPanic: false, timeDeductionSec: 0 };
  }
}
