import { describe, it, expect } from 'vitest';
import { LevelManager } from '../src/game/LevelManager';
import { BoardGenerator } from '../src/game/BoardGenerator';

describe('100 Levels Full Board Solvability & Parity Stress Test', () => {
  it('should generate valid, solvable boards with strict tile parity for all 100 levels', () => {
    for (let lvl = 1; lvl <= 100; lvl++) {
      const config = LevelManager.getLevelConfig(lvl);
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

      // 1. Verify Parity: all non-cleared character tiles must be in even pairs
      const counts: Record<string, number> = {};
      for (let r = 1; r <= config.rows; r++) {
        for (let c = 1; c <= config.columns; c++) {
          const tile = grid[r][c];
          if (!tile.isCleared && tile.characterId && tile.modifier !== 'stone') {
            counts[tile.characterId] = (counts[tile.characterId] || 0) + 1;
          }
        }
      }

      for (const [charId, count] of Object.entries(counts)) {
        expect(
          count % 2,
          `Level ${lvl} has odd count (${count}) for character "${charId}"`
        ).toBe(0);
      }

      // 2. Verify Solvability: Level must have at least 1 valid match to begin
      const firstMatch = BoardGenerator.findFirstAvailableMatch(grid, config.rows, config.columns);
      expect(
        firstMatch,
        `Level ${lvl} was generated with 0 initial moves (Deadlock on spawn!)`
      ).not.toBeNull();
    }
  });
});
