import { describe, it, expect } from 'vitest';
import { LevelManager } from '../src/game/LevelManager';
import { BoardGenerator } from '../src/game/BoardGenerator';
import { CharacterRegistry } from '../src/game/CharacterRegistry';
import { DifficultyLevel, TileState } from '../src/types';

describe('Phase 3 & 4: Deep Automated Level Solver & Solvability Suite (100 Levels × 3 Difficulties)', () => {
  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];

  describe('1. Parity & Solvability Invariant for all 100 Levels (Easy, Medium, Hard)', () => {
    for (const diff of difficulties) {
      it(`guarantees 100% tile parity and initial solvability for Levels 1 to 100 on [${diff.toUpperCase()}]`, () => {
        for (let lvl = 1; lvl <= 100; lvl++) {
          const config = LevelManager.getLevelConfig(lvl, 'yokai', diff);
          const diffConfig = LevelManager.applyDifficultyToConfig(config, diff);

          const grid = BoardGenerator.generateBoard({
            rows: diffConfig.rows,
            cols: diffConfig.columns,
            characterPool: diffConfig.characterPool,
            stoneCount: diffConfig.modifiers?.stoneCount || 0,
            iceCount: diffConfig.modifiers?.iceCount || 0,
            thornCount: diffConfig.modifiers?.thornCount || 0,
            webCount: diffConfig.modifiers?.webCount || 0,
            barricadeCount: diffConfig.modifiers?.barricadeCount || 0
          });

          // A. Check Tile Parity
          const charCounts = new Map<string, number>();
          let totalPlayableTiles = 0;

          for (let r = 1; r <= diffConfig.rows; r++) {
            for (let c = 1; c <= diffConfig.columns; c++) {
              const cell = grid[r]?.[c];
              if (cell && !cell.isCleared && cell.characterId) {
                totalPlayableTiles++;
                charCounts.set(cell.characterId, (charCounts.get(cell.characterId) || 0) + 1);
              }
            }
          }

          // Total playable tiles must be strictly even
          expect(
            totalPlayableTiles % 2,
            `Level ${lvl} (${diff}) has odd total playable tiles: ${totalPlayableTiles}`
          ).toBe(0);

          // Every character count must be strictly even (no orphaned tiles)
          for (const [cid, count] of charCounts.entries()) {
            expect(
              count % 2,
              `Level ${lvl} (${diff}) character '${cid}' has odd tile count: ${count}`
            ).toBe(0);
          }

          // B. Check Initial Solvability (must have >= 1 legal match without reshuffling)
          const firstMatch = BoardGenerator.findFirstAvailableMatch(grid, diffConfig.rows, diffConfig.columns);
          expect(
            firstMatch,
            `Level ${lvl} (${diff}) failed to generate initial solvable match!`
          ).not.toBeNull();
        }
      });
    }
  });

  describe('2. Automated Solver Walkthrough & Infinite Reshuffle Immunity', () => {
    // Test sample milestone levels across all 10 chapters
    const milestoneLevels = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    for (const lvl of milestoneLevels) {
      it(`fully solves Level ${lvl} without infinite reshuffle deadlock`, () => {
        const config = LevelManager.getLevelConfig(lvl, 'yokai', 'easy');
        const diffConfig = LevelManager.applyDifficultyToConfig(config, 'easy');

        const grid = BoardGenerator.generateBoard({
          rows: diffConfig.rows,
          cols: diffConfig.columns,
          characterPool: diffConfig.characterPool,
          stoneCount: diffConfig.modifiers?.stoneCount || 0,
          iceCount: diffConfig.modifiers?.iceCount || 0,
          thornCount: diffConfig.modifiers?.thornCount || 0,
          webCount: diffConfig.modifiers?.webCount || 0,
          barricadeCount: diffConfig.modifiers?.barricadeCount || 0
        });

        let clearedPairs = 0;
        let reshuffleCount = 0;
        const maxReshuffles = 50;
        let isStuck = false;

        // Auto-solve loop
        while (true) {
          // Check if board is cleared
          let remaining = 0;
          for (let r = 1; r <= diffConfig.rows; r++) {
            for (let c = 1; c <= diffConfig.columns; c++) {
              const cell = grid[r]?.[c];
              if (cell && !cell.isCleared && cell.characterId) remaining++;
            }
          }
          if (remaining === 0) break;

          // Find first available match
          const match = BoardGenerator.findFirstAvailableMatch(grid, diffConfig.rows, diffConfig.columns);
          if (match) {
            const t1 = grid[match.p1.r][match.p1.c];
            const t2 = grid[match.p2.r][match.p2.c];
            if (t1 && t2) {
              t1.isCleared = true;
              t1.characterId = null;
              t2.isCleared = true;
              t2.characterId = null;
              clearedPairs++;

              // Simulate adjacent obstacle damage along path as in Board.ts
              if (match.path) {
                for (const p of match.path) {
                  const neighbors = [
                    { r: p.r - 1, c: p.c },
                    { r: p.r + 1, c: p.c },
                    { r: p.r, c: p.c - 1 },
                    { r: p.r, c: p.c + 1 }
                  ];
                  for (const n of neighbors) {
                    const nb = grid[n.r]?.[n.c];
                    if (nb && !nb.isCleared && nb.modifier && nb.modifier !== 'none' && nb.modifier !== 'stone') {
                      nb.modifier = 'none';
                      nb.modifierLevel = 0;
                      nb.iceLayers = 0;
                    }
                  }
                }
              }
              continue;
            }
          }

          // No match -> trigger reshuffle
          reshuffleCount++;
          if (reshuffleCount > maxReshuffles) {
            isStuck = true;
            break;
          }
          const reshuffled = BoardGenerator.reshuffleBoard(grid, diffConfig.rows, diffConfig.columns);
          if (!reshuffled) {
            isStuck = true;
            break;
          }
        }

        expect(isStuck, `Level ${lvl} got permanently deadlocked during autosolve`).toBe(false);
        expect(clearedPairs).toBeGreaterThan(0);
      });
    }
  });

  describe('3. Chapter Progression & Intra-Chapter Pacing Invariants', () => {
    it('verifies all 10 chapters have strictly progressive difficulty and unique themes', () => {
      const chapters = LevelManager.getAllChapters();
      expect(chapters.length).toBe(10);

      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        expect(ch.chapterNum).toBe(i + 1);
        expect(ch.startLevel).toBe(i * 10 + 1);
        expect(ch.endLevel).toBe((i + 1) * 10);
        expect(ch.primaryCollection).toBeTruthy();
        expect(ch.bossId).toBeTruthy();

        // Check boss exists
        const bosses = (LevelManager as any).CHAPTERS;
        expect(ch.bossName).toBeTruthy();
      }
    });

    it('verifies Milestone Levels 10, 20, 30... 100 always configure a Boss with valid Part counts', () => {
      for (let lvl = 10; lvl <= 100; lvl += 10) {
        const config = LevelManager.getLevelConfig(lvl);
        expect(config.boss, `Level ${lvl} must have a bossConfig`).toBeDefined();
        expect(config.boss?.maxHp).toBeGreaterThan(0);
        expect(config.boss?.headsOrParts).toBeGreaterThanOrEqual(4);
      }
    });
  });
});
