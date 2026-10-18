import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../src/systems/SaveSystem';
import { LevelManager } from '../src/game/LevelManager';

describe('Difficulty Progression & Chapter Gating QA Suite', () => {
  let save: SaveSystem;

  beforeEach(() => {
    save = SaveSystem.getInstance();
    save.resetSave();
  });

  describe('Chapter Difficulty Gating', () => {
    it('Chapter 1 Easy should always be unlocked initially', () => {
      expect(save.isChapterDifficultyUnlocked(1, 'easy')).toBe(true);
      expect(save.isLevelUnlocked(1, 'easy')).toBe(true);
      expect(save.isLevelUnlocked(2, 'easy')).toBe(false);
    });

    it('Chapter 1 Medium and Hard should be locked initially', () => {
      expect(save.isChapterDifficultyUnlocked(1, 'medium')).toBe(false);
      expect(save.isChapterDifficultyUnlocked(1, 'hard')).toBe(false);
      expect(save.isLevelUnlocked(1, 'medium')).toBe(false);
    });

    it('Completing Chapter 1 Easy (Level 10) unlocks Chapter 1 Medium and Chapter 2 Easy', () => {
      for (let i = 1; i <= 10; i++) {
        save.recordLevelCompleted(`level_${i}`, i, 3, 'easy');
        save.recordDifficultyCompleted(`level_${i}`, 'easy');
      }

      expect(save.isChapterDifficultyUnlocked(1, 'medium')).toBe(true);
      expect(save.isLevelUnlocked(1, 'medium')).toBe(true);
      expect(save.isChapterDifficultyUnlocked(2, 'easy')).toBe(true);
      expect(save.isLevelUnlocked(11, 'easy')).toBe(true);
      // Hard should still be locked until Level 10 Medium is completed
      expect(save.isChapterDifficultyUnlocked(1, 'hard')).toBe(false);
    });

    it('Completing Chapter 1 Medium (Level 10) unlocks Chapter 1 Hard', () => {
      for (let i = 1; i <= 10; i++) {
        save.recordLevelCompleted(`level_${i}`, i, 3, 'easy');
        save.recordDifficultyCompleted(`level_${i}`, 'easy');
      }
      for (let i = 1; i <= 10; i++) {
        save.recordLevelCompleted(`level_${i}`, i, 3, 'medium');
        save.recordDifficultyCompleted(`level_${i}`, 'medium');
      }

      expect(save.isChapterDifficultyUnlocked(1, 'hard')).toBe(true);
      expect(save.isLevelUnlocked(1, 'hard')).toBe(true);
    });
  });

  describe('LevelManager Easy Mode Progression Curve', () => {
    it('Level 1 Easy should be 4x6 board with 0 obstacles, 4 animals, and stopwatch mode', () => {
      const base = LevelManager.getLevelConfig(1, 'yokai', 'easy');
      const config = LevelManager.applyDifficultyToConfig(base, 'easy');
      expect(config.rows).toBe(4);
      expect(config.columns).toBe(6);
      expect(config.characterPool.length).toBe(4);
      expect(config.isStopwatch).toBe(true);
      expect(config.targetGoldSeconds).toBe(35);
      expect(config.targetSilverSeconds).toBe(55);
      expect(config.obstacles).toBeUndefined();
    });

    it('Level 2-3 Easy should be 6x6 board with 0 obstacles', () => {
      const base2 = LevelManager.getLevelConfig(2, 'yokai', 'easy');
      const cfg2 = LevelManager.applyDifficultyToConfig(base2, 'easy');
      expect(cfg2.rows).toBe(6);
      expect(cfg2.columns).toBe(6);
      expect(cfg2.characterPool.length).toBe(4);
      expect(cfg2.isStopwatch).toBe(true);
      expect(cfg2.obstacles).toBeUndefined();

      const base3 = LevelManager.getLevelConfig(3, 'yokai', 'easy');
      const cfg3 = LevelManager.applyDifficultyToConfig(base3, 'easy');
      expect(cfg3.rows).toBe(6);
      expect(cfg3.columns).toBe(6);
      expect(cfg3.characterPool.length).toBe(5);
    });

    it('Level 4-6 Easy should be 6x8 board', () => {
      const base4 = LevelManager.getLevelConfig(4, 'yokai', 'easy');
      const cfg4 = LevelManager.applyDifficultyToConfig(base4, 'easy');
      expect(cfg4.rows).toBe(6);
      expect(cfg4.columns).toBe(8);
      expect(cfg4.isStopwatch).toBe(true);
    });

    it('Level 7-8 Easy should be 6x10 board with light gravity movement', () => {
      const base7 = LevelManager.getLevelConfig(7, 'yokai', 'easy');
      const cfg7 = LevelManager.applyDifficultyToConfig(base7, 'easy');
      expect(cfg7.rows).toBe(6);
      expect(cfg7.columns).toBe(10);
      expect(cfg7.movement).toBe('down');
      expect(cfg7.isStopwatch).toBe(true);
    });

    it('Level 9 Easy should be 8x8 and Level 10 should be 8x9 boss', () => {
      const base9 = LevelManager.getLevelConfig(9, 'yokai', 'easy');
      const cfg9 = LevelManager.applyDifficultyToConfig(base9, 'easy');
      expect(cfg9.rows).toBe(8);
      expect(cfg9.columns).toBe(8);

      const base10 = LevelManager.getLevelConfig(10, 'yokai', 'easy');
      const cfg10 = LevelManager.applyDifficultyToConfig(base10, 'easy');
      expect(cfg10.rows).toBe(8);
      expect(cfg10.columns).toBe(9);
      expect(cfg10.isStopwatch).toBe(true);
    });

    it('Medium difficulty Level 1 retains standard countdown timer and rules', () => {
      const base = LevelManager.getLevelConfig(1, 'yokai', 'medium');
      const config = LevelManager.applyDifficultyToConfig(base, 'medium');
      expect(config.isStopwatch).toBeFalsy();
      expect(config.timeLimit).toBe(65);
    });
  });

  describe('Difficulty Inheritance & Replayability QA', () => {
    it('Completing a level on Medium should automatically unlock and complete Easy mode', () => {
      // Simulate player beating level 1 on medium
      save.recordLevelCompleted('level_01', 1, 3, 'medium');

      // Easy mode must be completed
      expect(save.isDifficultyCompleted('level_01', 'easy')).toBe(true);
      expect(save.isDifficultyCompleted('level_01', 'medium')).toBe(true);
      expect(save.getLevelStars('level_01', 'easy')).toBe(3);

      // highestLevel should advance to 2
      expect(save.getHighestLevel()).toBe(2);

      // Level 2 must now be unlocked on Easy!
      expect(save.isLevelUnlocked(2, 'easy')).toBe(true);

      // Player must be able to replay Level 1 on Easy
      expect(save.isLevelUnlocked(1, 'easy')).toBe(true);
    });

    it('Completing a level on Hard should automatically unlock and complete Medium and Easy', () => {
      save.recordLevelCompleted('level_01', 1, 3, 'hard');

      expect(save.isDifficultyCompleted('level_01', 'hard')).toBe(true);
      expect(save.isDifficultyCompleted('level_01', 'medium')).toBe(true);
      expect(save.isDifficultyCompleted('level_01', 'easy')).toBe(true);
      expect(save.getLevelStars('level_01', 'easy')).toBe(3);
      expect(save.getLevelStars('level_01', 'medium')).toBe(3);
      expect(save.getHighestLevel()).toBe(2);
      expect(save.isLevelUnlocked(2, 'easy')).toBe(true);
    });

    it('Replaying a completed level on Easy maintains progression and allows endless replays', () => {
      save.recordLevelCompleted('level_01', 1, 3, 'easy');
      save.recordLevelCompleted('level_02', 2, 2, 'easy');

      expect(save.getHighestLevel()).toBe(3);
      expect(save.isLevelUnlocked(1, 'easy')).toBe(true);
      expect(save.isLevelUnlocked(2, 'easy')).toBe(true);
      expect(save.isLevelUnlocked(3, 'easy')).toBe(true);

      // Replaying level 1 should still succeed and not reset highestLevel
      save.recordLevelCompleted('level_01', 1, 3, 'easy');
      expect(save.getHighestLevel()).toBe(3);
      expect(save.isLevelUnlocked(1, 'easy')).toBe(true);
    });
  });
});
