import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../src/systems/SaveSystem';
import { AchievementRegistry } from '../src/game/AchievementRegistry';

describe('⛩️ Daily Shrine Omikuji & Mythic Hunter Achievements Suite (ADR 0020)', () => {
  let save: SaveSystem;

  beforeEach(() => {
    save = SaveSystem.getInstance();
    save.resetSave();
  });


  describe('1. Daily Shrine Omikuji & 7-Day Fortune Loop', () => {
    it('allows claiming when no claim has been made today', () => {
      expect(save.canClaimDailyOmikuji()).toBe(true);
      expect(save.getDailyOmikujiStreak()).toBe(0);
    });

    it('claims daily omikuji successfully and awards currencies', () => {
      const initialCoins = save.getCoins();
      const initialDiamonds = save.getDiamonds();

      const result = save.claimDailyOmikuji();
      expect(result.success).toBe(true);
      expect(result.streak).toBe(1);
      expect(result.fortune).toBeDefined();
      expect(result.fortune!.coins).toBeGreaterThan(0);
      expect(result.fortune!.diamonds).toBeGreaterThan(0);

      // Verify wallet updated
      expect(save.getCoins()).toBeGreaterThan(initialCoins);
      expect(save.getDiamonds()).toBeGreaterThan(initialDiamonds);
      expect(save.canClaimDailyOmikuji()).toBe(false);
    });

    it('blocks double-claiming on the same calendar day', () => {
      const firstClaim = save.claimDailyOmikuji();
      expect(firstClaim.success).toBe(true);

      const secondClaim = save.claimDailyOmikuji();
      expect(secondClaim.success).toBe(false);
      expect(secondClaim.alreadyClaimed).toBe(true);
      expect(secondClaim.streak).toBe(1);
    });

    it('increments streak when claiming on consecutive days', () => {
      // Simulate claim yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = SaveSystem.getTodayDateString(yesterday);

      const data = save.getData();
      data.lastOmikujiDate = yesterdayStr;
      data.omikujiStreak = 3;
      save.save();

      expect(save.canClaimDailyOmikuji()).toBe(true);
      const result = save.claimDailyOmikuji();
      expect(result.success).toBe(true);
      expect(result.streak).toBe(4);
    });

    it('awards Grand Jackpot on Day 7 streak', () => {
      // Simulate Day 6 claim yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = SaveSystem.getTodayDateString(yesterday);

      const data = save.getData();
      data.lastOmikujiDate = yesterdayStr;
      data.omikujiStreak = 6;
      save.save();

      const result = save.claimDailyOmikuji();
      expect(result.success).toBe(true);
      expect(result.streak).toBe(7);
      expect(result.fortune?.isJackpotDay7).toBe(true);
      expect(result.fortune?.diamonds).toBeGreaterThanOrEqual(55);
      expect(result.fortune?.universalShards).toBeGreaterThanOrEqual(5);

      // 7-day streak achievement should unlock automatically
      expect(save.isAchievementUnlocked('omikuji_streak_7')).toBe(true);
    });

    it('resets streak to 1 if player misses more than 1 day', () => {
      // Simulate claim 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const pastStr = SaveSystem.getTodayDateString(threeDaysAgo);

      const data = save.getData();
      data.lastOmikujiDate = pastStr;
      data.omikujiStreak = 5;
      save.save();

      const result = save.claimDailyOmikuji();
      expect(result.success).toBe(true);
      expect(result.streak).toBe(1);
    });
  });

  describe('2. Mythic Hunter Achievements Registry & Title Engine', () => {
    it('registers diverse mythic achievements', () => {
      const all = AchievementRegistry.getAll();
      expect(all.length).toBe(20);
      all.forEach(ach => {
        expect(ach.id).toBeTruthy();
        expect(ach.title).toBeTruthy();
        expect(ach.rewardDiamonds).toBeGreaterThan(0);
        expect(ach.playerTitleReward).toBeTruthy();
      });
    });

    it('unlocks achievement and grants diamond and universal shard rewards', () => {
      const initialDiamonds = save.getDiamonds();
      const initialShards = save.getUniversalShards();

      const res = save.unlockAchievement('combo_10');
      expect(res.success).toBe(true);
      expect(res.rewardedDiamonds).toBe(40);
      expect(res.rewardedShards).toBe(2);

      expect(save.getDiamonds()).toBe(initialDiamonds + 40);
      expect(save.getUniversalShards()).toBe(initialShards + 2);
      expect(save.isAchievementUnlocked('combo_10')).toBe(true);

      // Subsequent unlock attempt should safely return false without double-awarding
      const secondAttempt = save.unlockAchievement('combo_10');
      expect(secondAttempt.success).toBe(false);
      expect(save.getDiamonds()).toBe(initialDiamonds + 40);
    });

    it('manages player titles: defaults, auto-equips, and explicit equips', () => {
      expect(save.getSelectedTitle()).toBe('Tập Sự Trừ Tà');

      save.setSelectedTitle('⚡ Thần Tốc Nối Thú');
      expect(save.getSelectedTitle()).toBe('⚡ Thần Tốc Nối Thú');

      // Persistence check across reload
      const exported = save.exportSaveCode();
      save.resetSave();
      expect(save.getSelectedTitle()).toBe('Tập Sự Trừ Tà');

      save.importSaveCode(exported);
      expect(save.getSelectedTitle()).toBe('⚡ Thần Tốc Nối Thú');
    });

    it('automatically evaluates and unlocks achievements based on match context', () => {
      // 1. High-APM Combo 5 and Combo 10
      const comboUnlocked = save.checkAndUnlockAchievements({
        maxCombo: 11,
        isWin: true,
        levelNum: 5
      });
      const ids = comboUnlocked.map(a => a.id);
      expect(ids).toContain('combo_5');
      expect(ids).toContain('combo_10');

      // 2. Speed Demon (< 35s clear)
      const speedUnlocked = save.checkAndUnlockAchievements({
        isWin: true,
        levelNum: 2,
        timeElapsedSec: 28
      });
      expect(speedUnlocked.map(a => a.id)).toContain('speed_demon');

      // 3. Boss Slayer 1
      const bossUnlocked = save.checkAndUnlockAchievements({
        isWin: true,
        levelNum: 10,
        bossId: 'yamata_no_orochi_boss'
      });
      expect(bossUnlocked.map(a => a.id)).toContain('first_boss');
    });
  });
});
