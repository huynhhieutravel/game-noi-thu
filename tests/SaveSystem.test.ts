import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../src/systems/SaveSystem';

describe('SaveSystem', () => {
  beforeEach(() => {
    // Reset or initialize instance
    const save = SaveSystem.getInstance();
    save.resetSave();
  });

  it('should initialize with default save values', () => {
    const save = SaveSystem.getInstance();
    expect(save.getCoins()).toBe(10000);
    expect(save.getHighestLevel()).toBe(1);
    expect(save.getStars()).toBe(0);
  });

  it('should correctly add coins and persist', () => {
    const save = SaveSystem.getInstance();
    const newCoins = save.addCoins(250);
    expect(newCoins).toBe(10250);
    expect(save.getCoins()).toBe(10250);
  });

  it('should complete level and update stars and highest level', () => {
    const save = SaveSystem.getInstance();
    save.recordLevelCompleted('level_01', 1, 3);
    expect(save.getStars()).toBe(3);
    expect(save.getHighestLevel()).toBe(2);
    expect(save.getLevelStars('level_01')).toBe(3);

    // Replay with lower stars should not decrease high score
    save.recordLevelCompleted('level_01', 1, 1);
    expect(save.getLevelStars('level_01')).toBe(3);
    expect(save.getStars()).toBe(3);
  });

  it('should record discovered characters in album', () => {
    const save = SaveSystem.getInstance();
    const isNew = save.discoverCharacter('yamata_no_orochi_boss');
    expect(typeof isNew).toBe('boolean');
    expect(save.isCharacterDiscovered('yamata_no_orochi_boss')).toBe(true);
  });

  it('should export and import save codes accurately across devices', () => {
    const save = SaveSystem.getInstance();
    save.addCoins(700);
    save.recordLevelCompleted('level_05', 5, 3);

    const exportCode = save.exportSaveCode();
    expect(exportCode.startsWith('YOKAI-v1-')).toBe(true);

    // Reset save to simulate moving to a new phone/browser
    save.resetToDefault();
    expect(save.getCoins()).toBe(10000);
    expect(save.getHighestLevel()).toBe(1);

    // Import the backup code
    const result = save.importSaveCode(exportCode);
    expect(result.success).toBe(true);
    expect(save.getCoins()).toBe(10700); // 10000 initial + 700
    expect(save.getHighestLevel()).toBe(6);
    expect(save.getLevelStars('level_05')).toBe(3);
  });

  it('should reject tampered or invalid save codes', () => {
    const save = SaveSystem.getInstance();
    const exportCode = save.exportSaveCode();

    // Tamper with the code
    const originalChecksum = exportCode.slice(-4);
    const flippedChecksum = originalChecksum === '0000' ? 'ffff' : '0000';
    const tampered = exportCode.slice(0, -4) + flippedChecksum;
    const result = save.importSaveCode(tampered);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Checksum mismatch');

    // Reject totally garbage string
    const garbageResult = save.importSaveCode('INVALID-CODE-STRING');
    expect(garbageResult.success).toBe(false);
  });

  it('should manage 3-tier evolution, level resetting, and cumulative stats calculation', () => {
    const save = SaveSystem.getInstance();
    const compId = 'inari_kitsune';

    // 1. Initial State: Tier 1, Level 1
    expect(save.getCompanionTier(compId)).toBe(1);
    expect(save.getCompanionLevel(compId)).toBe(1);
    expect(save.getMaxLevelForTier(1)).toBe(10);

    const initialStats = save.getCompanionTotalStats(compId);
    expect(initialStats.goldBonusPercent).toBe(1);
    expect(initialStats.rageBonusPercent).toBe(0.5);
    expect(initialStats.comboTimeBonusSec).toBe(0.1);

    // 2. Level Up to Tier 1 Cap (Level 10)
    save.addCoins(10000); // Give plenty of coins
    for (let i = 1; i < 10; i++) {
      const res = save.levelUpCompanion(compId);
      expect(res.success).toBe(true);
      expect(res.newLevel).toBe(i + 1);
    }
    expect(save.getCompanionLevel(compId)).toBe(10);

    const maxT1Stats = save.getCompanionTotalStats(compId);
    expect(maxT1Stats.goldBonusPercent).toBe(10);
    expect(maxT1Stats.rageBonusPercent).toBe(5.0);
    expect(maxT1Stats.comboTimeBonusSec).toBe(1.0);

    // Cannot level up further in Tier 1
    const lvlCheckT1 = save.canLevelUpCompanion(compId);
    expect(lvlCheckT1.canLevelUp).toBe(false);
    expect(lvlCheckT1.reason).toContain('Đột Phá');

    // 3. Evolution Check (Tier 1 -> Tier 2 requires 50 shards + 1000 coins)
    const currentShards = save.getCompanionShards(compId);
    save.addCompanionShards(compId, -currentShards); // Clear to 0 for exact test
    save.addCompanionShards(compId, 49);
    const evoCheckBefore = save.canEvolveCompanion(compId);
    expect(evoCheckBefore.canEvolve).toBe(false);
    expect(evoCheckBefore.reason).toContain('Mảnh');

    save.addCompanionShards(compId, 1); // Total 50 shards
    const evoCheckReady = save.canEvolveCompanion(compId);
    expect(evoCheckReady.canEvolve).toBe(true);
    expect(evoCheckReady.requiredShards).toBe(50);
    expect(evoCheckReady.requiredCoins).toBe(1000);

    // Perform Evolution
    const evoRes = save.evolveCompanion(compId);
    expect(evoRes.success).toBe(true);
    expect(evoRes.newTier).toBe(2);
    expect(evoRes.newLevel).toBe(1); // RESET LEVEL TO 1
    expect(save.getCompanionTier(compId)).toBe(2);
    expect(save.getCompanionLevel(compId)).toBe(1);
    expect(save.getMaxLevelForTier(2)).toBe(20);

    // Stats at Tier 2 Level 1: (10 previous + 1) = 11 levels
    const t2Stats = save.getCompanionTotalStats(compId);
    expect(t2Stats.goldBonusPercent).toBe(11);
    expect(t2Stats.rageBonusPercent).toBe(5.5);
    expect(t2Stats.comboTimeBonusSec).toBe(1.1);

    // 4. Max Out to Tier 3 Level 30
    save.setCompanionTier(compId, 3);
    save.setCompanionLevel(compId, 30);
    expect(save.getMaxLevelForTier(3)).toBe(30);

    const apexStats = save.getCompanionTotalStats(compId);
    expect(apexStats.goldBonusPercent).toBe(60);
    expect(apexStats.rageBonusPercent).toBe(30.0);
    expect(apexStats.comboTimeBonusSec).toBe(6.0);

    // Tier 3 cannot evolve further
    const evoCheckApex = save.canEvolveCompanion(compId);
    expect(evoCheckApex.canEvolve).toBe(false);
  });

  it('should require 20 shards to summon a locked companion and deduct shards properly', () => {
    const save = SaveSystem.getInstance();
    const targetComp = 'ryujin_pearl';

    // Fresh save: ryujin_pearl should be locked
    expect(save.isCompanionUnlocked(targetComp)).toBe(false);

    // Give 15 shards (less than 20)
    save.addCompanionShards(targetComp, -save.getCompanionShards(targetComp));
    save.addCompanionShards(targetComp, 15);
    const checkBefore = save.canSummonCompanion(targetComp);
    expect(checkBefore.canSummon).toBe(false);
    expect(checkBefore.currentShards).toBe(15);
    expect(checkBefore.requiredShards).toBe(20);
    expect(checkBefore.reason).toContain('20 Mảnh');

    // Summon should fail
    const summonFail = save.summonCompanion(targetComp);
    expect(summonFail.success).toBe(false);
    expect(save.isCompanionUnlocked(targetComp)).toBe(false);

    // Give 5 more shards (total 20)
    save.addCompanionShards(targetComp, 5);
    const checkReady = save.canSummonCompanion(targetComp);
    expect(checkReady.canSummon).toBe(true);

    // Perform Summon
    const summonSuccess = save.summonCompanion(targetComp);
    expect(summonSuccess.success).toBe(true);
    expect(save.isCompanionUnlocked(targetComp)).toBe(true);
    expect(save.getCompanionShards(targetComp)).toBe(0); // 20 shards deducted
    expect(save.getCompanionTier(targetComp)).toBe(1);
    expect(save.getCompanionLevel(targetComp)).toBe(1);
    expect(save.getCompanionExp(targetComp)).toBe(0);
  });

  it('should handle EXP accumulation, level up thresholds, and max level capping', () => {
    const save = SaveSystem.getInstance();
    const compId = 'inari_kitsune';

    // Start at Tier 1 Level 1 with 0 EXP
    save.setCompanionTier(compId, 1);
    save.setCompanionLevel(compId, 1);
    save.setCompanionExp(compId, 0);

    const reqExpLv1 = save.getRequiredExpForNextLevel(1, 1); // 150 * 1^1.6 = 150
    expect(reqExpLv1).toBe(150);

    // Add 50 EXP (no level up)
    const res1 = save.addCompanionExp(compId, 50);
    expect(res1.leveledUp).toBe(false);
    expect(res1.newExp).toBe(50);
    expect(res1.newLevel).toBe(1);
    expect(save.getCompanionExp(compId)).toBe(50);

    // Add 120 EXP (50 + 120 = 170 >= 150 -> level up to Level 2 with 20 leftover EXP)
    const res2 = save.addCompanionExp(compId, 120);
    expect(res2.leveledUp).toBe(true);
    expect(res2.oldLevel).toBe(1);
    expect(res2.newLevel).toBe(2);
    expect(res2.newExp).toBe(20);
    expect(save.getCompanionLevel(compId)).toBe(2);
    expect(save.getCompanionExp(compId)).toBe(20);
  });
});
