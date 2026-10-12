import { describe, it, expect } from 'vitest';
import { BoardGenerator } from '../src/game/BoardGenerator';

describe('BoardGenerator', () => {
  const characterPool = [
    'kasa_obake',
    'nurikabe',
    'fukurokuju',
    'aka_oni',
    'azuki_arai',
    'konaki_jiji'
  ];

  it('should generate a board with correct padded dimensions', () => {
    const rows = 4;
    const cols = 6;
    const grid = BoardGenerator.generateBoard({
      rows,
      cols,
      characterPool
    });

    // Rows and columns must be padded with 1 boundary on each side
    expect(grid.length).toBe(rows + 2);
    for (let r = 0; r <= rows + 1; r++) {
      expect(grid[r].length).toBe(cols + 2);
    }
  });

  it('should guarantee Tile Parity (every active character has an even count)', () => {
    const rows = 6;
    const cols = 6;
    const grid = BoardGenerator.generateBoard({
      rows,
      cols,
      characterPool
    });

    const counts: Record<string, number> = {};
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const cell = grid[r][c];
        if (!cell.isCleared && cell.characterId) {
          counts[cell.characterId] = (counts[cell.characterId] || 0) + 1;
        }
      }
    }

    // Every character must have an strictly even number of tiles
    for (const [charId, count] of Object.entries(counts)) {
      expect(count % 2, `Character ${charId} has odd count: ${count}`).toBe(0);
    }
  });

  it('should preserve Tile Parity when stone obstacles are placed', () => {
    const rows = 6;
    const cols = 6;
    const stoneCount = 4;
    const grid = BoardGenerator.generateBoard({
      rows,
      cols,
      characterPool,
      stoneCount
    });

    const counts: Record<string, number> = {};
    let actualStones = 0;

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const cell = grid[r][c];
        if (cell.modifier === 'stone') {
          actualStones++;
        } else if (!cell.isCleared && cell.characterId) {
          counts[cell.characterId] = (counts[cell.characterId] || 0) + 1;
        }
      }
    }

    expect(actualStones).toBe(stoneCount);

    for (const [charId, count] of Object.entries(counts)) {
      expect(count % 2, `Character ${charId} with stones has odd count: ${count}`).toBe(0);
    }
  });

  it('should guarantee a solvable initial board with at least 1 valid move', () => {
    const rows = 4;
    const cols = 6;
    const grid = BoardGenerator.generateBoard({
      rows,
      cols,
      characterPool
    });

    const match = BoardGenerator.findFirstAvailableMatch(grid, rows, cols);
    expect(match).not.toBeNull();
  });
});
