import { describe, it, expect } from 'vitest';
import { LevelManager } from '../src/game/LevelManager';
import { CharacterRegistry } from '../src/game/CharacterRegistry';
import bossesData from '../src/data/bosses.json';

describe('LevelManager', () => {
  it('should have 10 configured chapters covering levels 1 to 100', () => {
    const chapters = LevelManager.getAllChapters();
    expect(chapters.length).toBe(10);
    expect(chapters[0].startLevel).toBe(1);
    expect(chapters[chapters.length - 1].endLevel).toBe(100);

    // Each chapter should have valid boss and world info
    for (const chapter of chapters) {
      expect(chapter.chapterNum).toBeGreaterThanOrEqual(1);
      expect(chapter.chapterNum).toBeLessThanOrEqual(10);
      expect(chapter.worldId).toBeTruthy();
      expect(chapter.bossId).toBeTruthy();
      expect(chapter.title).toBeTruthy();
    }
  });

  it('should map any level from 1 to 100 to the correct chapter', () => {
    expect(LevelManager.getChapterByLevel(1).chapterNum).toBe(1);
    expect(LevelManager.getChapterByLevel(10).chapterNum).toBe(1);
    expect(LevelManager.getChapterByLevel(11).chapterNum).toBe(2);
    expect(LevelManager.getChapterByLevel(20).chapterNum).toBe(2);
    expect(LevelManager.getChapterByLevel(55).chapterNum).toBe(6);
    expect(LevelManager.getChapterByLevel(100).chapterNum).toBe(10);
  });

  it('should generate valid LevelConfig for all 100 levels', () => {
    for (let lvl = 1; lvl <= 100; lvl++) {
      const config = LevelManager.getLevelConfig(lvl);

      expect(config.levelNumber, `Level ${lvl} number mismatch`).toBe(lvl);
      expect(config.rows, `Level ${lvl} invalid rows`).toBeGreaterThanOrEqual(4);
      expect(config.columns, `Level ${lvl} invalid columns`).toBeGreaterThanOrEqual(4);
      expect(config.timeLimit, `Level ${lvl} invalid timeLimit`).toBeGreaterThan(0);
      expect(config.characterPool.length, `Level ${lvl} empty pool`).toBeGreaterThanOrEqual(2);

      // Verify every character in characterPool exists in CharacterRegistry
      for (const charId of config.characterPool) {
        const char = CharacterRegistry.get(charId);
        expect(char, `Level ${lvl} contains unregistered character: ${charId}`).toBeDefined();
      }

      // Verify difficulty tiers
      if (config.difficulties) {
        expect(config.difficulties.easy.timeLimit).toBeGreaterThanOrEqual(config.difficulties.medium.timeLimit);
        expect(config.difficulties.medium.timeLimit).toBeGreaterThanOrEqual(config.difficulties.hard.timeLimit);
      }
    }
  });

  it('should verify boss encounters on chapter finale levels (every 10 levels)', () => {
    const bossIds = bossesData.map((b: any) => b.id);

    for (let c = 1; c <= 10; c++) {
      const bossLevelNum = c * 10;
      const config = LevelManager.getLevelConfig(bossLevelNum);
      const chapter = LevelManager.getChapterByLevel(bossLevelNum);

      expect(config.boss, `Level ${bossLevelNum} should have boss`).toBeDefined();
      expect(bossIds, `Chapter ${c} bossId ${chapter.bossId} not in bossesData`).toContain(chapter.bossId);
    }
  });
});
