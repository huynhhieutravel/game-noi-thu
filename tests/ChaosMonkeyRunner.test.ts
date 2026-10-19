import { describe, it, expect } from 'vitest';
import { runHeadlessChaosSimulation } from '../src/qa/ChaosMonkeyRunner';
import { BoardGenerator } from '../src/game/BoardGenerator';

describe('Chaos Monkey Resilience & Lifecycle Stress Suite', () => {
  it('must survive 1,000 chaotic rapid actions with 0 errors and 100% parity integrity', () => {
    const result = runHeadlessChaosSimulation(1000);
    expect(result.errors).toEqual([]);
    expect(result.success).toBe(true);
    expect(result.totalActions).toBe(1000);
    expect(result.validMatches).toBeGreaterThan(0);
  });

  it('must withstand extreme modifier pressure without breaking board consistency', () => {
    // Run simulation multiple times with different random seeds
    for (let run = 1; run <= 5; run++) {
      const result = runHeadlessChaosSimulation(300);
      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
    }
  });

  it('must maintain exact character parity after 20 continuous reshuffles', () => {
    const rows = 8;
    const cols = 10;
    const pool = ['kitsune', 'tanuki', 'tengu', 'kappa'];
    const grid = BoardGenerator.generateBoard({ rows, cols, characterPool: pool });

    for (let i = 0; i < 20; i++) {
      BoardGenerator.reshuffleBoard(grid, rows, cols);

      const counts = new Map<string, number>();
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const t = grid[r][c];
          if (t && !t.isCleared && t.characterId) {
            counts.set(t.characterId, (counts.get(t.characterId) || 0) + 1);
          }
        }
      }

      for (const [charId, count] of counts.entries()) {
        expect(count % 2).toBe(0);
      }
    }
  });
});
