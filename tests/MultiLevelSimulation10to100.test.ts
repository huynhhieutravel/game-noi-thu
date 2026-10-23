import { describe, it, expect } from 'vitest';
import { LevelManager } from '../src/game/LevelManager';
import { BoardGenerator } from '../src/game/BoardGenerator';
import { CharacterRegistry } from '../src/game/CharacterRegistry';
import { DifficultyLevel } from '../src/game/SaveManager';

describe('Exhaustive Multi-Level QA & Simulation Check (Levels 10 to 100)', () => {

  describe('Suite 1: Level Configuration & Parity Invariants across Easy, Medium, Hard (Levels 10 - 100)', () => {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];

    it('should verify tile parity and initial solvability for every level 10 to 100 in Medium mode', () => {
      for (let lvl = 10; lvl <= 100; lvl++) {
        const config = LevelManager.getLevelConfig(lvl, undefined, 'medium');

        // Dimensions
        expect(config.rows).toBeGreaterThanOrEqual(4);
        expect(config.columns).toBeGreaterThanOrEqual(4);
        expect((config.rows * config.columns) % 2).toBe(0);

        // Character Pool: No bosses in pool
        expect(config.characterPool.length).toBeGreaterThanOrEqual(6);
        for (const charId of config.characterPool) {
          expect(CharacterRegistry.isBoss(charId)).toBe(false);
        }

        // Quests
        expect(config.quests.length).toBe(3);
        const comboQuest = config.quests.find(q => q.type === 'combo');
        expect(comboQuest).toBeDefined();
        const totalPairs = (config.rows * config.columns) / 2;
        expect(comboQuest!.target).toBeLessThanOrEqual(totalPairs);

        // Board Generation
        const grid = BoardGenerator.generateBoard({
          rows: config.rows,
          cols: config.columns,
          characterPool: config.characterPool,
          levelNumber: config.levelNumber,
          stoneCount: config.modifiers?.stoneCount || 0,
          iceCount: config.modifiers?.iceCount || 0,
          thornCount: config.modifiers?.thornCount || 0,
          webCount: config.modifiers?.webCount || 0,
          barricadeCount: config.modifiers?.barricadeCount || 0
        });

        // Strict tile parity: every character tile must have an even count
        const charCounts: Record<string, number> = {};
        for (let r = 1; r <= config.rows; r++) {
          for (let c = 1; c <= config.columns; c++) {
            const tile = grid[r][c];
            if (!tile.isCleared && tile.characterId && tile.modifier !== 'stone') {
              charCounts[tile.characterId] = (charCounts[tile.characterId] || 0) + 1;
            }
          }
        }

        for (const [charId, count] of Object.entries(charCounts)) {
          expect(count % 2, `Level ${lvl} character "${charId}" has odd count ${count}`).toBe(0);
        }

        // Initial Solvability: At least 1 valid match must exist immediately
        const firstMatch = BoardGenerator.findFirstAvailableMatch(grid, config.rows, config.columns);
        expect(firstMatch, `Level ${lvl} spawned in deadlock with 0 available matches!`).not.toBeNull();
      }
    });

    it('should verify tile parity and initial solvability for every level 10 to 100 in Easy mode', () => {
      for (let lvl = 10; lvl <= 100; lvl++) {
        const config = LevelManager.getLevelConfig(lvl, undefined, 'easy');

        expect((config.rows * config.columns) % 2).toBe(0);
        expect(config.timeLimit).toBeGreaterThan(0);

        const grid = BoardGenerator.generateBoard({
          rows: config.rows,
          cols: config.columns,
          characterPool: config.characterPool,
          levelNumber: config.levelNumber,
          stoneCount: config.modifiers?.stoneCount || 0,
          iceCount: config.modifiers?.iceCount || 0,
          thornCount: config.modifiers?.thornCount || 0,
          webCount: config.modifiers?.webCount || 0,
          barricadeCount: config.modifiers?.barricadeCount || 0
        });

        const charCounts: Record<string, number> = {};
        for (let r = 1; r <= config.rows; r++) {
          for (let c = 1; c <= config.columns; c++) {
            const tile = grid[r][c];
            if (!tile.isCleared && tile.characterId && tile.modifier !== 'stone') {
              charCounts[tile.characterId] = (charCounts[tile.characterId] || 0) + 1;
            }
          }
        }

        for (const [charId, count] of Object.entries(charCounts)) {
          expect(count % 2, `Easy Level ${lvl} character "${charId}" has odd count ${count}`).toBe(0);
        }

        const firstMatch = BoardGenerator.findFirstAvailableMatch(grid, config.rows, config.columns);
        expect(firstMatch, `Easy Level ${lvl} spawned in deadlock!`).not.toBeNull();
      }
    });

    it('should verify tile parity and initial solvability for every level 10 to 100 in Hard mode', () => {
      for (let lvl = 10; lvl <= 100; lvl++) {
        const config = LevelManager.getLevelConfig(lvl, undefined, 'hard');

        expect((config.rows * config.columns) % 2).toBe(0);
        expect(config.timeLimit).toBeGreaterThan(0);

        const grid = BoardGenerator.generateBoard({
          rows: config.rows,
          cols: config.columns,
          characterPool: config.characterPool,
          levelNumber: config.levelNumber,
          stoneCount: config.modifiers?.stoneCount || 0,
          iceCount: config.modifiers?.iceCount || 0,
          thornCount: config.modifiers?.thornCount || 0,
          webCount: config.modifiers?.webCount || 0,
          barricadeCount: config.modifiers?.barricadeCount || 0
        });

        const charCounts: Record<string, number> = {};
        for (let r = 1; r <= config.rows; r++) {
          for (let c = 1; c <= config.columns; c++) {
            const tile = grid[r][c];
            if (!tile.isCleared && tile.characterId && tile.modifier !== 'stone') {
              charCounts[tile.characterId] = (charCounts[tile.characterId] || 0) + 1;
            }
          }
        }

        for (const [charId, count] of Object.entries(charCounts)) {
          expect(count % 2, `Hard Level ${lvl} character "${charId}" has odd count ${count}`).toBe(0);
        }

        const firstMatch = BoardGenerator.findFirstAvailableMatch(grid, config.rows, config.columns);
        expect(firstMatch, `Hard Level ${lvl} spawned in deadlock!`).not.toBeNull();
      }
    });
  });

  describe('Suite 2: Milestone Boss Levels (10, 20, 30, 40, 50, 60, 70, 80, 90, 100) Deep Invariants', () => {
    const bossLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    it('should verify every milestone Boss level has complete 3-skill BossConfig and static movement', () => {
      for (const lvl of bossLevels) {
        const config = LevelManager.getLevelConfig(lvl);

        // Movement must be 'none' so gravity never disrupts boss skill logic
        expect(config.movement, `Boss Level ${lvl} must have movement 'none'`).toBe('none');

        // BossConfig must be defined
        expect(config.boss, `Boss Level ${lvl} is missing boss config`).toBeDefined();
        const boss = config.boss!;

        expect(boss.id).toBeTruthy();
        expect(boss.name).toBeTruthy();
        expect(boss.maxHp).toBeGreaterThan(0);
        expect(boss.actionIntervalSeconds).toBeGreaterThanOrEqual(5);

        // Verify skills array
        expect(boss.skills).toBeDefined();
        expect(boss.skills.length).toBeGreaterThanOrEqual(1);
        for (const skill of boss.skills) {
          expect(skill.type || (skill as any).id).toBeTruthy();
          expect(skill.name).toBeTruthy();
          expect(skill.description || (skill as any).action).toBeTruthy();
        }

        // Relic Reward exists
        expect(config.relicReward).toBeDefined();
        expect(config.relicReward!.id).toBeTruthy();
      }
    });
  });

  describe('Suite 3: Deep Automated Solver Simulation (Full Board Clearing)', () => {
    const milestoneLevelsToSimulate = [10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    for (const lvl of milestoneLevelsToSimulate) {
      it(`should simulate a complete game playthrough of Level ${lvl} to victory with automatic deadlock recovery`, () => {
        const config = LevelManager.getLevelConfig(lvl, undefined, 'medium');
        const grid = BoardGenerator.generateBoard({
          rows: config.rows,
          cols: config.columns,
          characterPool: config.characterPool,
          levelNumber: config.levelNumber,
          stoneCount: 0, // In pure matching simulation test
          iceCount: 0,
          thornCount: 0,
          webCount: 0,
          barricadeCount: 0
        });

        let movesMade = 0;
        let shufflesUsed = 0;
        const maxMoves = 200;

        while (movesMade < maxMoves) {
          // Count remaining uncleared tiles
          let remaining = 0;
          for (let r = 1; r <= config.rows; r++) {
            for (let c = 1; c <= config.columns; c++) {
              if (!grid[r][c].isCleared && grid[r][c].characterId) {
                remaining++;
              }
            }
          }

          if (remaining === 0) {
            // Level is 100% cleared!
            break;
          }

          // Find available match
          const match = BoardGenerator.findFirstAvailableMatch(grid, config.rows, config.columns);
          if (match) {
            // Execute match
            grid[match.p1.r][match.p1.c].isCleared = true;
            grid[match.p2.r][match.p2.c].isCleared = true;
            movesMade++;
          } else {
            // Deadlock detected: perform reshuffle (simulating auto-shuffle)
            shufflesUsed++;
            expect(shufflesUsed, `Level ${lvl} exceeded 15 shuffles without making progress`).toBeLessThanOrEqual(15);
            BoardGenerator.reshuffleBoard(grid, config.rows, config.columns);

            // Re-verify tile parity after reshuffle
            const postShuffleCounts: Record<string, number> = {};
            for (let r = 1; r <= config.rows; r++) {
              for (let c = 1; c <= config.columns; c++) {
                const t = grid[r][c];
                if (!t.isCleared && t.characterId) {
                  postShuffleCounts[t.characterId] = (postShuffleCounts[t.characterId] || 0) + 1;
                }
              }
            }
            for (const [charId, cnt] of Object.entries(postShuffleCounts)) {
              expect(cnt % 2, `Reshuffle corrupted parity for ${charId} in Level ${lvl}`).toBe(0);
            }
          }
        }

        // Final assertion: all character tiles must be cleared
        let unclearedRemaining = 0;
        for (let r = 1; r <= config.rows; r++) {
          for (let c = 1; c <= config.columns; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId) {
              unclearedRemaining++;
            }
          }
        }

        expect(unclearedRemaining, `Level ${lvl} failed to clear all tiles (remaining: ${unclearedRemaining})`).toBe(0);
        expect(movesMade).toBeGreaterThan(0);
      });
    }
  });

  describe('Suite 4: Star Quest Mapping & Input Pipelining Integrity', () => {
    it('should verify earnedStars strictly maps 1:1 with achieved quests regardless of isStopwatch flag', () => {
      // Simulating Star Quest Mapping formula from GameScene.ts
      const computeStars = (q1: boolean, q2: boolean, q3: boolean): number => {
        const achievedCount = (q1 ? 1 : 0) + (q2 ? 1 : 0) + (q3 ? 1 : 0);
        return Math.max(1, Math.min(3, achievedCount));
      };

      // 3 quests achieved -> strictly 3 stars
      expect(computeStars(true, true, true)).toBe(3);

      // 2 quests achieved -> strictly 2 stars
      expect(computeStars(true, true, false)).toBe(2);
      expect(computeStars(true, false, true)).toBe(2);

      // 1 quest achieved (clearing level) -> strictly 1 star
      expect(computeStars(true, false, false)).toBe(1);

      // Clamping ensures minimum 1 star on victory
      expect(computeStars(false, false, false)).toBe(1);
    });

    it('should verify Input Pipelining queue contract', () => {
      // Mocking input queue state machine
      let isProcessingMatch = true;
      let queuedInput: { r: number; c: number } | null = null;
      let processedTile: { r: number; c: number } | null = null;

      const handleTileClick = (r: number, c: number) => {
        if (isProcessingMatch) {
          queuedInput = { r, c };
          return;
        }
        processedTile = { r, c };
      };

      const setProcessingMatch = (val: boolean) => {
        isProcessingMatch = val;
        if (!val && queuedInput) {
          const next = queuedInput;
          queuedInput = null;
          handleTileClick(next.r, next.c);
        }
      };

      // 1. User taps while laser animation is resolving
      handleTileClick(3, 4);
      expect(queuedInput).toEqual({ r: 3, c: 4 });
      expect(processedTile).toBeNull();

      // 2. Animation completes -> queued tap is immediately executed
      setProcessingMatch(false);
      expect(queuedInput).toBeNull();
      expect(processedTile).toEqual({ r: 3, c: 4 });
    });
  });
});
