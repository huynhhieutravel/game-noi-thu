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

  it('should verify Multiverse Sister-Theme pairing and deep character pools', () => {
    // Chapter 2 (Egypt 45 + Animal 45)
    const ch2Lvl15 = LevelManager.getLevelConfig(15);
    const ch2Chars = ch2Lvl15.characterPool.map(id => CharacterRegistry.get(id)!);
    const hasEgypt = ch2Chars.some(c => c.collection === 'egypt');
    const hasAnimal = ch2Chars.some(c => c.collection === 'animal');
    expect(hasEgypt, 'Level 15 should have egypt characters').toBe(true);
    expect(hasAnimal, 'Level 15 should have animal sister characters').toBe(true);

    // Chapter 3 (Greece 45 + Fantasy 18)
    const ch3Lvl25 = LevelManager.getLevelConfig(25);
    const ch3Chars = ch3Lvl25.characterPool.map(id => CharacterRegistry.get(id)!);
    const hasGreece = ch3Chars.some(c => c.collection === 'greece');
    const hasFantasy = ch3Chars.some(c => c.collection === 'fantasy');
    expect(hasGreece, 'Level 25 should have greece characters').toBe(true);
    expect(hasFantasy, 'Level 25 should have fantasy sister characters').toBe(true);

    // Chapter 6 (Pirate 18 + Underwater 54 + Sea 18)
    const ch6Lvl55 = LevelManager.getLevelConfig(55);
    const ch6Chars = ch6Lvl55.characterPool.map(id => CharacterRegistry.get(id)!);
    const hasPirate = ch6Chars.some(c => c.collection === 'pirate');
    const hasSeaOrUnderwater = ch6Chars.some(c => c.collection === 'underwater' || c.collection === 'sea');
    expect(hasPirate, 'Level 55 should have pirate characters').toBe(true);
    expect(hasSeaOrUnderwater, 'Level 55 should have underwater/sea sister characters').toBe(true);
  });

  it('should verify Vanguard Ambassadors appear in frontier levels (1-3) of foreign realms', () => {
    const vanguards = LevelManager.VANGUARD_AMBASSADORS;
    expect(vanguards.length).toBe(4);

    // Level 11 (Chapter 2 frontier) should have at least one Vanguard Ambassador
    const lvl11 = LevelManager.getLevelConfig(11);
    const hasVanguardCh2 = lvl11.characterPool.some(id => vanguards.includes(id));
    expect(hasVanguardCh2, 'Level 11 should feature a Vanguard traveling companion').toBe(true);

    // Level 21 (Chapter 3 frontier) should have at least one Vanguard Ambassador
    const lvl21 = LevelManager.getLevelConfig(21);
    const hasVanguardCh3 = lvl21.characterPool.some(id => vanguards.includes(id));
    expect(hasVanguardCh3, 'Level 21 should feature a Vanguard traveling companion').toBe(true);
  });

  it('should scale pool sizes progressively for grid dimensions without character exhaustion', () => {
    for (let lvl = 11; lvl <= 100; lvl++) {
      const config = LevelManager.getLevelConfig(lvl);
      const minExpected = lvl <= 20 ? 14 : lvl <= 50 ? 18 : 24;
      expect(
        config.characterPool.length,
        `Level ${lvl} characterPool length (${config.characterPool.length}) must be at least ${minExpected}`
      ).toBeGreaterThanOrEqual(minExpected);

      // Verify zero boss characters
      for (const charId of config.characterPool) {
        expect(CharacterRegistry.isBoss(charId), `Level ${lvl} contains boss ${charId}`).toBe(false);
      }
    }
  });
});
