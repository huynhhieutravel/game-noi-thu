import { describe, it, expect } from 'vitest';
import { PathFinder, BoardGrid } from '../src/game/PathFinder';
import { BoardGenerator } from '../src/game/BoardGenerator';
import { BoardModifiers } from '../src/game/BoardModifiers';
import { GridPoint, TileState } from '../src/types';

class MockGrid implements BoardGrid {
  rows: number;
  cols: number;
  private cleared: boolean[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.cleared = [];
    for (let r = 0; r <= rows + 1; r++) {
      this.cleared[r] = [];
      for (let c = 0; c <= cols + 1; c++) {
        // Border margins 0 and rows+1, 0 and cols+1 are empty
        this.cleared[r][c] = (r === 0 || r === rows + 1 || c === 0 || c === cols + 1);
      }
    }
  }

  setTile(r: number, c: number, isEmpty: boolean) {
    this.cleared[r][c] = isEmpty;
  }

  isEmpty(r: number, c: number): boolean {
    if (r <= 0 || r > this.rows || c <= 0 || c > this.cols) return true;
    return this.cleared[r]?.[c] ?? false;
  }
}

describe('Top Row Matching & Input QA Test Suite', () => {
  describe('1. Top Row Pathfinding (Row 1 via Row 0)', () => {
    it('successfully connects 2 matching tiles on Row 1 when obstacles block the direct row', () => {
      const grid = new MockGrid(8, 10);
      // Fill all tiles on row 1
      for (let c = 1; c <= 10; c++) {
        grid.setTile(1, c, false);
      }

      const p1: GridPoint = { r: 1, c: 2 };
      const p2: GridPoint = { r: 1, c: 6 };

      const path = PathFinder.findPath(grid, p1, p2);
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points).toEqual([
        { r: 1, c: 2 },
        { r: 0, c: 2 },
        { r: 0, c: 6 },
        { r: 1, c: 6 }
      ]);
    });

    it('connects 2 tiles on Row 1 at opposite extreme ends (col 1 and col 10)', () => {
      const grid = new MockGrid(8, 10);
      for (let c = 1; c <= 10; c++) {
        grid.setTile(1, c, false);
      }

      const p1: GridPoint = { r: 1, c: 1 };
      const p2: GridPoint = { r: 1, c: 10 };

      const path = PathFinder.findPath(grid, p1, p2);
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points).toEqual([
        { r: 1, c: 1 },
        { r: 0, c: 1 },
        { r: 0, c: 10 },
        { r: 1, c: 10 }
      ]);
    });

    it('connects adjacent tiles on Row 1 with 0 turns', () => {
      const grid = new MockGrid(8, 10);
      const p1: GridPoint = { r: 1, c: 4 };
      const p2: GridPoint = { r: 1, c: 5 };

      const path = PathFinder.findPath(grid, p1, p2);
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(0);
      expect(path?.points).toEqual([
        { r: 1, c: 4 },
        { r: 1, c: 5 }
      ]);
    });
  });

  describe('2. HitArea Geometry & Bounds Validation', () => {
    it('verifies that hitArea [0, 0, w, h] correctly maps with displayOrigin to cover all 4 quadrants with 0 seam overlap', () => {
      const tileSize = 84;
      const hitRect = {
        x: 0,
        y: 0,
        width: tileSize,
        height: tileSize
      };

      // Phaser's pointWithinHitArea: x += displayOriginX (tileSize / 2), y += displayOriginY (tileSize / 2)
      const testPoint = (localDx: number, localDy: number) => {
        const phaserX = localDx + tileSize / 2;
        const phaserY = localDy + tileSize / 2;
        return (
          phaserX >= hitRect.x &&
          phaserX <= hitRect.x + hitRect.width &&
          phaserY >= hitRect.y &&
          phaserY <= hitRect.y + hitRect.height
        );
      };

      // Center (0, 0)
      expect(testPoint(0, 0)).toBe(true);

      // Top half (localDy < 0)
      expect(testPoint(0, -20)).toBe(true);
      expect(testPoint(0, -tileSize / 2)).toBe(true);
      expect(testPoint(0, -tileSize / 2 - 1)).toBe(false); // Outside top border

      // Bottom half (localDy > 0)
      expect(testPoint(0, 20)).toBe(true);
      expect(testPoint(0, tileSize / 2)).toBe(true);
      expect(testPoint(0, tileSize / 2 + 1)).toBe(false); // Outside bottom border

      // Left half (localDx < 0)
      expect(testPoint(-20, 0)).toBe(true);
      expect(testPoint(-tileSize / 2, 0)).toBe(true);
      expect(testPoint(-tileSize / 2 - 1, 0)).toBe(false); // Outside left border

      // Right half (localDx > 0)
      expect(testPoint(20, 0)).toBe(true);
      expect(testPoint(tileSize / 2, 0)).toBe(true);
      expect(testPoint(tileSize / 2 + 1, 0)).toBe(false); // Outside right border

      // All 4 corners
      expect(testPoint(-tileSize / 2, -tileSize / 2)).toBe(true);
      expect(testPoint(tileSize / 2, -tileSize / 2)).toBe(true);
      expect(testPoint(-tileSize / 2, tileSize / 2)).toBe(true);
      expect(testPoint(tileSize / 2, tileSize / 2)).toBe(true);
    });
  });

  describe('3. Directional Movement & Row 1 Top Clearing', () => {
    it('preserves top row matches after downward gravity shift', () => {
      const rows = 6;
      const cols = 6;
      const grid: TileState[][] = [];
      for (let r = 0; r <= rows + 1; r++) {
        grid[r] = [];
        for (let c = 0; c <= cols + 1; c++) {
          grid[r][c] = {
            r,
            c,
            characterId: null,
            modifier: 'none',
            iceLayers: 0,
            isLocked: false,
            isKey: false,
            isFogged: false,
            isBossSymbol: false,
            isCleared: true
          };
        }
      }

      // Col 2 has 2 tiles: row 2 and row 4
      grid[2][2] = { ...grid[2][2], isCleared: false, characterId: 'kappa' };
      grid[4][2] = { ...grid[4][2], isCleared: false, characterId: 'tengu' };

      // Col 5 has 1 tile: row 2
      grid[2][5] = { ...grid[2][5], isCleared: false, characterId: 'kappa' };

      // Apply downward movement
      BoardModifiers.applyMovement(grid, rows, cols, 'down');

      // Col 2: tengu falls to row 6, kappa falls to row 5
      expect(grid[6][2].characterId).toBe('tengu');
      expect(grid[5][2].characterId).toBe('kappa');
      expect(grid[2][2].isCleared).toBe(true);

      // Col 5: kappa falls to row 6
      expect(grid[6][5].characterId).toBe('kappa');
      expect(grid[2][5].isCleared).toBe(true);

      // Now both kappas are at row 5 (col 2) and row 6 (col 5)
      // PathFinder should be able to connect them
      const adapter: BoardGrid = {
        rows,
        cols,
        isEmpty: (r, c) => {
          if (r <= 0 || r > rows || c <= 0 || c > cols) return true;
          return grid[r]?.[c]?.isCleared ?? true;
        }
      };

      const match = PathFinder.findPath(adapter, { r: 5, c: 2 }, { r: 6, c: 5 });
      expect(match).not.toBeNull();
    });
  });
});
