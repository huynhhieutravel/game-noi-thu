import { describe, it, expect } from 'vitest';
import { LootManager } from '../src/game/LootManager';

describe('LootManager Stage Math & Loot Progression', () => {
  it('should calculate accurate Base EXP and Base Coins from Level 1 to 100', () => {
    // Level 1: BaseEXP = 10 + floor(0 * 0.4) = 10, BaseCoins = 35 + floor(0) = 35
    const lvl1 = LootManager.getStageLootConfig(1);
    expect(lvl1.baseExp).toBe(10);
    expect(lvl1.baseCoins).toBe(35);
    expect(lvl1.stageType).toBe('regular');
    expect(lvl1.stageExpMult).toBe(1.0);
    expect(lvl1.stageCoinMult).toBe(1.0);

    // Level 5 (Mini-Boss): BaseEXP = 10 + floor(4 * 0.4) = 11, BaseCoins = 35 + floor(4 * 1.65) = 41
    const lvl5 = LootManager.getStageLootConfig(5);
    expect(lvl5.baseExp).toBe(11);
    expect(lvl5.baseCoins).toBe(41);
    expect(lvl5.stageType).toBe('miniboss');
    expect(lvl5.stageExpMult).toBe(1.25);
    expect(lvl5.stageCoinMult).toBe(1.25);

    // Level 10 (Great Boss): BaseEXP = 10 + floor(9 * 0.4) = 13, BaseCoins = 35 + floor(9 * 1.65) = 49
    const lvl10 = LootManager.getStageLootConfig(10);
    expect(lvl10.baseExp).toBe(13);
    expect(lvl10.baseCoins).toBe(49);
    expect(lvl10.stageType).toBe('boss');
    expect(lvl10.stageExpMult).toBe(1.6);
    expect(lvl10.stageCoinMult).toBe(1.5);

    // Level 50 (Boss of Chapter 5): BaseEXP = 10 + floor(49 * 0.4) = 29, BaseCoins = 35 + floor(49 * 1.65) = 115
    const lvl50 = LootManager.getStageLootConfig(50);
    expect(lvl50.baseExp).toBe(29);
    expect(lvl50.baseCoins).toBe(115);
    expect(lvl50.stageType).toBe('boss');

    // Level 100 (Apex Boss Orochi): BaseEXP = 10 + floor(99 * 0.4) = 49, BaseCoins = 35 + floor(99 * 1.65) = 198
    const lvl100 = LootManager.getStageLootConfig(100);
    expect(lvl100.baseExp).toBe(49);
    expect(lvl100.baseCoins).toBe(198);
    expect(lvl100.stageType).toBe('boss');
  });

  it('should distribute items with strategic variety across chapter stages', () => {
    // 1, 4, 7 -> Kính lúp (hint)
    expect(LootManager.getStageLootConfig(1).itemType).toBe('hint');
    expect(LootManager.getStageLootConfig(4).itemType).toBe('hint');
    expect(LootManager.getStageLootConfig(7).itemType).toBe('hint');

    // 2, 8 -> Hoán đổi (shuffle)
    expect(LootManager.getStageLootConfig(2).itemType).toBe('shuffle');
    expect(LootManager.getStageLootConfig(8).itemType).toBe('shuffle');

    // 5 -> Mini-Boss boosted shuffle
    const mb5 = LootManager.getStageLootConfig(5);
    expect(mb5.itemType).toBe('shuffle');
    expect(mb5.itemName).toContain('Hoán Đổi');
    expect(mb5.itemDropRate.hard).toBe(0.10); // 10% boosted

    // 3, 6, 9 -> Bom Nổ (bomb)
    expect(LootManager.getStageLootConfig(3).itemType).toBe('bomb');
    expect(LootManager.getStageLootConfig(6).itemType).toBe('bomb');
    expect(LootManager.getStageLootConfig(9).itemType).toBe('bomb');

    // 10 -> Boss Elixir/Talisman
    const boss10 = LootManager.getStageLootConfig(10);
    expect(boss10.itemDropRate.hard).toBe(0.15); // 15%
  });

  it('should validate all 100 levels produce non-null and strictly progressing values', () => {
    let prevExp = 0;
    let prevCoins = 0;

    for (let i = 1; i <= 100; i++) {
      const cfg = LootManager.getStageLootConfig(i);
      expect(cfg.levelNumber).toBe(i);
      expect(cfg.baseExp).toBeGreaterThanOrEqual(prevExp);
      expect(cfg.baseCoins).toBeGreaterThanOrEqual(prevCoins);
      expect(cfg.chapter).toBe(Math.ceil(i / 10));

      // Rewards matrix checks
      expect(cfg.rewardsMatrix.easy.exp).toBeGreaterThan(0);
      expect(cfg.rewardsMatrix.medium.exp).toBeGreaterThan(cfg.rewardsMatrix.easy.exp);
      expect(cfg.rewardsMatrix.hard.exp).toBeGreaterThan(cfg.rewardsMatrix.medium.exp);

      expect(cfg.rewardsMatrix.easy.coins).toBeGreaterThan(0);
      expect(cfg.rewardsMatrix.medium.coins).toBeGreaterThanOrEqual(cfg.rewardsMatrix.easy.coins);
      expect(cfg.rewardsMatrix.hard.coins).toBeGreaterThan(cfg.rewardsMatrix.medium.coins);

      prevExp = cfg.baseExp;
      prevCoins = cfg.baseCoins;
    }
  });

  it('should fetch all 10 stages for any chapter via getChapterStages', () => {
    const ch3Stages = LootManager.getChapterStages(3);
    expect(ch3Stages.length).toBe(10);
    expect(ch3Stages[0].levelNumber).toBe(21);
    expect(ch3Stages[9].levelNumber).toBe(30);
    expect(ch3Stages[4].stageType).toBe('miniboss'); // Level 25
    expect(ch3Stages[9].stageType).toBe('boss');     // Level 30
  });

  it('should execute calculateLoot without errors and honor drop constraints', () => {
    const regularLoot = LootManager.calculateLoot(1, 'easy', 3);
    expect(regularLoot.expEarned).toBeGreaterThan(0);
    expect(regularLoot.coinsEarned).toBeGreaterThan(0);
    expect(regularLoot.mainCompanionName).toBe('Cáo Inari');
    expect(regularLoot.isBoss).toBe(false);

    const bossLoot = LootManager.calculateLoot(10, 'hard', 3);
    expect(bossLoot.isBoss).toBe(true);
    expect(bossLoot.expEarned).toBeGreaterThan(regularLoot.expEarned);
    expect(bossLoot.coinsEarned).toBeGreaterThan(regularLoot.coinsEarned);
  });
});
